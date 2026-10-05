<!--
  ConverterTool — the main Hashtag ⇄ Comma converter.
  Features:
  - Two modes: # → , (hashtag to comma) and , → # (comma to hashtag)
  - Live conversion (debounced ~150ms) + manual "Convert" button
  - Smart parsing: splits on #, commas, newlines, whitespace; dedupes; preserves casing
  - Unicode-safe (Thai, Chinese, Japanese, Korean, etc.)
  - camelCase splitting toggle (default OFF)
  - Copy to clipboard with toast animation
  - Live counters (tag count, character count)
  - Clear button
  - Auto-save input to localStorage
  - Voice input integration (fills the textarea from speech)
  - Both output formats always visible and copyable
-->
<template>
  <main class="max-w-3xl mx-auto px-4 pt-4 pb-24">
    <!-- Mode toggle (segmented control) -->
    <div
      class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5"
      role="tablist"
      aria-label="Conversion direction"
    >
      <button
        @click="mode = 'hashtag-to-comma'"
        :class="[
          'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all min-h-[44px]',
          mode === 'hashtag-to-comma'
            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
        ]"
        role="tab"
        :aria-selected="mode === 'hashtag-to-comma'"
      >
        # → , &nbsp;Hashtag to Comma
      </button>
      <button
        @click="mode = 'comma-to-hashtag'"
        :class="[
          'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all min-h-[44px]',
          mode === 'comma-to-hashtag'
            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
        ]"
        role="tab"
        :aria-selected="mode === 'comma-to-hashtag'"
      >
        , → # &nbsp;Comma to Hashtag
      </button>
    </div>

    <!-- Input card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-4">
      <label for="converter-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {{ mode === 'hashtag-to-comma' ? 'Hashtags (input)' : 'Keywords (input)' }}
      </label>
      <textarea
        id="converter-input"
        ref="inputEl"
        v-model="inputText"
        :placeholder="mode === 'hashtag-to-comma' ? '#travel #food #bangkok' : 'travel, food, bangkok'"
        class="w-full px-4 py-3 text-base border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-y min-h-[100px]"
        aria-describedby="input-counters"
      ></textarea>

      <!-- Counters -->
      <div id="input-counters" class="flex items-center justify-between mt-2.5 text-sm text-slate-400 dark:text-slate-500">
        <span>{{ tagCount }} tags · {{ inputText.length }} chars</span>
        <button
          v-if="inputText"
          @click="clearAll"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition min-h-[44px] px-2"
          aria-label="Clear input and output"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Voice input -->
    <div class="mb-4">
      <VoiceInput
        @transcript="onVoiceTranscript"
        @interim="onVoiceInterim"
        @listening="onListeningChange"
      />
      <!-- Interim transcript preview while listening -->
      <div
        v-if="isListening && voiceInterim"
        class="text-sm text-slate-400 dark:text-slate-500 italic mt-1 px-1"
      >
        + "{{ voiceInterim }}"
      </div>
    </div>

    <!-- Output cards -->
    <div class="space-y-3">
      <!-- Comma output -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
            Comma-separated
          </label>
          <button
            v-if="commaOutput"
            @click="copyToClipboard(commaOutput, 'comma')"
            :aria-label="copiedField === 'comma' ? 'Copied' : 'Copy comma-separated result'"
            :class="[
              'flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition min-h-[44px]',
              copiedField === 'comma'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600',
            ]"
          >
            <svg v-if="copiedField === 'comma'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {{ copiedField === 'comma' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <p
          class="text-base text-slate-900 dark:text-white break-words min-h-[28px] select-all"
          :class="{ 'text-slate-300 dark:text-slate-600': !commaOutput }"
        >
          {{ commaOutput || 'Comma-separated keywords will appear here...' }}
        </p>
      </div>

      <!-- Hashtag output -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
            Hashtags
          </label>
          <button
            v-if="hashtagOutput"
            @click="copyToClipboard(hashtagOutput, 'hashtag')"
            :aria-label="copiedField === 'hashtag' ? 'Copied' : 'Copy hashtags'"
            :class="[
              'flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition min-h-[44px]',
              copiedField === 'hashtag'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600',
            ]"
          >
            <svg v-if="copiedField === 'hashtag'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {{ copiedField === 'hashtag' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <p
          class="text-base text-slate-900 dark:text-white break-words min-h-[28px] select-all"
          :class="{ 'text-slate-300 dark:text-slate-600': !hashtagOutput }"
        >
          {{ hashtagOutput || 'Hashtags will appear here...' }}
        </p>
      </div>
    </div>

    <!-- Output counters -->
    <div v-if="commaOutput || hashtagOutput" class="text-sm text-slate-400 dark:text-slate-500 mt-3 text-center">
      {{ tagCount }} unique tag{{ tagCount !== 1 ? 's' : '' }}
    </div>

    <!-- Settings -->
    <div class="mt-5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3">
      <div>
        <label for="camel-toggle" class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          Split camelCase words
        </label>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          #TravelInThailand → Travel In Thailand
        </p>
      </div>
      <!-- Toggle switch -->
      <button
        id="camel-toggle"
        role="switch"
        :aria-checked="splitCamel"
        @click="splitCamel = !splitCamel"
        :class="[
          'relative inline-flex h-7 w-12 items-center rounded-full transition shrink-0',
          splitCamel ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600',
        ]"
      >
        <span
          :class="[
            'inline-block h-5 w-5 transform rounded-full bg-white transition shadow-sm',
            splitCamel ? 'translate-x-6' : 'translate-x-1',
          ]"
        />
      </button>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { toComma, toHashtag, countTags } from '../utils/converter.js'
