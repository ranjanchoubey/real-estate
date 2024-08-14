**run script to start the server:**

pm2 start venv/bin/uvicorn --name real-estate-api --interpreter venv/bin/python -- fast-api/app:app --host 0.0.0.0 --port 7878 --log-level debug

**test home api:**
curl http://localhost:7878/real-estate/