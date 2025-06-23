from flask import Flask, request, jsonify, render_template
from transformers import Wav2Vec2ForCTC, Wav2Vec2Tokenizer
import torch
import librosa
import tempfile
import os

app = Flask(__name__)

# Load model and tokenizer once on startup
tokenizer = Wav2Vec2Tokenizer.from_pretrained("facebook/wav2vec2-base-960h")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']

    # Save to a temp file
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
        file.save(temp_audio.name)
        wav_path = temp_audio.name

    try:
        # Load and process audio
        speech, rate = librosa.load(wav_path, sr=16000)
        input_values = tokenizer(speech, return_tensors="pt", padding="longest").input_values
        with torch.no_grad():
            logits = model(input_values).logits
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = tokenizer.decode(predicted_ids[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(wav_path)

    return jsonify({"transcription": transcription})

if __name__ == '__main__':
    app.run(debug=True)