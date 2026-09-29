<script setup lang="ts">
/**
 * Parley mark: a speech bubble whose tail is the stem of a "P" (monochrome), answered by a second
 * bubble in the brand gradient. `talking` animates the two bubbles taking turns (used by the loaders).
 */
withDefaults(defineProps<{ talking?: boolean }>(), { talking: false })

const id = useId()
const reply = 'M20 16H25a4.5 4.5 0 0 1 4.5 4.5V28.5L26 25H20a4.5 4.5 0 0 1-4.5-4.5 4.5 4.5 0 0 1 4.5-4.5Z'
</script>

<template>
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <mask :id="`${id}-gap`">
        <rect
          width="32"
          height="32"
          fill="#fff"
        />
        <path
          :d="reply"
          fill="#000"
          stroke="#000"
          stroke-width="3"
          stroke-linejoin="round"
        />
      </mask>
      <linearGradient
        :id="`${id}-grad`"
        x1="15"
        y1="16"
        x2="30"
        y2="29"
        gradientUnits="userSpaceOnUse"
      >
        <stop
          offset="0"
          style="stop-color: var(--accent-cyan)"
        />
        <stop
          offset=".5"
          style="stop-color: var(--accent-violet)"
        />
        <stop
          offset="1"
          style="stop-color: var(--accent-magenta)"
        />
      </linearGradient>
    </defs>
    <g :mask="`url(#${id}-gap)`">
      <path
        :class="{ 'parley-talk-a': talking }"
        class="fill-(--ui-text-highlighted)"
        fill-rule="evenodd"
        d="M4 11.5A8.5 8.5 0 0 1 12.5 3h5A8.5 8.5 0 0 1 26 11.5 8.5 8.5 0 0 1 17.5 20H11v5.5a3.5 3.5 0 0 1-7 0ZM15 8.3a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 1 0 0-6.4Z"
      />
    </g>
    <path
      :class="{ 'parley-talk-b': talking }"
      :fill="`url(#${id}-grad)`"
      :d="reply"
    />
  </svg>
</template>
