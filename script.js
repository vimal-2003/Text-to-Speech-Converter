const textarea = document.getElementById("text-to-convert");
const fileInput = document.getElementById("file-input");
const voiceList = document.getElementById("voice-select");
const speechButton = document.getElementById("convert-button");
const pronunciationFeedback = document.getElementById("pronunciation-feedback");
const downloadLink = document.getElementById("download-link");

let synth = window.speechSynthesis;
let isSpeaking = false;

voices();
function voices() {
    voiceList.innerHTML = "";
    synth.addEventListener("voiceschanged", () => {
        for (let voice of synth.getVoices()) {
            let selected = voice.name === "Google US English" ? "selected" : "";
            let option = `<option value="${voice.name}" ${selected}>${voice.name} (${voice.lang})</option>`;
            voiceList.insertAdjacentHTML("beforeend", option);
        }
    });
}

function textToSpeech(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    for (let voice of synth.getVoices()) {
        if (voice.name === voiceList.value) {
            utterance.voice = voice;
        }
    }
    return new Promise((resolve, reject) => {
        utterance.onend = resolve;
        synth.speak(utterance);
    });
}

function saveAudio(blob) {
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.click();
    URL.revokeObjectURL(url);
}

speechButton.addEventListener("click", async e => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (text !== "") {
        if (!synth.speaking) {
            await textToSpeech(text);
            isSpeaking = true;
            speechButton.innerText = "Pause Speech";
        } else {
            synth.cancel();
            isSpeaking = false;
            speechButton.innerText = "Convert to Speech";
        }
    }
});

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const text = e.target.result;
            if (text !== "") {
                textarea.value = text; // Set text content of textarea
                await textToSpeech(text);
            }
        };
        reader.readAsText(file);
    }
});

pronunciationFeedback.addEventListener("click", () => {
    const word = prompt("Enter the word or phrase:");
    const phoneticSpelling = prompt("Enter the phonetic spelling:");
    if (word && phoneticSpelling) {
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = word;
        utterance.lang = "en-US";
        utterance.voice = synth.getVoices().find(voice => voice.name === voiceList.value);
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.voiceURI = "Google US English";
        utterance.volume = 1;
        utterance.text = word;
        utterance.lang = "en-US-x-pronunciation";
        synth.speak(utterance);
    } else {
        alert("Please provide both the word/phrase and its phonetic spelling.");
    }
});
