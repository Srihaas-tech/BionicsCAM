"""
Deployment entrypoint for BionicsCAM.

The real Flask app lives in bionicscam.app_server now; this tiny launcher
keeps Vercel/Gunicorn and old habits from exploding.
"""

from bionicscam.app_server import app

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 6238))
    app.run(host='0.0.0.0', port=port, debug=True)
