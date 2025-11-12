<script setup lang="ts">
import ClientSelector from '@/shared/components/create-order/ClientSelector.vue';
import ItemAdder from '@/shared/components/create-order/ItemAdder.vue';
import PaymentForm from '@/shared/components/create-order/PaymentForm.vue';
import DateSelector from '@/shared/components/create-order/DateSelector.vue';
import DescountForm from '@/shared/components/create-order/DescountForm.vue';
import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';
import { useClientFormLogic } from '@/shared/helpers/create-order/clientFormLogic.helper';
import { useItemManagementLogic } from '@/shared/helpers/create-order/itemManagementLogic.helper';
import { usePaymentFormLogic } from '@/shared/helpers/create-order/paymentFormLogic.helper';
import { useDateLogic } from '@/shared/helpers/create-order/dateLogic';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { useServiceStore } from '@/shared/stores/catolog.store';
import { useDiscountLogic } from '@/shared/helpers/create-order/discountLogic';
import { showToast } from '@/shared/helpers/toastState';

const draftStore = useDraftOrderStore();
const clientLogic = useClientFormLogic();
const itemLogic = useItemManagementLogic();
const paymentLogic = usePaymentFormLogic();
const dateLogic = useDateLogic();
const pedidoStore = usePedidoStore();
const catalogStore = useServiceStore();
const discountLogic = useDiscountLogic();

catalogStore.loadCatalog();

const resetFormulary = () => {
    draftStore.resetDraft();
    clientLogic.resetClientState();
    // Adicione aqui as chamadas de reset para outros helpers (itemLogic, paymentLogic, dateLogic, discountLogic)
    // assim que você os implementar. Ex: paymentLogic.resetPaymentState();
};

const finalizarPedido = async () => {

    if (!clientLogic.clienteSelecionado.value) {
        showToast('Selecione um cliente antes de finalizar.', 'warning');
        return;
    }
    if (itemLogic.itensDoPedido.value.length === 0) {
        showToast('Adicione itens ao pedido antes de finalizar.', 'warning');
        return;
    }

    if (paymentLogic.valorTotalPedido.value <= 0) {
        showToast('O valor total do pedido deve ser maior que zero após o desconto.', 'warning');
        return;
    }

    try {
        const pedidoParaSalvar = draftStore.toPedidoForSave();

        if (!pedidoParaSalvar) {
            return;
        }

        const uuidSalvo = await pedidoStore.adicionarPedido(pedidoParaSalvar);

        if (uuidSalvo) {
            showToast(`Pedido Criado com Sucesso! Status: ${pedidoParaSalvar.status}.`, 'success');
            resetFormulary();
        } else {
            showToast('Falha ao salvar o pedido. Tente novamente.', 'error');
        }

    } catch (error) {
        showToast(`Erro ao salvar: Ocorreu um erro desconhecido.`, 'error');
    }
};

</script>

<template>
    <div class="rounded-xl shadow-2xl w-full">

        <div class="flex justify-between items-center border border-gray-500 p-5 rounded-lg">
            <h2 class="text-2xl font-bold text-white flex items-center">
                <i class="fi fi-rr-document-signed text-3xl mr-3 text-blue-400"></i>
                Criar Novo Pedido
            </h2>
        </div>

        <div class="flex-1 overflow-y-auto pr-2 space-y-4 mt-5">
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
</template>