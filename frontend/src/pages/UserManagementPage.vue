<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/shared/stores/user.store';
import UserFormModal from '@/shared/components/user-management-page/AddUserModal.vue';
import type { User } from '@/shared/types/user.type';
import { showToast } from '@/shared/helpers/toastState';

const userStore = useUserStore();

const isModalOpen = ref(false);
const userToEdit = ref<User | null>(null);
const isLoading = ref(true);

onMounted(async () => {
    await userStore.loadUsers();
    isLoading.value = false;
});

function openAddModal() {
    userToEdit.value = null;
    isModalOpen.value = true;
}

function openEditModal(user: User) {
    userToEdit.value = user;
    isModalOpen.value = true;
}

async function handleDeleteUser(user: User) {
    if (user.uuid === userStore.currentUser?.uuid) {
        showToast('Não é possível deletar o usuário logado.', 'error');
        return;
    }

    if (confirm(`Tem certeza que deseja deletar o usuário "${user.name}"?`)) {
        try {
            await userStore.deleteUser(user.uuid);
            showToast('Usuário deletado com sucesso!', 'success');
        } catch (error: any) {
            showToast(`Erro ao deletar: ${error.message}`, 'error');
        }
    }
}

function handleModalSuccess(message: string) {
    showToast(message, 'success');
}
</script>

<template>
    <div class="p-4 max-w-7xl m-auto">


        <div class="flex justify-between p-5">
            <h1 class="text-3xl font-semibold mb-6 text-white">Gerenciamento de Usuários</h1>
            <button @click="openAddModal"
                class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clip-rule="evenodd" />
                </svg>
                <span>Adicionar Usuário</span>
            </button>
        </div>

        <div v-if="isLoading" class="text-center p-8 text-lg text-gray-400">
            Carregando usuários...
        </div>

        <div v-else class="overflow-x-auto bg-gray-900 rounded-xl shadow-xl border border-gray-500">
            <table class="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th class="py-4 p-4 text-left text-sm font-medium text-gray-400">Nome</th>
                        <th class="py-3 p-4 text-left text-sm font-medium text-gray-400">Acesso</th>
                        <th class="py-3 p-4 text-left text-sm font-medium text-gray-400">Avatar</th>
                        <th class="py-3 p-4 text-left text-sm font-medium text-gray-400">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in userStore.users" :key="user.uuid"
                        class="border-t border-gray-700 hover:bg-gray-700/30 transition">
                        <td class="py-3 px-4 font-medium">{{ user.name }}</td>
                        <td class="py-3 px-4 text-sm">
                            <span
                                :class="['px-3 py-1 text-xs leading-5 font-semibold rounded-full',
                                    user.role === 'ADMIN' ? 'bg-red-600/50 text-red-300' : 'bg-green-600/50 text-green-300']">
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-sm">
                            <span :style="{ backgroundColor: user.avatarColor }"
                                class="inline-block w-6 h-6 rounded-full border border-gray-600"></span>
                        </td>
                        <td class="py-3 px-4 text-left space-x-2">
                            <button @click="openEditModal(user)" class="text-gray-200 hover:text-blue-300 transition">
                                <i class="fi fi-rr-edit"></i>
                            </button>
                            <button @click="handleDeleteUser(user)" class="text-gray-200 hover:text-red-300 transition"
                                :disabled="user.uuid === userStore.currentUser?.uuid"
                                :class="{ 'opacity-50 cursor-not-allowed': user.uuid === userStore.currentUser?.uuid }">
                                <i class="fi fi-rr-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <UserFormModal :is-open="isModalOpen" :user-to-edit="userToEdit" @close="isModalOpen = false"
        @success="handleModalSuccess" />
</template>