<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Environment from '@components/config/Environment.vue';
import AppHeader from './shared/components/layout/AppHeader.vue';
import ToastNotification from './shared/components/layout/ToastNotification.vue';
import { useUserStore } from './shared/stores/user.store';
import { onMounted } from 'vue';

const route = useRoute();

const userStore = useUserStore();

onMounted(async () => {
  await userStore.loadUsers();
});

const isLoginPage = computed(() => route.name === 'login');
</script>

<template>
  <section class="w-full min-h-auto bg-gray-950/95 min-h-screen text-gray-200">
    <AppHeader v-if="!isLoginPage" />
    <Environment />

    <section :class="{ 'w-full lg:max-w-[95%] text-white p-8 m-auto': !isLoginPage }">
      <router-view> </router-view>
      <ToastNotification />
    </section>
  </section>
</template>

<style>
:root,
body {
  padding: 0px;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #4A5568 #1A202C;
}

:root::-webkit-scrollbar,
body::-webkit-scrollbar {
  width: 10px;
}

:root::-webkit-scrollbar-track,
body::-webkit-scrollbar-track {
  background: #1A202C;
}

:root::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb {
  background: #4A5568;
  border-radius: 5px;
  border: 2px solid #1A202C;
}

:root::-webkit-scrollbar-thumb:hover,
body::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

div::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

div::-webkit-scrollbar-track {
  background: #2D3748;
  border-radius: 10px;
}

div::-webkit-scrollbar-thumb {
  background: #000;
  border-radius: 10px;
}

div::-webkit-scrollbar-thumb:hover {
  background: #0e2085;
}

div {
  scrollbar-width: thin;
  scrollbar-color: #2204ce #1f2024;
}</style>