import VoiceInput from './VoiceInput.vue'

const STORAGE_KEY = 'hashmash-input'

const mode = ref('hashtag-to-comma')
const inputText = ref('')
const splitCamel = ref(false)
const copiedField = ref('')
const isListening = ref(false)
const voiceInterim = ref('')
const inputEl = ref(null)

// Load saved input from localStorage
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) inputText.value = saved
})

// Auto-save input to localStorage (debounced)
let saveTimer = null
watch(inputText, (val) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, val)
  }, 300)
})

// Live conversion (debounced ~150ms)
let convertTimer = null
watch([inputText, splitCamel, mode], () => {
  if (convertTimer) clearTimeout(convertTimer)
  convertTimer = setTimeout(updateOutputs, 150)
})

// Computed outputs
const commaOutput = ref('')
const hashtagOutput = ref('')

function updateOutputs() {
  if (!inputText.value.trim()) {
    commaOutput.value = ''
    hashtagOutput.value = ''
    return
  }
  const opts = { splitCamel: splitCamel.value }
  commaOutput.value = toComma(inputText.value, opts)
  hashtagOutput.value = toHashtag(inputText.value, opts)
}

// Counters
const tagCount = computed(() => countTags(inputText.value))

// Copy to clipboard
async function copyToClipboard(text, field) {
  try {
    await navigator.clipboard.writeText(text)
    copiedField.value = field
    setTimeout(() => (copiedField.value = ''), 2000)
  } catch (_) {
    // Fallback for older browsers
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copiedField.value = field
    setTimeout(() => (copiedField.value = ''), 2000)
  }
}

// Clear everything
function clearAll() {
  inputText.value = ''
  commaOutput.value = ''
  hashtagOutput.value = ''
  localStorage.removeItem(STORAGE_KEY)
  inputEl.value?.focus()
}

// Voice input handlers
function onVoiceTranscript(text) {
  // Append voice transcript to existing input (space-separated)
  const trimmed = text.trim()
  if (!trimmed) return
  if (inputText.value && !inputText.value.endsWith(' ')) {
    inputText.value += ' ' + trimmed
  } else {
    inputText.value += trimmed
  }
  // Focus the textarea so user can edit
  nextTick(() => inputEl.value?.focus())
}

function onVoiceInterim(text) {
  voiceInterim.value = text || ''
}

function onListeningChange(val) {
  isListening.value = val
  if (!val) voiceInterim.value = ''
}
</script>
