// Mic-to-text with Web Speech API
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const output = document.getElementById('output');
const statusText = document.getElementById('status');

if (!window.SpeechRecognition) {
  statusText.textContent = "Sorry, your browser does not support Speech Recognition.";
  startBtn.disabled = true;
} else {
  const recognition = new window.SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    statusText.textContent = "Listening... Speak now.";
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  recognition.onend = () => {
    statusText.textContent = "Recognition stopped.";
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  recognition.onerror = (event) => {
    statusText.textContent = "Error: " + event.error;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    output.value = transcript;
  };

  startBtn.onclick = () => recognition.start();
  stopBtn.onclick = () => recognition.stop();
}

// AI (Wav2Vec2) Transcription via Flask backend
const uploadForm = document.getElementById('upload-form');
const audioFileInput = document.getElementById('audio-file');
const aiStatus = document.getElementById('ai-status');
const aiOutput = document.getElementById('ai-output');

uploadForm.onsubmit = async (e) => {
  e.preventDefault();
  const file = audioFileInput.files[0];
  if (!file) return;

  aiStatus.textContent = "Uploading and transcribing...";
  aiOutput.value = "";
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    aiOutput.value = data.transcription || "No transcription returned.";
    aiStatus.textContent = "Done.";
  } catch (err) {
    aiStatus.textContent = "Error: " + err.message;
    aiOutput.value = "";
  }
};