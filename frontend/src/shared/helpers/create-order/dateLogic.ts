import { computed } from 'vue';
import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';
import { getDataHojeString } from '@/shared/helpers/data.helper';

export function useDateLogic() {
        const draftStore = useDraftOrderStore();
        const dataHoje = getDataHojeString();

        if (!draftStore.rascunho.dataEntrega) {
                draftStore.rascunho.dataEntrega = dataHoje;
        }

        const dataEntrega = computed({
                get: () => {
                        const valor = draftStore.rascunho.dataEntrega || dataHoje;
                        return valor;
                },
                set: (value: string) => {
                        draftStore.rascunho.dataEntrega = value;
                },
        });

        const horarioEntrega = computed({
                get: () => draftStore.rascunho.horarioEntrega || '',
                set: (value: string) => {
                        draftStore.rascunho.horarioEntrega = value;
                },
        });

        return {
                dataEntrega,
                horarioEntrega,
        };
}

export type DateLogic = ReturnType<typeof useDateLogic>;