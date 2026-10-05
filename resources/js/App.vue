<!--
  App.vue — layout shell for HashMash.
  Sticky header with app name + dark mode toggle.
  Renders ConverterTool (main) and FaqSection (SEO).
-->
<template>
  <div
    :class="['min-h-screen transition-colors duration-200', isDark ? 'dark' : '']"
  >
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <!-- Sticky header -->
      <header class="sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700">
        <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 class="text-xl font-bold text-slate-900 dark:text-white">
            Hash<span class="text-indigo-600 dark:text-indigo-400">Mash</span>
          </h1>

          <!-- Dark mode toggle -->
          <button
            @click="toggleDark"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            class="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <!-- Sun (shown in dark mode) -->
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon (shown in light mode) -->
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Main tool -->
      <ConverterTool />

      <!-- SEO FAQ section -->
      <FaqSection />

      <!-- Footer -->
      <footer class="text-center py-8 px-4 text-sm text-slate-400 dark:text-slate-500">
        <p>HashMash — Hashtag ⇄ Comma Converter with Voice Input</p>
        <p class="mt-1">All processing happens in your browser. No data is sent to any server.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ConverterTool from './components/ConverterTool.vue'
import FaqSection from './components/FaqSection.vue'

const DARK_KEY = 'hashmash-dark-mode'
const isDark = ref(false)

onMounted(() => {
  // Load saved preference, or auto-detect from prefers-color-scheme
  const saved = localStorage.getItem(DARK_KEY)
  if (saved !== null) {
    isDark.value = saved === 'true'
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true
  }
})

function toggleDark() {
  isDark.value = !isDark.value
}

// Persist dark mode preference
watch(isDark, (val) => {
  localStorage.setItem(DARK_KEY, String(val))
})
</script>
