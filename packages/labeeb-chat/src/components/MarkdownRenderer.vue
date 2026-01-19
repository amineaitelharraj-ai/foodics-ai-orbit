<script setup lang="ts">
import { computed, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type { Options } from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';

interface Props {
  content: string;
  enableCopy?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  enableCopy: true,
});

const copiedBlockId = ref<string | null>(null);

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
      } catch {
        // Fall through
      }
    }
    try {
      return hljs.highlightAuto(str).value;
    } catch {
      return '';
    }
  },
});

let blockCounter = 0;

md.renderer.rules.fence = (tokens: Token[], idx: number, options: Options) => {
  const token = tokens[idx];
  if (!token) return '';
  const code = token.content;
  const lang = token.info.trim() || 'text';
  const blockId = `code-block-${blockCounter++}`;

  let highlighted: string;
  if (options.highlight) {
    highlighted = options.highlight(code, lang, '') || md.utils.escapeHtml(code);
  } else {
    highlighted = md.utils.escapeHtml(code);
  }

  const copyButton = props.enableCopy
    ? `<button class="copy-btn" data-block-id="${blockId}" data-code="${encodeURIComponent(code)}" title="Copy code">
        <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>`
    : '';

  return `<div class="code-block-wrapper" data-block-id="${blockId}">
    <div class="code-block-header">
      <span class="code-lang">${lang}</span>
      ${copyButton}
    </div>
    <pre class="hljs"><code class="language-${lang}">${highlighted}</code></pre>
  </div>`;
};

md.renderer.rules.table_open = () => '<div class="table-wrapper"><table class="markdown-table">';
md.renderer.rules.table_close = () => '</table></div>';

const renderedContent = computed(() => {
  if (!props.content) return '';
  blockCounter = 0;
  return md.render(props.content);
});

async function handleCopyClick(event: MouseEvent): Promise<void> {
  const target = event.target as HTMLElement;
  const copyBtn = target.closest('.copy-btn') as HTMLElement;

  if (!copyBtn) return;

  const code = decodeURIComponent(copyBtn.dataset.code || '');
  const blockId = copyBtn.dataset.blockId || '';

  try {
    await navigator.clipboard.writeText(code);
    copiedBlockId.value = blockId;

    const copyIcon = copyBtn.querySelector('.copy-icon') as HTMLElement;
    const checkIcon = copyBtn.querySelector('.check-icon') as HTMLElement;

    if (copyIcon && checkIcon) {
      copyIcon.style.display = 'none';
      checkIcon.style.display = 'block';
      checkIcon.style.color = '#22c55e';

      setTimeout(() => {
        copyIcon.style.display = 'block';
        checkIcon.style.display = 'none';
        copiedBlockId.value = null;
      }, 2000);
    }
  } catch (err) {
    console.error('Failed to copy code:', err);
  }
}
</script>

<template>
  <div
    ref="containerRef"
    class="markdown-content prose prose-sm dark:prose-invert max-w-none"
    @click="handleCopyClick"
    v-html="renderedContent"
  />
</template>

<style>
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.markdown-content p {
  margin: 0.5em 0;
}

.markdown-content p:first-child {
  margin-top: 0;
}

.markdown-content p:last-child {
  margin-bottom: 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content li {
  margin: 0.25em 0;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content a {
  color: #5d34ff;
  text-decoration: underline;
}

.markdown-content a:hover {
  color: #4a2acc;
}

.dark .markdown-content a {
  color: #8b6fff;
}

.dark .markdown-content a:hover {
  color: #a68fff;
}

.markdown-content code:not(pre code) {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
}

.dark .markdown-content code:not(pre code) {
  background-color: rgba(255, 255, 255, 0.1);
}

.code-block-wrapper {
  position: relative;
  margin: 0.75em 0;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #1e1e1e;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.code-lang {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  font-weight: 500;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 0.25rem;
  color: #888;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s;
}

.copy-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.markdown-content pre.hljs {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  background-color: #1e1e1e;
  font-size: 0.875rem;
  line-height: 1.5;
}

.markdown-content pre.hljs code {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  background: none;
  padding: 0;
  border-radius: 0;
}

.table-wrapper {
  overflow-x: auto;
  margin: 0.75em 0;
}

.markdown-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.markdown-table th,
.markdown-table td {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.dark .markdown-table th,
.dark .markdown-table td {
  border-color: #374151;
}

.markdown-table th {
  background-color: #f9fafb;
  font-weight: 600;
}

.dark .markdown-table th {
  background-color: #1f2937;
}

.markdown-table tr:nth-child(even) {
  background-color: #f9fafb;
}

.dark .markdown-table tr:nth-child(even) {
  background-color: rgba(31, 41, 55, 0.5);
}

.markdown-content blockquote {
  margin: 0.75em 0;
  padding: 0.5rem 1rem;
  border-left: 4px solid #5d34ff;
  background-color: rgba(93, 52, 255, 0.05);
  color: #374151;
}

.dark .markdown-content blockquote {
  background-color: rgba(93, 52, 255, 0.1);
  color: #d1d5db;
}

.markdown-content hr {
  margin: 1em 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.dark .markdown-content hr {
  border-top-color: #374151;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content h1 { font-size: 1.5em; }
.markdown-content h2 { font-size: 1.25em; }
.markdown-content h3 { font-size: 1.125em; }
</style>
