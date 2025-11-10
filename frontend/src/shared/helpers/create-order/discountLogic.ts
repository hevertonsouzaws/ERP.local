import { ref, computed } from 'vue';
import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';

export function useDiscountLogic() {
    const draftStore = useDraftOrderStore();

    const descontoPorcentagem = computed({
        get: () => draftStore.descontoPorcentagem,
        set: (novoValor: number) => {
            draftStore.descontoPorcentagem = Math.max(0, novoValor);
        }
    });

    return {
        descontoPorcentagem,
    };
}