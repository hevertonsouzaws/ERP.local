<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/shared/stores/user.store';
import LoginSelection from '@/shared/components/login-page/LoginSelection.vue';

const userStore = useUserStore();
const router = useRouter();

watch(() => userStore.isLoggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
        router.push({ name: 'home' }); 
    }
}, { immediate: true }); 
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <LoginSelection />
    </div>
</template>