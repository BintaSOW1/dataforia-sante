from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import torch
import librosa
import tempfile
import os
from transformers import WhisperFeatureExtractor, WhisperTokenizer, WhisperProcessor, WhisperForConditionalGeneration
from huggingface_hub import snapshot_download
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
# ... reste des imports

app = FastAPI(title="DatoBot Wolof Service")

# Ajouter CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"🖥️ Device : {device}")

STT_REPO = "BintaSOW/whisper-wolof-sante"
TTS_SAMPLES_REPO = "BintaSOW/datobot-wolof-samples"

# Télécharger modèles
print("⏳ Téléchargement Whisper...")
STT_MODEL_PATH = snapshot_download(repo_id=STT_REPO)
print("✅ Whisper téléchargé !")

print("⏳ Téléchargement samples voix...")
TTS_SAMPLES_PATH = snapshot_download(repo_id=TTS_SAMPLES_REPO)
print("✅ Samples téléchargés !")

# Charger Whisper STT
print("⏳ Chargement Whisper STT...")
try:
    feature_extractor = WhisperFeatureExtractor.from_pretrained(STT_MODEL_PATH)
    tokenizer = WhisperTokenizer.from_pretrained(STT_MODEL_PATH)
    stt_processor = WhisperProcessor(feature_extractor=feature_extractor, tokenizer=tokenizer)
    stt_model = WhisperForConditionalGeneration.from_pretrained(STT_MODEL_PATH)
    stt_model = stt_model.to(device)
    stt_model.eval()
    print("✅ Whisper STT chargé !")
except Exception as e:
    print(f"⚠️ STT non disponible : {e}")
    stt_processor = None
    stt_model = None

# Charger XTTS v2 TTS
print("⏳ Chargement XTTS v2...")
try:
    os.environ["COQUI_TOS_AGREED"] = "1"
    os.environ["USE_TORCH"] = "1"

    original_load = torch.load
    def patched_load(*args, **kwargs):
        kwargs['weights_only'] = False
        return original_load(*args, **kwargs)
    torch.load = patched_load

    from TTS.api import TTS
    tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

    samples = []
    for f in os.listdir(TTS_SAMPLES_PATH):
        if f.endswith('.wav'):
            samples.append(f"{TTS_SAMPLES_PATH}/{f}")

    print(f"✅ XTTS v2 chargé avec {len(samples)} samples !")
except Exception as e:
    print(f"⚠️ TTS non disponible : {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    tts_model = None
    samples = []

class TTSRequest(BaseModel):
    texte: str
    langue: str = "fr"

@app.get("/")
async def health():
    return {
        "status": "ok",
        "service": "DatoBot Wolof Service",
        "stt": "✅ disponible" if stt_model else "❌ non disponible",
        "tts": "✅ disponible" if tts_model else "❌ non disponible",
        "device": str(device)
    }

@app.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    if stt_model is None:
        raise HTTPException(status_code=503, detail="STT non disponible")
    try:
        suffix = '.webm'
        if audio.filename:
            if audio.filename.endswith('.mp4'): suffix = '.mp4'
            elif audio.filename.endswith('.wav'): suffix = '.wav'
            elif audio.filename.endswith('.m4a'): suffix = '.m4a'

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name

        audio_data, sr = librosa.load(tmp_path, sr=16000, mono=True)
        os.unlink(tmp_path)

        inputs = stt_processor(audio_data, sampling_rate=16000, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        forced_decoder_ids = stt_processor.get_decoder_prompt_ids(
            language="french", task="transcribe"
        )
        with torch.no_grad():
            predicted_ids = stt_model.generate(
                inputs["input_features"],
                forced_decoder_ids=forced_decoder_ids
            )
        transcription = stt_processor.batch_decode(
            predicted_ids, skip_special_tokens=True
        )[0].strip()

        return {"success": True, "texte": transcription, "langue": "wo", "confidence": 0.95}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    if tts_model is None:
        raise HTTPException(status_code=503, detail="TTS non disponible")
    if not request.texte.strip():
        raise HTTPException(status_code=400, detail="Texte vide")
    try:
        print(f"🔊 Génération TTS pour : {request.texte[:50]}")
        tmp_path = f"/tmp/tts_{os.getpid()}.wav"

        tts_model.tts_to_file(
            text=request.texte,
            speaker_wav=samples if samples else None,
            language=request.langue,
            file_path=tmp_path
        )

        print(f"✅ TTS généré : {tmp_path}")
        return FileResponse(
            tmp_path,
            media_type="audio/wav",
            filename="datobot_wolof.wav"
        )
    except Exception as e:
        print(f"❌ Erreur TTS : {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "stt_loaded": stt_model is not None,
        "tts_loaded": tts_model is not None,
        "samples_count": len(samples),
        "device": str(device)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))