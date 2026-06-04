# Generate TEST version with safety features
python -m bionicscam.safe_test_mode samples/sample_part.dxf test_safe.gcode --thickness 0.25

# This automatically:
# ✓ Disables spindle (M3 → M5)
# ✓ Raises tool 2" above all operations
# ✓ Creates a safety checklist