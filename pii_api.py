from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForTokenClassification
import torch
import glob
import re

app = FastAPI()


def normalize_transcript(text):
    def replace_email(match):
        local_part = match.group(1).replace(" ", "")
        domain = match.group(2)
        extension = match.group(3)

        return f"{local_part}@{domain}.{extension}"

    text = re.sub(
        r'\b([A-Za-z0-9._%+-]+(?:\s+[A-Za-z0-9._%+-]+)?)\s+at\s+([A-Za-z0-9-]+)\s*(?:dot|\.)\s*([A-Za-z]{2,})\b',
        replace_email,
        text,
        flags=re.IGNORECASE
    )

    return text

model_path = glob.glob("pii_mbert_final*/pii_mbert_final")[0]

tokenizer = AutoTokenizer.from_pretrained(
    model_path,
    use_fast=True
)

model = AutoModelForTokenClassification.from_pretrained(model_path)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()


class TranscriptRequest(BaseModel):
    transcript: str


def predict_pii(text):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=512
    )

    inputs = {key: value.to(device) for key, value in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)

    predictions = torch.argmax(outputs.logits, dim=2)

    tokens = tokenizer.convert_ids_to_tokens(
        inputs["input_ids"][0]
    )

    labels = [
        model.config.id2label[pred.item()]
        for pred in predictions[0]
    ]

    return tokens, labels


def extract_entities(tokens, labels):
    entities = []
    current_type = None
    current_value = ""

    for token, label in zip(tokens, labels):

        if label == "O":
            if current_value:
                entities.append({
                    "type": current_type,
                    "value": current_value
                })

                current_type = None
                current_value = ""

            continue

        entity_type = label[2:]

        if label.startswith("B-"):
            if current_value:
                entities.append({
                    "type": current_type,
                    "value": current_value
                })

            current_type = entity_type
            current_value = token.replace("##", "")

        elif label.startswith("I-") and current_type == entity_type:
            if token.startswith("##"):
                current_value += token[2:]
            else:
                current_value += token

    if current_value:
        entities.append({
            "type": current_type,
            "value": current_value
        })

    return entities


@app.post("/extract_pii")
def extract_pii(request: TranscriptRequest):

    normalized_text = normalize_transcript(request.transcript)

    tokens, labels = predict_pii(normalized_text)

    entities = extract_entities(tokens, labels)

    return {
        "pii": entities
    }


@app.get("/")
def home():
    return {
        "message": "PII Extraction API is running"
    }