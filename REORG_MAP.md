# BionicsCAM Repo Reorg Map

The repo got cleaned up without removing the chaos entirely. Chaos is load-bearing.

## New folders

| Folder | What lives there |
|---|---|
| `bionicscam/` | Core Python app code: Flask app, postprocessor, config, metrics |
| `bionicscam/integrations/` | Onshape, Google Drive, and auth integration goblins |
| `web_goblin/` | Browser stuff: templates, CSS, JS, logos, static docs |
| `config_cave/` | Local JSON config files |
| `script_snacks/` | Helper scripts, debug scripts, batch scripts |
| `sample_junk_drawer/` | Sample DXFs, generated G-code examples, self-test files |
| `docs/` | Human-readable docs, allegedly |
| `tests/` | Unit tests and regression traps |

## Main entrypoints

- Local GUI: `./start_gui.sh`
- Python module app: `python3 -m bionicscam.app_server`
- Deployment entrypoint: `app.py`
- Postprocessor CLI: `python3 -m bionicscam.postprocessor input.dxf output.gcode ...`

## Why the funny names?

Because if a folder is going to contain JavaScript, HTML, CSS, logos, static docs, and mysterious browser rituals, `web_goblin/` is more honest than `frontend/`.
