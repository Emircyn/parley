<script setup lang="ts">
import type { UIMessage } from 'ai'
import { isReasoningUIPart, isTextUIPart, isToolUIPart } from 'ai'
import { isPartStreaming } from '@nuxt/ui/utils/ai'
import rangi from '@comark/nuxt/plugins/rangi'
import security from '@comark/nuxt/plugins/security'

defineProps<{ message: UIMessage }>()

// Model output is untrusted: render Markdown only. Raw HTML like <script>, <iframe> or <img> (a common
// data-exfiltration trick) is dropped, event handler attributes and javascript: links are stripped.
const ALLOWED_TAGS = ['p', 'a', 'strong', 'em', 'del', 's', 'code', 'pre', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'sup', 'sub', 'kbd', 'input']
const safe = security({ allowedTags: ALLOWED_TAGS, allowedProtocols: ['https', 'http', 'mailto'] })
const plugins = [safe, rangi()]
const reasoningPlugins = [safe]
</script>

<template>
  <template
    v-for="(part, index) in message.parts"
    :key="`${message.id}-${part.type}-${index}`"
  >
    <UChatReasoning
      v-if="isReasoningUIPart(part) && part.text.trim()"
      :text="part.text"
      :streaming="isPartStreaming(part)"
      class="mb-2"
    >
      <Markdown
        :value="part.text"
        :streaming="isPartStreaming(part)"
        :plugins="reasoningPlugins"
        class="*:first:mt-0 *:last:mb-0"
      />
    </UChatReasoning>

    <ChatToolPart
      v-else-if="isToolUIPart(part)"
      :part="part"
    />

    <template v-else-if="isTextUIPart(part)">
      <Markdown
        v-if="message.role === 'assistant'"
        :value="part.text"
        :streaming="isPartStreaming(part)"
        :caret="isPartStreaming(part)"
        :plugins="plugins"
        class="*:first:mt-0 *:last:mb-0"
      />
      <p
        v-else
        class="whitespace-pre-wrap"
      >
        {{ part.text }}
      </p>
    </template>
  </template>
</template>
