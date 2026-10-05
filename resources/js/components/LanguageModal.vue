<!--
  LanguageModal — first-time voice language confirmation.
  Shows before the first recording: "We'll listen in [Language]. Is that correct?"
  Lets the user change the language, then confirms to start listening.
  The confirmed choice is saved to localStorage so returning users skip this.
-->
<template>
  <transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4"
      @click.self="$emit('cancel')"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-modal-title"
      >
        <h3 id="lang-modal-title" class="text-lg font-bold text-slate-900 dark:text-white mb-1">
          🌐 Voice Language
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
          We'll listen in <span class="font-semibold text-indigo-600 dark:text-indigo-400">{{ currentLangName }}</span>. Is that correct?
        </p>

        <label for="lang-select" class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
          Change language
        </label>
        <select
          id="lang-select"
          :value="selectedCode"
          @change="$emit('update:selectedCode', $event.target.value)"
          class="w-full px-3 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition mb-1"
        >
          <option
            v-for="lang in languages"
            :key="lang.code"
            :value="lang.code"
          >
            {{ lang.nativeName }} — {{ lang.name }}{{ lang.fallback ? ' (limited support)' : '' }}
          </option>
        </select>
        <p v-if="selectedFallback" class="text-xs text-amber-600 dark:text-amber-400 mt-1 mb-3">
          ⚠️ This language has limited browser support. Voice input may not work — you can still type manually.
        </p>
        <div v-else class="mb-4" />

        <div class="flex gap-3">
          <button
            @click="$emit('cancel')"
            class="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition min-h-[44px]"
          >
            Cancel
          </button>
          <button
            @click="$emit('confirm')"
            class="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30 min-h-[44px]"
          >
            Confirm &amp; Start
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { LANGUAGES, getLanguage } from '../utils/languages.js'

const props = defineProps({
  show: Boolean,
  selectedCode: String,
})

defineEmits(['update:selectedCode', 'confirm', 'cancel'])

const languages = LANGUAGES

const currentLangName = computed(() => {
  const lang = getLanguage(props.selectedCode)
  return lang ? lang.nativeName : 'English'
})

const selectedFallback = computed(() => {
  const lang = getLanguage(props.selectedCode)
  return lang?.fallback ?? false
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
