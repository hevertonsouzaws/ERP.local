<script setup lang="ts">
import type { Pedido, PedidoStatus, PedidoItemPeca } from '@/shared/types/order.type';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { formatarDataParaExibicao, formatarTelefone } from '@/shared/helpers/data.helper';
import { computed } from 'vue';

const props = defineProps<{
    pedido: Pedido;
}>();

const emit = defineEmits(['change-status', 'open-payment-modal', 'open-edit-modal']);

const pedidoStore = usePedidoStore();

const getStatusClass = (status: PedidoStatus) => {
    switch (status) {
        case 'PENDENTE': return 'border border-yellow-400';
        case 'CONCLUIDO': return 'border border-green-400';
        case 'CANCELADO': return 'border border-red-600';
    }
}

const valorTotal = computed(() => pedidoStore.calcularValorTotalPedido(props.pedido));

const valorRestante = computed(() => valorTotal.value - props.pedido.valorPago);

const subtotal = computed(() => {
    const descontoRatio = 1 - (props.pedido.descontoPorcentagem / 100);
    return descontoRatio > 0 ? valorTotal.value / descontoRatio : 0;
});

const valorDesconto = computed(() => subtotal.value * (props.pedido.descontoPorcentagem / 100));

const emitirMudarStatus = (novoStatus: PedidoStatus) => {
    emit('change-status', props.pedido, novoStatus, valorTotal.value);
}

const emitirAbrirPagamento = () => {
    emit('open-payment-modal', props.pedido);
}

const emitirAbrirEdicao = () => {
    emit('open-edit-modal', props.pedido);
}

const formatarItensParaExibicao = (itens: PedidoItemPeca[]): string[] => {
    const linhas: string[] = [];
    itens.forEach(peca => {
        linhas.push(`${peca.lineNumber}.${peca.garmentName.toUpperCase()}`);

        peca.servicos.forEach(servico => {
            const precoFormatado = servico.unitPrice.toFixed(2).replace('.', ',');
            linhas.push(`- ${servico.quantidade}x ${servico.name} (R$ ${precoFormatado})`);
        });
    });

    if (linhas.length === 0) {
        linhas.push('Nenhum item adicionado ao pedido.');
    }
    return linhas;
}
</script>

<template>
    <div
        class="w-full p-5 border border-gray-400 rounded-xl shadow-md transition duration-150 lg:w-[48%] 2xl:w-[32.3%] ">
        <div class="flex justify-between items-start border-b border-gray-600 pb-3 mb-3">
            <div class="flex items-center">
                <i class="fi fi-rr-user text-white mr-2 text-xl"></i>
                <p class="font-semibold text-sm text-white">{{ pedido.clienteNome }} - {{ formatarTelefone(pedido?.clienteTelefone) || 'sem telefone' }}</p>
            </div>
            <span :class="['text-xs py-1 px-4 rounded-full uppercase', getStatusClass(pedido.status)]">
                {{ pedido.status }}
            </span>
        </div>

        <div class="flex justify-between items-center mb-2">
            <div>
                <p class="font-semibold text-base"> {{ formatarDataParaExibicao(pedido.dataEntrega) }} <span
                        v-if="pedido.horarioEntrega">({{ pedido.horarioEntrega }})</span></p>
            </div>
            <div class="text-right">
                <p class="font-bold text-base text-white">Total: R$ {{ valorTotal.toFixed(2) }}</p>

                <p v-if="pedido.descontoPorcentagem > 0" class="text-xs text-yellow-400 font-semibold">
                    Desc. {{ pedido.descontoPorcentagem.toFixed(0) }}%: R$ {{ valorDesconto.toFixed(2) }}
                </p>

                <p class="text-sm font-semibold" :class="valorRestante <= 0 ? 'text-green-400' : 'text-red-400'">
                    Pago: R$ {{ pedido.valorPago.toFixed(2) }}
                </p>
            </div>
        </div>

        <div
            class="h-[110px] overflow-y-auto border-t border-b border-gray-600 rounded-lg p-2 mb-3 bg-gray-800 text-gray-200 text-sm italic font-mono">
            <p v-for="(linha, index) in formatarItensParaExibicao(pedido.itens)" :key="index">
                {{ linha }}
            </p>
        </div>

        <div class="pt-2 flex justify-end gap-2">
            <button 
                v-if="pedido.status !== 'CANCELADO'"
                @click="emitirAbrirPagamento"
                class="py-1 px-3 rounded-lg text-sm transition duration-150 border border-gray-400 hover:bg-green-800 hover:border-green-800 text-white font-semibold flex items-center">
                <i class="fi fi-rr-coins mr-1"></i> Pagar
            </button>

            <button 
                v-if="pedido.status !== 'CANCELADO' && pedido.status !== 'CONCLUIDO'" 
                @click="emitirAbrirEdicao"
                class="py-1 px-3 rounded-lg text-sm transition duration-150 border border-gray-400 hover:bg-blue-800 hover:border-blue-800 text-white font-semibold flex items-center">
                <i class="fi fi-rr-edit mr-1"></i> Editar
            </button>

            <button @click="emitirMudarStatus('PENDENTE')" :disabled="pedido.status === 'PENDENTE'"
                class="py-1 px-3 rounded-lg text-sm transition duration-150"
                :class="[pedido.status === 'PENDENTE' ? 'bg-gray-600 text-gray-200 cursor-not-allowed' : 'border border-gray-400 hover:border-yellow-800 hover:bg-yellow-800 text-white']">
                <i class="fi fi-rr-clock mr-1"></i> REFAZER
            </button>

            <button @click="emitirMudarStatus('CONCLUIDO')" :disabled="pedido.status === 'CONCLUIDO'"
                class="py-1 px-3 rounded-lg text-sm transition duration-150"
                :class="[pedido.status === 'CONCLUIDO' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'border border-gray-400 hover:bg-green-800 hover:border-green-800 text-white']">
                <i class="fi fi-rr-check-circle mr-1"></i> Concluir
            </button>
        </div>
    </div>
</template>