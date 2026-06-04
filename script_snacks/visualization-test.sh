# Generate your G-code
python -m bionicscam.postprocessor sample_junk_drawer/sample_part.dxf sample_junk_drawer/test.gcode --thickness 0.25

# Upload test.gcode to NCViewer.com
# Look for: unexpected moves, crashes, tab locations