from fastapi import FastAPI, UploadFile, File, HTTPException
from faster_whisper import WhisperModel
import tempfile
import os

app = FastAPI()

model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)

@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    temp_path = None

    try:
        suffix = os.path.splitext(audio.filename)[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_path = temp_file.name

        segments, info = model.transcribe(temp_path)

        transcript = " ".join(
            segment.text.strip()
            for segment in segments
        )

        return {
            "transcript": transcript,
            "language": info.language
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Transcription failed"
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)