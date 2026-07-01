FROM python:3.12-slim

WORKDIR /code

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY app/ ./app/

# Render injects $PORT at runtime; default 8000 for local Docker runs
ENV PORT=8000

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
