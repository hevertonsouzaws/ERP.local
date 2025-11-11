import { ref, computed } from 'vue';
import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';
import { useServiceStore } from '@/shared/stores/catolog.store';
import type { IGarmentType, IService } from '@/shared/types/catalog.type';
import type { PedidoItemPeca } from '@/shared/types/order.type';
import { showToast } from '../toastState';

export function useItemManagementLogic() {
    const draftStore = useDraftOrderStore();
    const catalogStore = useServiceStore();
    const selectedGarmentTypeUuid = ref<string | null>(null);
    const selectedServiceUuid = ref<string | null>(null);
    const itemQuantity = ref(1);
    const pecaSelecionadaParaServico = ref<PedidoItemPeca | null>(null); 

    const garmentTypes = computed(() => catalogStore.garmentTypes as IGarmentType[]);
    const services = computed(() => catalogStore.services as IService[]);
    const itensDoPedido = computed(() => draftStore.rascunho.itens);

    const currentSelectedItem = computed<IService | undefined>(() => {
        return services.value.find(s => s.uuid === selectedServiceUuid.value);
    });

    const currentItemPrice = computed(() => {
        if (currentSelectedItem.value && itemQuantity.value > 0) {
            return currentSelectedItem.value.defaultPrice * itemQuantity.value;
        }
        return 0;
    });

    const adicionarPecaAoPedido = () => {
        const garment = garmentTypes.value.find(g => g.uuid === selectedGarmentTypeUuid.value);
        
        if (!garment) {
            showToast('Selecione um tipo de peça para adicionar.', 'warning');
            return;
        }

        draftStore.addGarment(garment);
        
        pecaSelecionadaParaServico.value = draftStore.rascunho.itens.slice(-1)[0] || null;

        selectedGarmentTypeUuid.value = null;
    };

    const adicionarServicoAItemExistente = () => {
        const service = services.value.find(s => s.uuid === selectedServiceUuid.value);
        const quantity = itemQuantity.value;
        const peca = pecaSelecionadaParaServico.value;

        if (!peca) {
            showToast('Selecione uma peça na lista de itens para adicionar um serviço.', 'warning');
            return;
        }
        if (!service || quantity <= 0) {
            showToast('Selecione um serviço e uma quantidade válida.', 'warning');
            return;
        }

        draftStore.addServiceToGarment(
            peca.uuid, 
            service,
            quantity,
            service.defaultPrice
        );
        selectedServiceUuid.value = null;
        itemQuantity.value = 1;
    };

    const removerServico = (pecaUuid: string, servicoUuid: string) => {
        draftStore.removeServiceFromGarment(pecaUuid, servicoUuid);
    }

    const removerItem = (uuid: string) => {
        draftStore.removeGarment(uuid);
        if (pecaSelecionadaParaServico.value?.uuid === uuid) {
            pecaSelecionadaParaServico.value = null;
        }
    };

    return {
        selectedGarmentTypeUuid,
        selectedServiceUuid,
        itemQuantity,
        pecaSelecionadaParaServico,
        garmentTypes,
        services,
        itensDoPedido, 
        currentSelectedItem,
        currentItemPrice,
        adicionarPecaAoPedido,
        adicionarServicoAItemExistente,
        removerServico,
        removerItem,
    };
}

export type ItemManagementLogic = ReturnType<typeof useItemManagementLogic>;