<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthLogStore } from '@/shared/stores/userAuth.store';
import LogTable from '@/shared/components/logs-page/LogTable.vue';

const authLogStore = useAuthLogStore();
const isLoading = ref(true);

onMounted(async () => {
    try {
        await authLogStore.loadSessionLogs();
    } catch (error) {
        console.error("Erro ao carregar logs:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="p-4">
        <h1 class="text-3xl font-bold mb-6">Logs de Acesso</h1>
        
        <div v-if="isLoading" class="text-center p-8 text-lg text-gray-400">
            Carregando logs, aguarde...
        </div>

        <LogTable v-else :logs="authLogStore.sessionLogs" />
    </div>
</template>