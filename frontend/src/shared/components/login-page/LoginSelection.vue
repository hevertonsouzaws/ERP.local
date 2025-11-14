<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/shared/stores/user.store';
import { useAuthLogStore } from '@/shared/stores/userAuth.store';
import { showToast } from '@/shared/helpers/toastState';

const userStore = useUserStore();
const authLogStore = useAuthLogStore();

const selectedUserName = ref('');
const password = ref('');
const loginError = ref('');
const showPassword = ref(false);

const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.charAt(0);
};

const handleLogin = () => {
    loginError.value = '';

    if (!selectedUserName.value || !password.value) {
        loginError.value = 'Preencha o nome e a senha.';
        return;
    }

    const user = userStore.authenticateUser(selectedUserName.value, password.value);

    if (user) {
        authLogStore.login(user);
        showToast(`Bem-vindo, ${user.name}!`, 'success');
    } else {
        loginError.value = 'Nome ou Senha incorretos.';
        password.value = '';
        showToast('Credenciais inválidas.', 'error');
    }
};

const selectUserByName = (name: string) => {
    selectedUserName.value = name;
    document.getElementById('password-input')?.focus();
}

function togglePasswordVisibility() {
    showPassword.value = !showPassword.value;
}
</script>

<template>
    <div class="p-8 border border-gray-500 rounded-2xl shadow-2xl min-w-7xl">
        <h2 class="text-2xl font-bold text-white text-center mb-8">
            NS Autenticação Necessária
        </h2>

        <p class="text-sm text-gray-400 mb-3 text-center">Clique no avatar para selecionar seu nome:</p>
        <div class="flex flex-wrap justify-center gap-4 mb-6">
            <div v-for="user in userStore.users" :key="user.uuid" @click="selectUserByName(user.name)"
                class="flex flex-col items-center cursor-pointer p-1 rounded-xl transition duration-200 border-2"
                :class="{
                    'border-blue-500 bg-gray-700 shadow-md': selectedUserName === user.name,
                    'border-transparent hover:bg-gray-700/50': selectedUserName !== user.name,
                }">

                <div class="w-12 h-12 rounded-full flex items-center justify-center text-md font-bold text-white shadow-lg overflow-hidden"
                    :style="{ backgroundColor: user.avatarColor }">
                    <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name"
                        class="w-full h-full object-cover">
                    <span v-else>{{ getInitials(user.name) }}</span>
                </div>

                <span class="mt-1 text-xs text-white">{{ user.name }}</span>
            </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-300">Nome de Usuário</label>
                <input id="name" type="text" v-model="selectedUserName" required
                    class="w-full mt-1 p-3 bg-gray-900 border border-gray-400 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Seu nome" :disabled="userStore.isLoggedIn">
            </div>

            <div class="relative">
                <label for="password-input" class="block text-sm font-medium text-gray-300">Senha</label>
                <input id="password-input" :type="showPassword ? 'text' : 'password'" v-model="password"
                    class="w-full mt-1 p-3 bg-gray-900 border border-gray-400 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sua senha" />

                <button type="button" @click="togglePasswordVisibility"
                    class="absolute right-4 top-10  flex items-center text-gray-400 hover:text-white transition"
                    :title="showPassword ? 'Ocultar Senha' : 'Visualizar Senha'">
                    <i v-if="showPassword" class="fi fi-rr-eye-crossed"></i>
                    <i v-else class="fi fi-rr-eye"></i>
                </button>
            </div>

            <p v-if="loginError" class="text-sm text-red-400 text-center">{{ loginError }}</p>

            <button type="submit" :disabled="!selectedUserName || !password"
                class="w-full py-3 rounded-xl text-lg font-bold transition duration-300 transform shadow-lg" :class="{
                    'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]': selectedUserName && password,
                    'bg-gray-700 text-gray-300 cursor-not-allowed': !selectedUserName || !password
                }">
                Entrar no Sistema
            </button>
        </form>
    </div>
</template>