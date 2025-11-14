<template>
    <header class="border-b border-gray-400 top-0 z-50 p-6 bg-gray-900">
        <nav class="text-white">
            <div class="flex flex-col items-center justify-center gap-y-4 md:flex-row md:justify-between gap-5 py-0 p-16">
                <router-link to="/">
                    <p class="font-allura-custom font-semibold text-3xl">NS</p>
                </router-link>

                <div class="text-xl flex gap-8 items-center">
                    <router-link to="/">
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
                <div class="relative">
                    <button @click="toggleMenuSecundario"
                        class="text-xl p-1 rounded-xl hover:bg-gray-700 focus:outline-none">
                        <i class="fi fi-rr-menu-dots"></i>
                    </button>

                    <div v-if="menuSecundarioAberto"
                        class="absolute right-0 mt-3 w-56 bg-gray-800 rounded-md shadow-2xl py-1 z-50 ring-1 ring-white ring-opacity-5 border border-gray-500">
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
                            <i class="fi fi-rr-people mr-3 text-base"></i> Usuários
                        </router-link>
                    </div> <router-link to="/login" @click="handleLogout" class="ml-4 p-1 rounded hover:text-red-500">
                        <i class="fi fi-rr-exit text-xl"></i>
                    </router-link>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthLogStore } from '@/shared/stores/userAuth.store';
import { useUserStore } from '@/shared/stores/user.store';

const router = useRouter();
const authLogStore = useAuthLogStore();
const userStore = useUserStore();

const menuSecundarioAberto = ref(false);

const toggleMenuSecundario = () => {
    menuSecundarioAberto.value = !menuSecundarioAberto.value;
};

const handleLogout = () => {
    authLogStore.logout();
    router.push({ name: 'login' });
};
</script>