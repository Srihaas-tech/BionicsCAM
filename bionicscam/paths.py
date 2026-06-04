"""Shared project paths so moved folders do not become haunted."""
from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_DIR.parent
WEB_DIR = PROJECT_ROOT / "web_goblin"
CONFIG_DIR = PROJECT_ROOT / "config_cave"
SAMPLE_DIR = PROJECT_ROOT / "sample_junk_drawer"
SCRIPT_DIR = PROJECT_ROOT / "script_snacks"
