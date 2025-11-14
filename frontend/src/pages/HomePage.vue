<script setup lang="ts">
import MetricsBar from '@/shared/components/home-page/MetricsBar.vue';
import CalendarView from '@/shared/components/home-page/CalendarVue.vue';
import DailyOrdersSidebar from '@/shared/components/home-page/DailyOrdersSideBar.vue';
import { ref } from 'vue';

const isModalOpen = ref(false);
</script>

<template>
    <div class="min-w-full m-auto">
        <MetricsBar />

        <div class="flex flex-wrap justify-between gap-6">
            <div class="w-full lg:w-[calc(65%-1.5rem)]">
                <CalendarView />
            </div>

            <div class="w-full lg:w-[calc(35%-1.5rem)]">
                <DailyOrdersSidebar />
            </div>
        </div>

        <router-link to="criarpedido">
            <button
                class="fixed bottom-10 right-10 w-20 h-20 bg-blue-950 border-2 border-blue-500  rounded-full shadow-2xl flex items-center justify-center text-white text-3xl transition duration-300 hover:bg-blue-800 hover:scale-105 z-20">
                <i class="fi fi-rr-plus"></i>
            </button>
        </router-link>
    </div>
</template>