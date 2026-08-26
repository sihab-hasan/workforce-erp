import { builtinModules } from "node:module";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const workspaceRoots = ["apps", "packages", "services", "tooling"];
const manifests = new Map();
const builtins = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`)]);
const extensions = ["", ".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs", ".css"];

for (const workspaceRoot of workspaceRoots) {
  const abs = join(root, workspaceRoot);
  for (const name of readdirSync(abs)) {
    if (workspaceRoot === "apps" && name === "api") continue;
    const dir = join(abs, name);
    const manifestPath = join(dir, "package.json");
    if (!statSync(dir).isDirectory() || !existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifests.set(manifest.name, { dir, manifest });
  }
}

const errors = [];
const sourceExtensions = /\.(?:[cm]?[jt]sx?|css)$/;
const importPattern = /(?:from\s+|import\s*\(?\s*|@import\s+)["']([^"']+)["']/g;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (["node_modules", "dist", ".nx"].includes(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (sourceExtensions.test(entry)) files.push(path);
  }
  return files;
}

function pathExists(base) {
  if (
    extensions.some((extension) => existsSync(`${base}${extension}`)) ||
    extensions.slice(1).some((extension) => existsSync(join(base, `index${extension}`)))
  ) {
    return true;
  }

  // ESM TypeScript commonly imports `./file.js` while the source file is `file.ts`.
  const sourceForRuntimeExtension = base.match(/^(.*)\.(?:mjs|cjs|js|jsx)$/)?.[1];
  return sourceForRuntimeExtension
    ? [".ts", ".tsx", ".mts", ".cts"].some((extension) =>
        existsSync(`${sourceForRuntimeExtension}${extension}`),
      )
    : false;
}

function exported(manifest, subpath) {
  const exportsField = manifest.exports;
  if (!subpath) {
    if (typeof exportsField === "string") return true;
    return Boolean(exportsField?.["."] ?? manifest.main ?? manifest.types);
  }
  if (!exportsField || typeof exportsField !== "object" || Array.isArray(exportsField))
    return false;
  const key = `./${subpath}`;
  if (exportsField[key]) return true;
  return Object.keys(exportsField).some((pattern) => {
    if (!pattern.includes("*")) return false;
    const [before, after = ""] = pattern.split("*");
    return key.startsWith(before) && key.endsWith(after);
  });
}

function packageNameOf(specifier) {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  return specifier.split("/")[0];
}

function resolvePrivateImport(owner, specifier) {
  for (const [pattern, target] of Object.entries(owner.manifest.imports ?? {})) {
    if (!pattern.includes("*")) {
      if (pattern === specifier) return resolve(owner.dir, target);
      continue;
    }
    const [before, after = ""] = pattern.split("*");
    if (!specifier.startsWith(before) || !specifier.endsWith(after)) continue;
    const value = specifier.slice(before.length, specifier.length - after.length || undefined);
    return resolve(owner.dir, target.replace("*", value));
  }
  return null;
}

for (const [ownerName, owner] of manifests) {
  const { dir, manifest } = owner;
  const declared = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies,
    ...manifest.optionalDependencies,
  };
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(importPattern)) {
      const specifier = match[1];
      if (specifier.startsWith("@workspace/")) {
        errors.push(`${relative(root, file)}: legacy namespace ${specifier}`);
        continue;
      }
      if (specifier.startsWith("@/")) {
        errors.push(
          `${relative(root, file)}: legacy @/ alias ${specifier}; use a package-private # alias`,
        );
        continue;
      }
      if (specifier.startsWith(".")) {
        if (!pathExists(resolve(dirname(file), specifier)))
          errors.push(`${relative(root, file)}: unresolved relative import ${specifier}`);
        continue;
      }
      if (specifier.startsWith("#")) {
        const target = resolvePrivateImport(owner, specifier);
        if (!target)
          errors.push(
            `${relative(root, file)}: ${specifier} is not declared in package.json imports`,
          );
        else if (!pathExists(target))
          errors.push(
            `${relative(root, file)}: ${specifier} maps to missing ${relative(root, target)}`,
          );
        continue;
      }
      if (specifier.startsWith("@workforce-erp/")) {
        const parts = specifier.split("/");
        const packageName = `${parts[0]}/${parts[1]}`;
        const subpath = parts.slice(2).join("/");
        const target = manifests.get(packageName);
        if (!target) {
          errors.push(`${relative(root, file)}: unknown workspace package ${packageName}`);
          continue;
        }
        if (packageName !== ownerName && !declared[packageName])
          errors.push(
            `${relative(root, file)}: ${packageName} is imported but not declared in ${ownerName}`,
          );
        if (!exported(target.manifest, subpath))
          errors.push(
            `${relative(root, file)}: ${specifier} is not a public export of ${packageName}`,
          );
        continue;
      }
      const packageName = packageNameOf(specifier);
      if (!builtins.has(packageName) && !builtins.has(specifier) && !declared[packageName]) {
        errors.push(
          `${relative(root, file)}: external package ${packageName} is imported but not declared in ${ownerName}`,
        );
      }
    }
  }
}

for (const [name, { dir, manifest }] of manifests) {
  const exportsField = manifest.exports;
  const entries =
    typeof exportsField === "string"
      ? [[".", exportsField]]
      : exportsField && typeof exportsField === "object" && !Array.isArray(exportsField)
        ? Object.entries(exportsField)
        : [];

  for (const [key, target] of entries) {
    if (typeof target !== "string") continue;
    const concrete = target.includes("*") ? null : resolve(dir, target);
    if (concrete && !existsSync(concrete)) {
      errors.push(`${name}: export ${key} targets missing ${target}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Import/export policy valid across ${manifests.size} apps/packages.`);
