<script setup lang="ts">
import Environment from '@components/config/Environment.vue';
import AppHeader from './shared/components/layout/AppHeader.vue';
</script>

<template>
  <section class="w-full min-h-auto bg-gray-900 min-h-screen text-gray-200">
    <AppHeader />
    <Environment />
    <section class="max-w-[80%] text-white p-8 m-auto">
      <router-view> </router-view>
    </section>
  </section>
</template>
