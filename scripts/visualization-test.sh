# Generate your G-code
python -m bionicscam.frc_cam_postprocessor samples/sample_part.dxf test.gcode --thickness 0.25

# Upload test.gcode to NCViewer.com
# Look for: unexpected moves, crashes, tab locations