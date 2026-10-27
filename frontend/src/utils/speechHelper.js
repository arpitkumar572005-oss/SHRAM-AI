/**
 * Web Speech API Helper (Recognition & Synthesis) with robust fallback
 */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const isSpeechSupported = () => {
  return !!SpeechRecognition;
};

/**
 * Initiates speech recognition with live callback handlers.
 */
export const startSpeechRecording = ({ lang = 'hi-IN', onResult, onError, onEnd }) => {
  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition not supported in this browser environment.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({
          text: finalTranscript || interimTranscript,
          isFinal: !!finalTranscript
        });
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    recognition.start();
    return recognition;
  } catch (err) {
    console.error('Failed to start speech recognition:', err);
    if (onError) onError(err.message);
    return null;
  }
};

/**
 * Text-To-Speech (SpeechSynthesis) audio reader
 */
export const speakText = (text, lang = 'hi-IN') => {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // Slightly slower for clear rural speech
  utterance.pitch = 1.0;

  // Try finding best matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.includes(lang) || v.lang.includes(lang.split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
};
