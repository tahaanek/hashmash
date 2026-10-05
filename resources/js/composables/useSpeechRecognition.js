/**
 * useSpeechRecognition — composable wrapping the native Web Speech API
 * (SpeechRecognition / webkitSpeechRecognition) for voice-to-text (STT).
 *
 * Features:
 * - Continuous listening with auto-restart (browsers may stop after pauses)
 * - Interim (partial) results for live transcript display
 * - Language selection via BCP-47 code
 * - Graceful error handling (permission denied, unsupported, etc.)
 *
 * The code is structured so a cloud STT provider (Google, OpenAI, Azure)
 * could be swapped in later by replacing the `start`/`stop` implementations
 * while keeping the same reactive interface.
 */
import { ref, onUnmounted } from 'vue'

export function useSpeechRecognition() {
  const isListening = ref(false)
  const finalTranscript = ref('')
  const interimTranscript = ref('')
  const error = ref(null)
  const isSupported = ref(false)

  // Detect native SpeechRecognition support (Chrome, Edge, Safari 14.1+).
  // Firefox has no native support — isSupported will be false and the UI
  // will show a "type manually" fallback message.
  const SpeechRecognitionClass =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null
  isSupported.value = !!SpeechRecognitionClass

  let recognition = null
  let shouldListen = false
  let currentLang = 'en-US'

  function start(lang) {
    if (!SpeechRecognitionClass) {
      error.value = 'unsupported'
      return false
    }

    // Clean up any existing instance
    if (recognition) {
      try { recognition.abort() } catch (_) {}
    }

    error.value = null
    currentLang = lang || 'en-US'
    shouldListen = true

    recognition = new SpeechRecognitionClass()
    recognition.lang = currentLang
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      if (final) {
        finalTranscript.value += final
      }
      interimTranscript.value = interim
    }

    recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are benign — auto-restart handles them
      if (event.error === 'no-speech' || event.error === 'aborted') return
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        error.value = 'permission-denied'
        shouldListen = false
        isListening.value = false
      } else {
        error.value = event.error
      }
    }

    recognition.onend = () => {
      // Browsers often stop recognition after a pause. If we're still
      // supposed to be listening, restart automatically.
      if (shouldListen) {
        try {
          recognition.start()
        } catch (_) {
          // Already started or in a bad state — ignore
        }
      } else {
        isListening.value = false
        interimTranscript.value = ''
      }
    }

    try {
      recognition.start()
      isListening.value = true
    } catch (_) {
      error.value = 'start-failed'
    }

    return true
  }

  function stop() {
    shouldListen = false
    if (recognition) {
      try { recognition.stop() } catch (_) {}
    }
    isListening.value = false
    interimTranscript.value = ''
  }

  function reset() {
    finalTranscript.value = ''
    interimTranscript.value = ''
    error.value = null
  }

  onUnmounted(() => stop())

  return {
    isListening,
    finalTranscript,
    interimTranscript,
    error,
    isSupported,
    start,
    stop,
    reset,
  }
}
