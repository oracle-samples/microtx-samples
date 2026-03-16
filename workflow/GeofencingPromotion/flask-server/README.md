# Flask Geofenced Promotion Server

A demo Flask web app with a phone-like UI and interactive map for publishing geofence events and polling notifications from an Oracle TxEventQ backend.

---

## Prerequisites

- Python **3.11+** (or at minimum 3.8+)
- An Oracle Database with **TxEventQ / AQ** enabled
- Oracle Wallet and DB access

---

## Setup: Create & Activate Virtual Environment

From the `flask-server` directory (or repo root):

```bash
mkdir -p .venv
python3 -m venv .venv
source .venv/bin/activate
```

---

## Install Dependencies

```bash
python3 -m pip install --upgrade pip
pip3 install -r requirements.txt
```

---

## Configuration

Copy or create your config file:

```text
flask-server/config.toml
```

- You can start from the provided template: `server/config.toml.example`
- Edit connection, Oracle, and app parameters as needed.

---

## Running the Flask Server

```bash
export FLASK_ENV=development  # optional, for autoreload
python3 app.py
```

- The server will start on [http://localhost:8800](http://localhost:8800)
- The application runs a background daemon to poll for notifications every 60 seconds.

---

## Using the Application

- Open your browser and go to [http://localhost:8800](http://localhost:8800)
- The left panel will show a placeholder map (replace with a real Folium/Leaflet map as needed).
- The right panel displays a phone UI, notifications, and event banners.

---

## Publishing Events

- When you "publish" a geofence event (simulated via endpoint), the banner will be shown and the notification store updated.
- The server polls the database on a background thread every 60 seconds and updates UI for new notifications.

---

## Customization

- Edit `templates/index.html` for the phone UI and notification banner.
- To change polling interval, edit the `interval` value in `db_poll_thread` in `app.py`.
- Update endpoints for AJAX/REST as needed for true interactive map and custom event publishing.

---

## Production Tips

- Run Flask with `gunicorn` or a production WSGI server for deployment.
- Set secure config/environment for Oracle passwords and secrets.

---

## Troubleshooting

- Ensure Oracle client/network config matches your environment.
- Check logs printed to the Flask console for database errors.
- Restart server after making changes to configuration.

---

## License
This is a PoC/demo app.