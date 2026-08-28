#!/usr/bin/env python3
"""Dependency-free security/release source checks for Workforce ERP.
This complements (does not replace) Composer/PHPUnit/pnpm/Docker release gates.
"""
from pathlib import Path
import json, re, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
errors=[]

def fail(msg): errors.append(msg)
def files(*roots, exts=None):
    for root in roots:
        base=ROOT/root
        if not base.exists(): continue
        for p in base.rglob('*'):
            if p.is_file() and (exts is None or p.suffix in exts):
                if any(x in p.parts for x in ('node_modules','vendor','dist','build','.nx','.git')): continue
                yield p

def text(p):
    try:return p.read_text(encoding='utf-8',errors='ignore')
    except Exception:return ''

active=list(files('apps','packages','services','tooling',exts={'.php','.ts','.tsx','.js','.jsx','.mjs','.cjs'}))
joined='\n'.join(text(p) for p in active)
empty=[str(p.relative_to(ROOT)) for p in active if p.stat().st_size == 0]
if empty: fail(f'Empty active source files: {empty[:20]}')
for label,rx in {
    'Passkey/WebAuthn':r'(?i)\b(passkeys?|webauthn)\b',
    'Recovery Code':r'(?i)\brecovery[ _-]?codes?\b',
    'generated placeholder':r'generated architecture placeholder',
    'ROLE_CAPABILITIES authorization map':r'\bROLE_CAPABILITIES\b',
}.items():
    hits=[str(p.relative_to(ROOT)) for p in active if re.search(rx,text(p))]
    if hits: fail(f'{label} active references: {hits[:10]}')

# Browser routes must be canonical; API /api/v1/auth/* is intentionally allowed.
legacy=re.compile(r'''["'`](/auth/(?:sign-in|sign-up|login|register|forgot-password|callback(?:/[^"'`]*)?))["'`]''')
for p in active:
    for m in legacy.finditer(text(p)):
        fail(f'Legacy browser auth route {m.group(1)} in {p.relative_to(ROOT)}')

# Never persist browser auth tokens in localStorage.
for p in active:
    s=text(p)
    if 'localStorage' in s and re.search(r'(?i)(token|authorization|bearer|auth)',s):
        # theme/preferences files are allowed only if they do not store auth material.
        calls=' '.join(re.findall(r'localStorage\.(?:setItem|getItem|removeItem)\([^\n;]+',s))
        if re.search(r'(?i)(token|authorization|bearer|access[_-]?token|refresh[_-]?token)',calls):
            fail(f'Auth token localStorage use in {p.relative_to(ROOT)}')

# Password policy: passphrase length/compromised check, no arbitrary composition rules.
for rel in ['apps/api/app/Http/Requests/Auth/RegisterRequest.php','apps/api/app/Http/Requests/Auth/ResetPasswordRequest.php','apps/api/app/Http/Requests/Auth/ChangePasswordRequest.php']:
    p=ROOT/rel; s=text(p)
    if 'Password::min(12)' not in s: fail(f'{rel}: password minimum is not 12+')
    if any(x in s for x in ('->mixedCase()','->numbers()','->symbols()')): fail(f'{rel}: arbitrary password composition policy found')

# Composer target must match Laravel 13 target.
composer=ROOT/'apps/api/composer.json'
try:
    c=json.loads(text(composer))
    if not str(c.get('require',{}).get('laravel/framework','')).startswith('^13.'):
        fail('apps/api/composer.json does not target Laravel 13')
    if not str(c.get('require',{}).get('php','')).startswith('^8.3'):
        fail('apps/api/composer.json does not target PHP 8.3+')
except Exception as e: fail(f'composer.json invalid: {e}')

# Route controller/method check without booting Laravel.
routes=text(ROOT/'apps/api/routes/api.php')
controllers={p.stem:p for p in (ROOT/'apps/api/app/Http/Controllers/Api/v1').glob('*.php')}
for cls,method in re.findall(r'\[([A-Za-z0-9_]+)::class\s*,\s*["\']([A-Za-z0-9_]+)["\']\]',routes):
    p=controllers.get(cls)
    if not p: fail(f'Route controller missing: {cls}')
    elif not re.search(r'\bfunction\s+'+re.escape(method)+r'\s*\(',text(p)):
        fail(f'Route controller method missing: {cls}::{method}')

# Backend permission catalog + platform permission catalog must cover frontend UX checks.
migration=text(ROOT/'apps/api/database/migrations/2026_08_27_100000_complete_authentication_security_architecture.php')
match=re.search(r'\$permissions\s*=\s*\[(.*?)\];',migration,re.S)
catalog=set(re.findall(r"['\"]([a-z][a-z0-9_]*\.[a-z0-9_.]+)['\"]",match.group(1) if match else ''))
security=text(ROOT/'apps/api/config/security.php')
platform=set(re.findall(r"['\"]((?:platform\.)[a-z0-9_.]+)['\"]",security))
known=catalog|platform
front=set()
prefixes={x.split('.',1)[0] for x in known}
for p in files('apps/erp/src','apps/admin/src',exts={'.ts','.tsx'}):
    s=text(p)
    for candidate in re.findall(r'["\']([a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+)["\']',s):
        if candidate.split('.',1)[0] in prefixes:
            front.add(candidate)
unknown=sorted(x for x in front if x not in known)
if unknown: fail(f'Frontend permission keys absent from backend catalog: {unknown}')

# Production sample must be secure/fail-closed.
prod=text(ROOT/'.env.docker.production.example')
for required in ['APP_ENV=production','APP_DEBUG=false','SESSION_DRIVER=database','SESSION_SECURE_COOKIE=true','HASH_DRIVER=argon2id','SMS_DRIVER=http']:
    if required not in prod: fail(f'Production environment sample missing {required}')

if errors:
    print('SECURITY SOURCE CHECK: FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('SECURITY SOURCE CHECK: PASSED')
print(f'Active source files scanned: {len(active)}')
print(f'Backend permission keys: {len(catalog)}; platform permission keys: {len(platform)}; frontend checked keys: {len(front)}')
