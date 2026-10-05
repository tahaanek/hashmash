<!--
  FaqSection — SEO-friendly FAQ with crawlable static text.
  Uses semantic <details>/<summary> for native accordion behavior (no JS needed).
  JSON-LD FAQPage schema is injected in index.html for rich snippets.
-->
<template>
  <section class="mt-12 px-4 max-w-3xl mx-auto" aria-labelledby="faq-heading">
    <h2 id="faq-heading" class="text-xl font-bold text-slate-900 dark:text-white mb-4">
      Frequently Asked Questions
    </h2>
    <div class="space-y-3">
      <details
        v-for="(item, i) in faqs"
        :key="i"
        class="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
      >
        <summary
          class="cursor-pointer px-5 py-4 font-medium text-slate-800 dark:text-slate-100 list-none flex items-center justify-between select-none"
        >
          {{ item.q }}
          <svg class="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <p class="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {{ item.a }}
        </p>
      </details>
    </div>
  </section>
</template>

<script setup>
const faqs = [
  {
    q: 'How do I convert hashtags to commas?',
    a: 'Select the "# → ," mode, type or paste your hashtags (e.g. #travel #food #bangkok), and the comma-separated output appears instantly. Copy it with one click and paste directly into YouTube, Instagram, or TikTok tag fields.',
  },
  {
    q: 'How do I convert commas to hashtags?',
    a: 'Switch to the ", → #" mode, enter your comma-separated keywords, and the tool generates hashtags ready to copy. Duplicates and empty entries are removed automatically.',
  },
  {
    q: 'Can I use my voice to create hashtags?',
    a: 'Yes! Tap the microphone button, confirm your language, and speak your keywords. The app transcribes your speech in real time and formats it into both comma-separated and hashtag formats — ready to copy-paste as social media tags.',
  },
  {
    q: 'What languages does voice input support?',
    a: 'Voice input supports English, Thai, Chinese, Japanese, Korean, German, French, Spanish, Portuguese, and Vietnamese via your browser\'s built-in speech recognition. Lao and Myanmar have limited browser support — you can always type manually as a fallback.',
  },
  {
    q: 'Does it work on iPhone and Android?',
    a: 'Yes. On Android Chrome and desktop Chrome/Edge, the Web Speech API works natively for voice input. On iOS Safari, you can use the keyboard dictation button as a fallback. The text converter works fully on all devices and browsers.',
  },
  {
    q: 'Is my data sent to a server?',
    a: 'No. All text conversion happens entirely in your browser — nothing is uploaded or stored. Voice transcription is handled by your browser\'s built-in speech recognition engine.',
  },
]
</script>
