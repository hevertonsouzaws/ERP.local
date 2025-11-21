<script setup lang="ts">
import MetricsBar from '@/shared/components/home-page/MetricsBar.vue';
import CalendarView from '@/shared/components/home-page/CalendarVue.vue';
import DailyOrdersSidebar from '@/shared/components/home-page/DailyOrdersSideBar.vue';
</script>

<template>
    <div class="min-w-full m-auto">
        <div class="flex flex-wrap justify-between gap-6">
            <div class="w-full">
                <CalendarView />
            </div>

            <div class="w-full">
                <DailyOrdersSidebar />
            </div>
        </div>
    </div>
</template>