<script setup lang="ts">
const props = defineProps<{ data: WeatherResult }>()

const now = computed(() => describeWeather(props.data.current.code, props.data.current.isDay))
const unit = computed(() => props.data.units.temperature.replace('°C', '°').replace('°F', '°'))
</script>

<template>
  <ToolsToolCard
    icon="i-lucide-map-pin"
    title="Weather"
    :subtitle="[data.location, data.country].filter(Boolean).join(', ')"
  >
    <div class="flex items-center gap-4">
      <UIcon
        :name="now.icon"
        class="size-14 shrink-0 text-highlighted"
      />
      <div class="min-w-0">
        <p class="font-display text-6xl font-black leading-none text-highlighted tabular-nums">
          {{ Math.round(data.current.temperature) }}{{ unit }}
        </p>
        <p class="mt-1 text-sm text-muted">
          {{ now.label }} · feels like {{ Math.round(data.current.feelsLike) }}{{ unit }}
        </p>
      </div>
    </div>

    <dl class="mt-4 flex gap-5 text-xs text-muted">
      <div class="flex items-center gap-1.5">
        <UIcon
          name="i-lucide-droplets"
          class="size-3.5"
        />
        <dt class="sr-only">
          Humidity
        </dt>
        <dd>{{ data.current.humidity }}%</dd>
      </div>
      <div class="flex items-center gap-1.5">
        <UIcon
          name="i-lucide-wind"
          class="size-3.5"
        />
        <dt class="sr-only">
          Wind
        </dt>
        <dd>{{ data.current.windSpeed }} {{ data.units.windSpeed }}</dd>
      </div>
    </dl>

    <ol class="mt-4 grid grid-cols-4 gap-2 border-t border-muted pt-3">
      <li
        v-for="(day, index) in data.days"
        :key="day.date"
        class="flex flex-col items-center gap-1 text-xs"
      >
        <span class="text-muted">{{ index === 0 ? 'Today' : weekday(day.date) }}</span>
        <UIcon
          :name="describeWeather(day.code).icon"
          class="size-5 text-toned"
          :aria-label="describeWeather(day.code).label"
        />
        <span class="tabular-nums">
          <span class="font-medium text-highlighted">{{ Math.round(day.max) }}°</span>
          <span class="text-dimmed"> {{ Math.round(day.min) }}°</span>
        </span>
      </li>
    </ol>
  </ToolsToolCard>
</template>
