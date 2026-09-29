<template>
  <UModal
    title="Keyboard shortcuts"
    :ui="{ content: 'max-w-sm' }"
  >
    <template #body>
      <ul class="space-y-3">
        <li
          v-for="shortcut in SHORTCUTS"
          :key="shortcut.label"
          class="flex items-center justify-between gap-4 text-sm"
        >
          <span class="text-toned">{{ shortcut.label }}</span>
          <span class="flex gap-1">
            <UKbd
              v-for="key in shortcut.keys"
              :key="key"
              :value="key"
            />
          </span>
        </li>
      </ul>
    </template>
  </UModal>
</template>
