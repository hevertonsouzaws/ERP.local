<script setup lang="ts">
import { computed } from 'vue';
import type { LoginSession } from '@/shared/types/user.type';
import { formatarDataHoraParaExibicao } from '@/shared/helpers/data.helper';

const props = defineProps<{
    logs: LoginSession[];
}>();

const formattedLogs = computed(() => {
    return props.logs.map(log => {
        const loginTime = log.loginTime;
        const logoutTime = log.logoutTime;

        return {
            ...log,
            formattedLogin: formatarDataHoraParaExibicao(loginTime), 
            formattedLogout: logoutTime ? formatarDataHoraParaExibicao(logoutTime) : 'ATIVO',
        };
    });
});
</script>

<template>
    <div class="overflow-x-auto bg-gray-00 rounded-lg shadow-xl p-4">
        <table class="min-w-full">
            <thead>
                <tr class="bg-gray-700/50">
                    <th class="py-3 px-4 text-left text-sm font-medium text-gray-400">Usuário</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-gray-400">Login</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-gray-400">Logout</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-gray-400">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="log in formattedLogs" :key="log.uuid" class="border-t border-gray-700 hover:bg-gray-700/30 transition">
                    <td class="py-3 px-4 font-medium">{{ log.userName }}</td>
                    <td class="py-3 px-4 text-sm">{{ log.formattedLogin }}</td>
                    <td class="py-3 px-4 text-sm"
                        :class="{ 'text-green-400 font-semibold': log.formattedLogout === 'ATIVO' }">
                        {{ log.formattedLogout }}
                    </td>
                    <td class="py-3 px-4 text-sm">
                        <span v-if="log.formattedLogout === 'ATIVO'" class="bg-green-600/50 text-green-300 px-2 py-0.5 rounded-full text-xs">Ativo</span>
                        <span v-else class="bg-gray-600/50 text-gray-300 px-2 py-0.5 rounded-full text-xs">Encerrado</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <p v-if="!formattedLogs.length" class="text-center text-gray-500 mt-4">Nenhum log de sessão encontrado.</p>
</template>