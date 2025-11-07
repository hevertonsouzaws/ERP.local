<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { Pedido } from '@/shared/types/pedido.type';
import { showToast } from '@/shared/helpers/toastState'; 
import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';
import { useClientFormLogic } from '@/shared/helpers/create-order/clientFormLogic.helper';
import { useItemManagementLogic } from '@/shared/helpers/create-order/itemManagementLogic.helper';
import { usePaymentFormLogic } from '@/shared/helpers/create-order/paymentFormLogic.helper';
import { useDateLogic } from '@/shared/helpers/create-order/dateLogic';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { useServiceStore } from '@/shared/stores/catolog.store';
import { useDiscountLogic } from '@/shared/helpers/create-order/discountLogic' 

import ClientSelector from '../create-order/ClientSelector.vue';
import ItemAdder from '../create-order/ItemAdder.vue';
import PaymentForm from '../create-order/PaymentForm.vue';
import DateSelector from '../create-order/DateSelector.vue';
import DiscountForm from './DescontoForm.vue';


const props = defineProps<{
    pedido: Pedido;
}>();

const emit = defineEmits(['close', 'edit-success']);

const draftStore = useDraftOrderStore();
const clientLogic = useClientFormLogic();
const itemLogic = useItemManagementLogic();
const paymentLogic = usePaymentFormLogic();
const dateLogic = useDateLogic();
const discountLogic = useDiscountLogic();
const pedidoStore = usePedidoStore();
const catalogStore = useServiceStore();

catalogStore.loadCatalog();

const initDraftFromPedido = (pedido: Pedido) => {
    draftStore.loadDraftFromPedido(pedido);
};

onMounted(() => {
    initDraftFromPedido(props.pedido);
});

onUnmounted(() => {
    draftStore.resetDraft();
});

const atualizarPedido = async () => {
    const pedidoUUID = props.pedido.uuid;

    if (itemLogic.itensDoPedido.value.length === 0) {
        showToast('Adicione itens ao pedido antes de salvar.', 'warning');
        return;
    }

    if (paymentLogic.valorTotalPedido.value <= 0) {
        showToast('O valor total do pedido deve ser maior que zero, após o desconto.', 'warning');
        return;
    }

    try {
        const novosItens = itemLogic.itensDoPedido.value;
        const novoDesconto = discountLogic.descontoPorcentagem.value;

        await pedidoStore.atualizarItensOuPagamentosPedido(
            pedidoUUID,
            novosItens,
            props.pedido.pagamentos,
            novoDesconto,
        );

        showToast(`Pedido atualizado com sucesso.`, 'success');
        
        emit('edit-success');
        emit('close');

    } catch (error) {
        console.error('Erro fatal ao atualizar pedido:', error);
        showToast('Houve um erro ao salvar a edição. Verifique o console.', 'error');
    }
};
</script>

<template>
    <div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" @click.self="$emit('close')">
        <div class="bg-gray-800 rounded-xl shadow-2xl w-full lg:max-w-7xl p-6 h-[90vh] flex flex-col">

            <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-4">
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <i class="fi fi-rr-edit text-3xl mr-3 text-blue-400"></i>
                    Editar Pedido de: {{ pedido.clienteNome }}
                </h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-white transition">
                    <i class="fi fi-rr-cross-small text-2xl"></i>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto pr-2 space-y-4">
                <div class="grid grid-cols-12 gap-6">

                    <div class="col-span-12 lg:col-span-8 space-y-6">
                        <ClientSelector :cliente-logica="clientLogic" :disabled="true" /> 
                        <ItemAdder :item-logica="itemLogic" />
                    </div>

                    <div class="col-span-12 lg:col-span-4 space-y-6">
                        <DateSelector :date-logica="dateLogic" :disabled="true" /> 
                        <DiscountForm :discount-logica="discountLogic" /> 
                        <PaymentForm :payment-logica="paymentLogic" :is-editing="true" />
                    </div>

                </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                <button @click="atualizarPedido"
                    :disabled="itemLogic.itensDoPedido.value.length === 0"
                    class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Salvar Edição (R$ {{ paymentLogic.valorTotalPedido.value.toFixed(2) || '0.00' }})
                </button>
            </div>
        </div>
    </div>
</template>