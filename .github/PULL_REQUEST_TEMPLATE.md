## Summary

Describe what changed and why.

## Branch policy

- [ ] Normal feature/fix/chore PRs target `develop`
- [ ] Release PRs target `main` and come from `develop`
- [ ] Direct feature work is not merged into `main`
- [ ] Emergency hotfixes merged to `main` are also merged/backported to `develop`

## Validation

- [ ] `pnpm validate`
- [ ] `pnpm check:imports`
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Laravel API tests pass when API code changed
- [ ] No secrets, generated files, or local environment files are included
