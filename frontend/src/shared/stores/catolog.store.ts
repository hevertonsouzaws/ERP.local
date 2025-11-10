import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '../services/Database/Database';
import { generateUUID } from '@/shared/helpers/uuid.helper';
import type { IGarmentType, IService } from '@/shared/types/catalog.type';
import { showToast } from '../helpers/toastState';

export const useServiceStore = defineStore('catalog', () => {
    const services = ref<IService[]>([]);
    const garmentTypes = ref<IGarmentType[]>([]);
    const isLoading = ref(false);

    async function loadCatalog() {
        if (isLoading.value) return;
        isLoading.value = true;

        try {
            const [loadedServices, loadedGarments] = await Promise.all([
                db.services.toArray(),
                db.garmentTypes.toArray(),
            ]);

            services.value = loadedServices;
            garmentTypes.value = loadedGarments;

        } catch (error) {
            showToast('Erro ao carregar o catálogo do Dexie:', 'error');
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function addService(data: Omit<IService, 'uuid'>) {
        const newService: IService = { ...data, uuid: generateUUID() };
        try {
            await db.services.add(newService);
            services.value.push(newService);
        } catch (error) {
            showToast('Erro ao adicionar serviço no Dexie:', 'error');
            throw error;
        }
    }

    async function updateService(updatedService: IService) {
        try {
            await db.services.update(updatedService.uuid, updatedService);

            const index = services.value.findIndex(s => s.uuid === updatedService.uuid);
            if (index !== -1) {
                services.value[index] = updatedService;
            }
        } catch (error) {
            showToast('Erro ao atualizar serviço no Dexie:', 'error');
            throw error;
        }
    }

    async function deleteService(uuid: string) {
        try {
            await db.services.delete(uuid);
            services.value = services.value.filter(s => s.uuid !== uuid);
        } catch (error) {
            showToast('Erro ao deletar serviço no Dexie:', 'error');
            throw error;
        }
    }

    async function addGarmentType(data: Omit<IGarmentType, 'uuid'>) {
        const newGarment: IGarmentType = { ...data, uuid: generateUUID() };
        try {
            await db.garmentTypes.add(newGarment);
            garmentTypes.value.push(newGarment);
        } catch (error) {
            showToast('Erro ao adicionar peça no Dexie:', 'error');
            throw error;
        }
    }

    async function updateGarmentType(updatedGarment: IGarmentType) {
        try {
            await db.garmentTypes.update(updatedGarment.uuid, updatedGarment);

            const index = garmentTypes.value.findIndex(g => g.uuid === updatedGarment.uuid);
            if (index !== -1) {
                garmentTypes.value[index] = updatedGarment;
            }
        } catch (error) {
            showToast('Erro ao atualizar peça no Dexie:', 'error');
            throw error;
        }
    }

    async function deleteGarmentType(uuid: string) {
        try {
            await db.garmentTypes.delete(uuid);
            garmentTypes.value = garmentTypes.value.filter(g => g.uuid !== uuid);
        } catch (error) {
            showToast('Erro ao deletar peça no Dexie:', 'error');
            throw error;
        }
    }

    return {
        services,
        garmentTypes,
        isLoading,
        loadCatalog,
        addService,
        updateService,
        deleteService,
        addGarmentType,
        updateGarmentType,
        deleteGarmentType,
    };
});