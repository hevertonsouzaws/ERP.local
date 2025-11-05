<template>
    <div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl shadow-2xl w-full lg:max-w-7xl p-6 h-[90vh] flex flex-col">

            <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-4">
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <i class="fi fi-rr-document-signed text-3xl mr-3 text-blue-400"></i>
                    Criar Novo Pedido
                </h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-white transition">
                    <i class="fi fi-rr-cross-small text-2xl"></i>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto pr-2 space-y-4">
                <div class="grid grid-cols-12 gap-6">

                    <div class="col-span-12 lg:col-span-8 space-y-6">
                        <ClientSelector :cliente-logica="clientLogic" />
                        <ItemAdder :item-logica="itemLogic" />
                    </div>

                    <div class="col-span-12 lg:col-span-4 space-y-6">
                        <DateSelector :date-logica="dateLogic" />
                        <PaymentForm :payment-logica="paymentLogic" />
                    </div>

                </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                <button @click="finalizarPedido"
                    :disabled="!clientLogic.clienteSelecionado.value || itemLogic.itensDoPedido.value.length === 0"
                    class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Finalizar Pedido (R$ {{ paymentLogic.valorTotalPedido.value.toFixed(2) || '0.00' }})
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ClientSelector from './ClientSelector.vue';
import ItemAdder from './ItemAdder.vue';
import PaymentForm from './PaymentForm.vue';
import DateSelector from './DateSelector.vue';

import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';
import { useClientFormLogic } from '@/shared/helpers/create-order/clientFormLogic.helper';
import { useItemManagementLogic } from '@/shared/helpers/create-order/itemManagementLogic.helper';
import { usePaymentFormLogic } from '@/shared/helpers/create-order/paymentFormLogic.helper';
import { useDateLogic } from '@/shared/helpers/create-order/dateLogic';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { useServiceStore } from '@/shared/stores/catolog.store';

const draftStore = useDraftOrderStore();
const clientLogic = useClientFormLogic();
const itemLogic = useItemManagementLogic();
const paymentLogic = usePaymentFormLogic();
const dateLogic = useDateLogic();
const pedidoStore = usePedidoStore();
const catalogStore = useServiceStore();

catalogStore.loadCatalog();

const emit = defineEmits(['close']);

const finalizarPedido = async () => {

    if (!clientLogic.clienteSelecionado.value) {
        alert('Selecione um cliente antes de finalizar.');
        return;
    }
    if (itemLogic.itensDoPedido.value.length === 0) {
        alert('Adicione itens ao pedido antes de finalizar.');
        return;
    }

    if (paymentLogic.valorTotalPedido.value <= 0) {
        alert('O valor total do pedido deve ser maior que zero.');
        return;
    }

    try {
        const pedidoParaSalvar = draftStore.toPedidoForSave();
        const uuidSalvo = await pedidoStore.adicionarPedido(pedidoParaSalvar);

        if (uuidSalvo) {
            alert(`✅ Pedido Criado com Sucesso! Status: ${pedidoParaSalvar.status}.`);

            draftStore.resetDraft();
            emit('close');

        } else {
            console.error('Falha ao salvar o pedido: UUID não retornado.');
            alert('❌ Falha ao salvar o pedido. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro fatal ao finalizar pedido:', error);
        alert(`❌ Erro ao salvar: {'Erro desconhecido.'}`);
    }
};

</script>
