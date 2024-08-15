#!/bin/bash

# Navigate to the project directory
cd /data/backend/

# Start the FastAPI application with PM2
pm2 start venv/bin/uvicorn --name real-estate-api --interpreter venv/bin/python -- webapps.backend.app:app --host 0.0.0.0 --port 7878 --log-level debug