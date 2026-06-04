# Generate TEST version with safety features
python -m script_snacks.safe_test_mode sample_junk_drawer/sample_part.dxf sample_junk_drawer/test_safe.gcode --thickness 0.25

# This automatically:
# ✓ Disables spindle (M3 → M5)
# ✓ Raises tool 2" above all operations
# ✓ Creates a safety checklist