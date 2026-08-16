# Infrastructure Notes

This folder contains local helper scripts and infrastructure-related project files for Workforce ERP.

## Current contents

- `scripts/`: local setup, cleanup, and stop helpers
- `docker/`: container-related scaffolding
- `nginx/`: reverse-proxy and hosting scaffolding

## Local helper scripts

The root workspace commands call the PowerShell scripts in `infra/scripts/`.

### Setup

Windows workspace command:

```powershell
pnpm setup
```

macOS/Linux equivalent:

```bash
./infra/scripts/setup.sh
```

Scripts:

- `infra/scripts/setup.ps1`
- `infra/scripts/setup.sh`

Purpose:

- verify local prerequisites such as `node` and `pnpm`
- install workspace dependencies

### Clean

Used by:

```bash
pnpm clean
```

Script:

- `infra/scripts/clean.ps1`
- `infra/scripts/clean.sh`

Purpose:

- remove workspace build artifacts
- remove generated install output such as local `node_modules`
- reset the workspace to a cleaner local state

### Stop

Used by:

```bash
pnpm stop
```

Script:

- `infra/scripts/stop.ps1`
- `infra/scripts/stop.sh`

Purpose:

- stop local dev servers running on the workspace ports

Current ports:

- `5173`: web
- `5174`: portal
- `5175`: admin

## Notes

- The PowerShell scripts are the ones used directly by the root `package.json` commands.
- Shell script variants exist for environments where the team wants equivalent non-PowerShell helpers.
- Deployment-related files in this folder are still scaffold-level and are not yet a finalized production setup.
