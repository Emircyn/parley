<script setup lang="ts">
const model = useRuntimeConfig().public.aiModel
// "@cf/zai-org/glm-4.7-flash" -> "glm-4.7-flash"
const name = model.split('/').pop()
</script>

<template>
  <UTooltip :text="`Cloudflare Workers AI · ${model}`">
    <UBadge
      color="neutral"
      variant="outline"
      icon="i-lucide-sparkles"
      :label="name"
      class="rounded-full font-mono"
    />
  </UTooltip>
</template>
