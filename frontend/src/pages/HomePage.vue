<script setup lang="ts">
import MetricsBar from '@/shared/components/home/MetricsBar.vue';
import CalendarView from '@/shared/components/home/CalendarVue.vue';
import DailyOrdersSidebar from '@/shared/components/home/DailyOrdersSideBar.vue';
import CreateOrderModal from '@/shared/components/pedido/CreateOrderModal.vue';
import { ref } from 'vue';

const isModalOpen = ref(false);
</script>

<template>
    <div>
        <MetricsBar />

        <div class="flex space-x-8">
            <div class="w-1/2 flex-none">
                <CalendarView />
            </div>

            <div class="flex-1">
                <DailyOrdersSidebar />
            </div>
        </div>

        <button 
            @click="isModalOpen = true"
            class="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white text-3xl transition duration-300 hover:bg-blue-500 hover:scale-105 z-20"
        >
            <i class="fi fi-rr-plus"></i>
        </button>

        <CreateOrderModal v-if="isModalOpen" @close="isModalOpen = false" />
    </div>
</template>