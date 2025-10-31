<template>
    <header class="bg-gray-900 border-b border-violet-600 top-0 z-50 p-8">

        <nav class="text-white">
            <div class="flex items-center justify-center gap-20 selection:">
                <div class="text-xl flex gap-10">
                    <router-link to="/">
                       <p class="font-allura-custom font-semibold text-3xl">NS Costuras</p>
                    </router-link>
                    <div class="border-l border-violet-600 h-10"></div>
                    <router-link to="/">
                        <i class="fi fi-rr-house-chimney"></i>
                    </router-link>
                    <router-link to="/clientes">
                        <i class="fi fi-rr-user"></i>
                    </router-link>
                    <router-link to="/pedidos">
                        <i class="fi fi-rr-calendar-clock"></i>
                    </router-link>
                    <router-link to="/backup">
                        <i class="fi fi-rr-rotate-right"></i>
                    </router-link>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup lang="ts">
</script>