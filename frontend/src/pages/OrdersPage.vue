<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import type { Pedido, PedidoStatus } from '@/shared/types/order.type';
import { showToast } from '@/shared/helpers/toastState';
import ReceberPagamentoModal from '@/shared/components/orders-page/AddPaymentModal.vue';
import EditOrderModal from '@/shared/components/orders-page/EditOrderModal.vue'; 
import PedidoCard from '@/shared/components/orders-page/OrderCard.vue';
import CreateOrder from '@/shared/components/create-order/CreateOrder.vue';

const store = usePedidoStore();
const filtroStatus = ref<PedidoStatus | 'TODOS'>('TODOS');

const pedidoSelecionado = ref<Pedido | null>(null);
const mostrarModalPagamento = ref(false);

const pedidoParaEditar = ref<Pedido | null>(null);
const mostrarModalEdicao = ref(false);

const isModalOpen = ref(false);

onMounted(() => {
    if (!store.carregando) {
        store.carregarPedidos();
    }
});

const pedidosFiltrados = computed(() => {
    let list = store.pedidos.slice();

    if (filtroStatus.value !== 'TODOS') {
        list = list.filter(p => p.status === filtroStatus.value);
    }

    return list.sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega));
});

const mudarStatus = async (pedido: Pedido, novoStatus: PedidoStatus, valorTotal: number) => {
    if (pedido.status === novoStatus) return;

    const valorRestante = valorTotal - pedido.valorPago;

    if (novoStatus === 'CONCLUIDO' && valorRestante > 0) {
        showToast(`Atenção! O pedido ${pedido.uuid.substring(0, 8)} tem R$ ${valorRestante.toFixed(2)} pendentes. Concluindo...`, 'warning');
    }

    try {
        await store.atualizarStatusPedido(pedido.uuid, novoStatus);
        showToast(`Status do Pedido ${pedido.uuid.substring(0, 8)} alterado para ${novoStatus}!`, 'success');
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showToast('Erro ao atualizar status do pedido. Verifique o console.', 'error');
    }
}

const abrirModalPagamento = (pedido: Pedido) => {
    pedidoSelecionado.value = pedido;
    mostrarModalPagamento.value = true;
};

const fecharModalPagamento = () => {
    mostrarModalPagamento.value = false;
    pedidoSelecionado.value = null;
};

const handlePagamentoSucesso = () => {
    fecharModalPagamento();
};

const abrirModalEdicao = (pedido: Pedido) => {
    pedidoParaEditar.value = pedido;
    mostrarModalEdicao.value = true;
};

const fecharModalEdicao = () => {
    mostrarModalEdicao.value = false;
    pedidoParaEditar.value = null; 
};

const handleEdicaoSucesso = () => {
    fecharModalEdicao();
};
</script>

<template>
    <div class="min-h-screen text-white py-2 p-8 w-full">

        <div class="mb-6 flex justify-between items-center p-4 border border-gray-500 rounded-xl shadow-xl">
            <p class="text-base font-semibold">Total de Pedidos: {{ store.pedidos.length }}</p>

            <div class="flex items-center space-x-3">
                <label class="text-gray-200">Filtrar por Status:</label>
                <select v-model="filtroStatus" class="p-2 bg-gray-900 border border-gray-200 rounded-xl text-white">
                    <option value="TODOS">Todos ({{ store.pedidos.length }})</option>
                    <option value="PENDENTE">Pendentes</option>
                    <option value="CONCLUIDO">Concluídos</option>
                    <option value="CANCELADO">Cancelados</option>
                </select>
            </div>
        </div>

        <div class="rounded-xl shadow-2xl">
            <div  class="flex flex-row justify-left flex-wrap gap-5">
                <PedidoCard v-for="pedido in pedidosFiltrados" :key="pedido.uuid" :pedido="pedido"
                    @change-status="mudarStatus" 
                    @open-payment-modal="abrirModalPagamento"
                    @open-edit-modal="abrirModalEdicao" /> 
            </div>
        </div>

        <ReceberPagamentoModal 
            v-if="mostrarModalPagamento && pedidoSelecionado" 
            :pedido="pedidoSelecionado" 
            @close="fecharModalPagamento"
            @payment-success="handlePagamentoSucesso" 
        />

        <EditOrderModal
            v-if="mostrarModalEdicao && pedidoParaEditar"
            :pedido="pedidoParaEditar"
            @close="fecharModalEdicao"
            @edit-success="handleEdicaoSucesso"
        />

        <button @click="isModalOpen = true"
            class="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white text-3xl transition duration-300 hover:bg-blue-500 hover:scale-105 z-20">
            <i class="fi fi-rr-plus"></i>
        </button>

        <CreateOrder v-if="isModalOpen" @close="isModalOpen = false" />
        
    </div>
</template>