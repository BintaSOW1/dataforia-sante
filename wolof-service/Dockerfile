FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Précharger Whisper au BUILD (pas au démarrage)
RUN python3 -c "from huggingface_hub import snapshot_download snapshot_download('BintaSOW/whisper-wolof-sante') print('✅ Whisper préchargé !')"

COPY . .

EXPOSE 7860
CMD uvicorn main:app --host 0.0.0.0 --port 7860