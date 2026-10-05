<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white mb-2">
                    Hash<span class="text-indigo-400">Mash</span>
                </h1>
                <p class="text-slate-400">Generate cryptographic hashes instantly</p>
            </div>

            <!-- Input Card -->
            <div class="bg-white rounded-2xl shadow-2xl p-6 mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Input Text
                </label>
                <textarea
                    v-model="inputText"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-mono text-sm"
                    rows="4"
                    placeholder="Type or paste text to hash..."
                ></textarea>
                <div class="flex items-center justify-between mt-3">
                    <span class="text-sm text-gray-500">
                        {{ inputText.length }} characters
                    </span>
                    <button
                        v-if="inputText"
                        @click="inputText = ''"
                        class="text-sm text-gray-400 hover:text-gray-600 transition"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-400 border-t-transparent"></div>
            </div>

            <!-- Results -->
            <div v-if="Object.keys(hashes).length > 0" class="space-y-3">
                <div
                    v-for="(hash, algo) in hashes"
                    :key="algo"
                    class="bg-white rounded-xl shadow-lg p-4 flex items-center gap-4 hover:shadow-xl transition"
                >
                    <div class="w-24 flex-shrink-0">
                        <span class="text-sm font-bold text-indigo-600 uppercase">{{ algo }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <code class="text-sm text-gray-700 font-mono break-all">{{ hash }}</code>
                    </div>
                    <button
                        @click="copyToClipboard(hash, algo)"
                        class="flex-shrink-0 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                        {{ copiedAlgo === algo ? '✓' : 'Copy' }}
                    </button>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="!inputText && !loading" class="text-center py-12 text-slate-500">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Enter text above to generate hashes</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const inputText = ref('')
const hashes = ref({})
const loading = ref(false)
const copiedAlgo = ref('')

let debounceTimer = null

watch(inputText, (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (!newVal) {
        hashes.value = {}
        return
    }
    debounceTimer = setTimeout(generateHashes, 300)
})

const generateHashes = async () => {
    loading.value = true
    try {
        const res = await fetch('/api/hash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputText.value }),
        })
        const data = await res.json()
        hashes.value = data.hashes
    } catch (e) {
        console.error('Failed to generate hash:', e)
    } finally {
        loading.value = false
    }
}

const copyToClipboard = async (text, algo) => {
    await navigator.clipboard.writeText(text)
    copiedAlgo.value = algo
    setTimeout(() => (copiedAlgo.value = ''), 2000)
}
</script>
