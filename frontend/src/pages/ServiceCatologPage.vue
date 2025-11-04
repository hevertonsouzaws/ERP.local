<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useServiceStore } from '@/shared/stores/catolog.store';
import type { IService, IGarmentType } from '@/shared/types/catalog.type';

import GarmentTypeForm from '@/shared/components/catalog-page/GarmentTypeForm.vue';
import ServiceForm from '@/shared/components/catalog-page/ServiceForm.vue';
import ListGarmentType from '@/shared/components/catalog-page/ListGarmentType.vue';
import ListService from '@/shared/components/catalog-page/ListService.vue';

const catalogStore = useServiceStore();

const isServiceModalOpen = ref(false);
const selectedService = ref<IService | null>(null);

const isGarmentModalOpen = ref(false);
const selectedGarment = ref<IGarmentType | null>(null);

onMounted(() => {
    catalogStore.loadCatalog();
});

function openServiceModal(service: IService | null) {
    selectedService.value = service;
    isServiceModalOpen.value = true;
}

function closeServiceModal() {
    isServiceModalOpen.value = false;
    selectedService.value = null;
    catalogStore.loadCatalog();
}

function openGarmentModal(garment: IGarmentType | null) {
    selectedGarment.value = garment;
    isGarmentModalOpen.value = true;
}

function closeGarmentModal() {
    isGarmentModalOpen.value = false;
    selectedGarment.value = null;
    catalogStore.loadCatalog();
}
</script>

<template>
    <div class="p-5 max-w-full mx-auto">
        <div class="bg-gray-800 rounded-lg flex justify-between items-center gap-10 p-4">
            <div class="w-full">
                <h1 class="text-gray-200 text-xl">Gerencie os tipos de peças de roupa e os serviços oferecidos na loja.
                </h1>
            </div>
            <div class="flex gap-10 w-[30%]">
                <button @click="openServiceModal(null)"
                    class="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-150">
                    + Adicionar Serviço
                </button>

                <button @click="openGarmentModal(null)"
                    class="w-full bg-green-700 text-white py-3 rounded-md hover:bg-green-900 transition duration-150">
                    + Adicionar Peça
                </button>
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-8 mt-10 rounded-lg">
            <section class="flex-1 p-4 rounded-lg shadow-md bg-gray-800">
                <h3 class="text-xl font-semibold mb-4 border-b pb-2">Serviços de Costura</h3>
                <ListService :services="catalogStore.services" @edit="openServiceModal" />
            </section>

            <section class="flex-1 p-4 rounded-lg shadow-md bg-gray-800">
                <h3 class="text-xl font-semibold mb-4 border-b pb-2">Tipos de Peças</h3>
                <ListGarmentType :garment-types="catalogStore.garmentTypes" @edit="openGarmentModal" />
            </section>
        </div>

        <div>
            <div v-if="isServiceModalOpen"
                class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div class="bg-gray-900 p-6 rounded-lg shadow-2xl w-full max-w-md border">
                    <ServiceForm :servico="selectedService" @close="closeServiceModal" @success="closeServiceModal" />
                </div>
            </div>

            <div v-if="isGarmentModalOpen"
                class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div class="bg-gray-900 p-6 rounded-lg shadow-2xl w-full max-w-md border">
                    <GarmentTypeForm :peca="selectedGarment" @close="closeGarmentModal" @success="closeGarmentModal" />
                </div>
            </div>
        </div>
    </div>
</template>
