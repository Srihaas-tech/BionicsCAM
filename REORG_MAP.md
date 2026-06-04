# Repository Layout

The repo was reorganized with normal folder names and without the goblin folder names.

## Root

- `app.py` - deployment/local Flask entrypoint
- `requirements*.txt` - Python dependencies
- `README.md`, `ROADMAP.md`, `LICENSE.txt`, `CLAUDE.md` - docs/meta files

## Folders

- `bionicscam/` - main Python application code
- `bionicscam/integrations/` - Onshape, Google Drive, and auth integrations
- `web/templates/` - Flask HTML templates
- `web/static/` - browser JavaScript, CSS, logo assets, EULA
- `config/` - local JSON config files
- `scripts/` - helper scripts, launchers, debug scripts, batch scripts
- `samples/` - sample DXF, G-code, and machine self-test files
- `deployment/` - deployment-related files
- `docs/` - project documentation
- `tests/` - automated tests

## New run command

From the repo root:

```bash
./scripts/start_gui.sh
```

Or directly:

```bash
python3 -m bionicscam.frc_cam_gui_app
```
