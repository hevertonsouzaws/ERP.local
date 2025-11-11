import { computed } from 'vue';
import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';

export function useDateLogic() {
    const draftStore = useDraftOrderStore();

    const dataEntrega = computed({
        get: () => draftStore.rascunho.dataEntrega,
        set: (value) => { draftStore.rascunho.dataEntrega = value; }
    });

    const horarioEntrega = computed({
        get: () => draftStore.rascunho.horarioEntrega,
        set: (value) => { draftStore.rascunho.horarioEntrega = value; }
    });
    
    return { 
        dataEntrega, 
        horarioEntrega 
    };
}