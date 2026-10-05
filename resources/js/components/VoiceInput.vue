<!--
  VoiceInput — microphone button + language management for speech-to-text.
  Uses the native Web Speech API via the useSpeechRecognition composable.

  Flow:
  1. User taps mic button.
  2. If no saved language preference → show LanguageModal for confirmation.
  3. After confirmation (or if preference exists) → request mic permission & start listening.
  4. Live transcript is emitted to parent, which fills the input textarea.
  5. User can change language mid-session via the dropdown.
  6. Graceful degradation: if unsupported, show inline message; manual typing still works.

  Emits:
  - 'transcript': final transcript text (appended words)
  - 'interim': live partial transcript (for display)
  - 'listening': boolean — whether currently recording
-->
<template>
  <div class="flex flex-col gap-2">
    <!-- Unsupported message -->
    <div
      v-if="!isSupported"
      class="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3"
      role="alert"
    >
      <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
      </svg>
      <span>
        Voice input isn't supported in this browser yet — try Chrome or Edge, or type manually. On iOS, use the keyboard dictation button.
      </span>
    </div>

    <!-- Permission denied error -->
    <div
      v-else-if="error === 'permission-denied'"
      class="flex items-start gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3"
      role="alert"
    >
      <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
      </svg>
      <span>Microphone access denied. Please allow microphone permission in your browser settings and try again.</span>
    </div>

    <!-- Mic button + language selector -->
    <div v-else class="flex items-center gap-3 flex-wrap">
      <button
        @click="toggleListening"
        :aria-label="isListening ? 'Stop voice input' : 'Start voice input'"
        :class="[
          'relative flex items-center justify-center rounded-full transition-all min-w-[56px] min-h-[56px] shrink-0',
          isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700',
        ]"
      >
        <!-- Pulse ring when listening -->
        <span
          v-if="isListening"
          class="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"
        />
        <!-- Mic icon -->
        <svg class="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            v-if="!isListening"
            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8m-4-11a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3z"
          />
          <path
            v-else
            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 12a9 9 0 01-18 0m9 9v3m-4 0h8m-4-11a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3z"
          />
        </svg>
      </button>

      <!-- Language selector -->
      <div class="flex items-center gap-2">
        <label for="voice-lang" class="text-sm text-slate-500 dark:text-slate-400">🌐</label>
        <select
          id="voice-lang"
          v-model="selectedLang"
          @change="onLanguageChange"
          class="text-sm px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition min-h-[44px]"
          aria-label="Voice input language"
        >
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.nativeName }}{{ lang.fallback ? ' ⚠️' : '' }}
          </option>
        </select>
      </div>

      <!-- Live transcript indicator -->
      <span
        v-if="isListening"
        class="text-sm text-red-500 dark:text-red-400 font-medium flex items-center gap-1.5"
      >
        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Listening...
      </span>
    </div>

    <!-- Live interim transcript (aria-live for screen readers) -->
    <div
      v-if="interimTranscript"
      class="text-sm text-slate-500 dark:text-slate-400 italic px-1"
      aria-live="polite"
      aria-atomic="false"
    >
      "{{ interimTranscript }}"
    </div>

    <!-- Language confirmation modal (first-time) -->
    <LanguageModal
      :show="showModal"
      :selected-code="modalLang"
      @update:selected-code="modalLang = $event"
      @confirm="confirmLanguage"
      @cancel="cancelModal"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useSpeechRecognition } from '../composables/useSpeechRecognition.js'
import { LANGUAGES, detectBrowserLanguage, getLanguage } from '../utils/languages.js'
import LanguageModal from './LanguageModal.vue'

const emit = defineEmits(['transcript', 'interim', 'listening'])

const {
  isListening,
  finalTranscript,
  interimTranscript,
  error,
  isSupported,
  start,
  stop,
  reset,
} = useSpeechRecognition()

const languages = LANGUAGES

// Saved language preference (localStorage key)
const LANG_STORAGE_KEY = 'hashmash-voice-lang'

// Currently selected language for the dropdown
const selectedLang = ref('en-US')

// Modal state
const showModal = ref(false)
const modalLang = ref('en-US')

onMounted(() => {
  // Load saved preference, or detect from browser
  const saved = localStorage.getItem(LANG_STORAGE_KEY)
  if (saved && getLanguage(saved)) {
    selectedLang.value = saved
  } else {
    selectedLang.value = detectBrowserLanguage()
  }
  modalLang.value = selectedLang.value
})

// Emit transcript whenever final transcript changes
watch(finalTranscript, (val) => {
  if (val) {
    emit('transcript', val)
    // Reset the composable's internal transcript after emitting
    // so we only emit the delta on next change
    finalTranscript.value = ''
  }
})

// Emit interim transcript for live display
watch(interimTranscript, (val) => {
  emit('interim', val)
})

// Emit listening state
watch(isListening, (val) => {
  emit('listening', val)
})

function toggleListening() {
  if (!isSupported.value) return

  if (isListening.value) {
    stop()
    return
  }

  // Check if user has confirmed a language before
  const hasConfirmed = localStorage.getItem(LANG_STORAGE_KEY)
  if (!hasConfirmed) {
    // First time — show confirmation modal
    modalLang.value = selectedLang.value
    showModal.value = true
  } else {
    // Returning user — start listening directly
    startListening()
  }
}

function startListening() {
  reset() // Clear previous transcript
  start(selectedLang.value)
}

function confirmLanguage() {
  selectedLang.value = modalLang.value
  localStorage.setItem(LANG_STORAGE_KEY, modalLang.value)
  showModal.value = false
  startListening()
}

function cancelModal() {
  showModal.value = false
}

function onLanguageChange() {
  // Save preference when user changes language mid-session
  localStorage.setItem(LANG_STORAGE_KEY, selectedLang.value)

  // If currently listening, restart with new language
  if (isListening.value) {
    stop()
    // Small delay to let stop() complete
    setTimeout(() => startListening(), 200)
  }
}
</script>
