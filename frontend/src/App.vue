<script setup lang="ts">
import Environment from '@components/config/Environment.vue';
import AppHeader from './shared/components/layout/AppHeader.vue';
import ToastNotification from './shared/components/layout/ToastNotification.vue';
</script>

<template>
  <section class="w-full min-h-auto bg-gray-950/95 min-h-screen text-gray-200">
    <AppHeader />
    <Environment />
    <section class="lg:max-w-[95%] text-white p-8 m-auto">
      <router-view> </router-view>
      <ToastNotification />
    </section>
  </section>
</template>
