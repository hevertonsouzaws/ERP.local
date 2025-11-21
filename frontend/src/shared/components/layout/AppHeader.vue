<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthLogStore } from '@/shared/stores/userAuth.store';
import { useUserStore } from '@/shared/stores/user.store';

const authLogStore = useAuthLogStore();
const userStore = useUserStore();
const menuSecundarioAberto = ref(false);

const toggleMenuSecundario = () => {
    menuSecundarioAberto.value = !menuSecundarioAberto.value;
};

const handleLogout = () => {
    authLogStore.logout();
};

const currentUser = computed(() => {
    const userId = authLogStore.currentSession?.userName;
    if (userId) {
        return userStore.findUserByName(userId);
    }
    return null;
});

const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(p => p.length > 0);

    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return '??';
};

const initials = computed(() => {
    if (currentUser.value?.name) {
        return getInitials(currentUser.value.name);
    }
    return '?';
});

</script>

<template>
    <header class="border-b border-gray-400 top-0 z-50 p-5 bg-gray-900">
        <nav class="text-white">

            <div
                class="flex flex-col items-center justify-center gap-y-4 md:flex-row md:justify-between gap-5 py-0 p-16">
                <router-link to="/home">
                    <p class="font-allura-custom font-semibold text-3xl">NS</p>
                </router-link>

                <div class="text-xl flex gap-8 items-center">
                    <router-link to="/home">
                        <i class="fi fi-rr-house-chimney"></i>
                    </router-link>
                    <router-link to="/criarpedido">
                        <i class="fi fi-rr-plus"></i>
                    </router-link>
                    <router-link to="/clientes">
                        <i class="fi fi-rr-user"></i>
                    </router-link>
                    <router-link to="/pedidos">
                        <i class="fi fi-rr-calendar-clock"></i>
                    </router-link>
                </div>

                <div class="relative flex gap-5">

                    <button @click="toggleMenuSecundario"
                        class="text-xl p-3 py-1 rounded-full hover:bg-gray-700 focus:outline-none">
                        <i v-if="!menuSecundarioAberto" class="fi fi-rr-menu-burger"></i>
                        <i v-else class="fi fi-rr-x text-base"></i>
                    </button>

                    <div v-if="currentUser"
                        class="w-12 h-12 rounded-full flex items-center justify-center text-md font-bold text-white shadow-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition duration-200 cursor-pointer"
                        :style="{ backgroundColor: currentUser.avatarColor }" :title="currentUser.name">
                        <img v-if="currentUser.avatarUrl" :src="currentUser.avatarUrl" :alt="currentUser.name"
                            class="w-full h-full object-cover">
                        <span v-else>{{ initials }}</span>
                    </div>

                    <div v-if="menuSecundarioAberto"
                        class="absolute right-0 mt-14 w-56 bg-gray-900 rounded-xl shadow-2xl py-1 z-50 ring-1 ring-white ring-opacity-5 border border-gray-500">
                        <router-link to="/zap" class="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700">
                            <i class="fi fi-rr-paper-plane mr-3 text-base"></i> Enviar Pedido
                        </router-link>
                        <router-link to="/catalogo"
                            class="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700">
                            <i class="fi fi-rr-list mr-3 text-base"></i> Catálogo
                        </router-link>
                        <router-link to="/financas"
                            class="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700">
                            <i class="fi fi-rr-dollar mr-3 text-base"></i> Finanças
                        </router-link>

                        <hr class="my-1 border-gray-700">

                        <router-link to="/backup"
                            class="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700">
                            <i class="fi fi-rr-rotate-right mr-3 text-base"></i> Backup
                        </router-link>
                        <router-link to="/log" class="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700">
                            <i class="fi fi-rr-info mr-3 text-base"></i> Log
                        </router-link>
                        <router-link to="/users"
                            class="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700">
                            <i class="fi fi-rr-user mr-3 text-base"></i> Usuários
                        </router-link>
                        <router-link to="/calendar"
                            class="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700">
                            <i class="fi fi-rr-calendar-days mr-3 text-base"></i> Calendário
                        </router-link>
                        <div @click="handleLogout"
                            class="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700">
                            <i class="fi fi-rr-exit mr-3 text-base"></i> Sair
                        </div>

                    </div>
                </div>
            </div>
        </nav>
    </header>
</template>
