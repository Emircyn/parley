<template>
  <UApp
    :toaster="{ position: 'top-center' }"
    :tooltip="{ delayDuration: 300 }"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
