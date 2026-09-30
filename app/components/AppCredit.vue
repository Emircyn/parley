<template>
  <p class="flex items-center justify-center gap-1 text-[11px] text-dimmed">
    Powered by
    <ULink
      :to="AUTHOR.website"
      target="_blank"
      class="text-muted hover:text-highlighted"
    >
      {{ AUTHOR.name }}
    </ULink>
    <ULink
      :to="AUTHOR.github"
      target="_blank"
      class="inline-flex text-muted hover:text-highlighted"
      :aria-label="`${AUTHOR.name} on GitHub`"
    >
      <UIcon
        name="i-simple-icons-github"
        class="size-3"
      />
    </ULink>
  </p>
</template>
