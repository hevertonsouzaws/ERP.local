<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getDiasNoMes, getPrimeiroDiaSemana, getDataHojeString } from '@/shared/helpers/data.helper';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import type { Pedido } from '@/shared/types/pedido.type';

const pedidoStore = usePedidoStore();
const hoje = getDataHojeString();

const dataAtual = ref(new Date());
const mesAtual = computed(() => dataAtual.value.getMonth());
const anoAtual = computed(() => dataAtual.value.getFullYear());

const diasDoMes = computed(() => getDiasNoMes(anoAtual.value, mesAtual.value));
const primeiroDia = computed(() => getPrimeiroDiaSemana(anoAtual.value, mesAtual.value));

const nomeMes = computed(() => dataAtual.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const selectedDate = ref(hoje);

const getDiaString = (dia: number): string => {
    const mes = String(mesAtual.value + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${anoAtual.value}-${mes}-${d}`;
}

const isSelected = (dia: number) => selectedDate.value === getDiaString(dia);
const isHoje = (dia: number) => hoje === getDiaString(dia);

const mudarMes = (delta: number) => {
    const novaData = new Date(dataAtual.value);

    novaData.setMonth(novaData.getMonth() + delta);

    dataAtual.value = novaData;

    selecionarDia(getDiaString(novaData.getDate()));
}

const selecionarDia = (dia: string) => {
    selectedDate.value = dia;
    pedidoStore.filtrarPedidosPorData(dia);
}

const pedidosPorDia = computed(() => {
    const contagem: { [key: string]: number } = {};

    pedidoStore.pedidos.forEach((pedido: Pedido) => {
        const data = pedido.dataEntrega;
        if (data.startsWith(`${anoAtual.value}-${String(mesAtual.value + 1).padStart(2, '0')}`)) {
            contagem[data] = (contagem[data] || 0) + 1;
        }
    });
    return contagem;
});

const getContagemPedidos = (dia: number): number => {
    return pedidosPorDia.value[getDiaString(dia)] || 0;
}

onMounted(() => {
    pedidoStore.carregarPedidos();
    selecionarDia(hoje);
});
</script>

<template>
    <div class="w-full bg-gray-800 py-3 p-6 rounded-xl shadow-xl text-white">
        <div class="flex justify-between items-center mb-4">
            <button @click="mudarMes(-1)"
                class="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition">
                <i class="fi fi-rr-angle-left text-xl"></i>
            </button>

            <h3 class="text-xl font-semibold capitalize">{{ nomeMes }}</h3>

            <button @click="mudarMes(1)"
                class="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition">
                <i class="fi fi-rr-angle-right text-xl"></i>
            </button>
        </div>

        <div class="flex mb-2">
            <div v-for="dia in diasDaSemana" :key="dia" class="w-[14.28%] text-center text-sm text-gray-400 font-bold">
                {{ dia }}
            </div>
        </div>

        <div class="flex flex-wrap">
            <div v-for="i in primeiroDia" :key="`vazio-${i}`" class="w-[14.28%] h-16"></div>

            <div v-for="dia in diasDoMes" :key="dia" class="w-[14.28%] h-[80px] flex justify-center items-center p-0.5">
                <button @click="selecionarDia(getDiaString(dia))" :class="[
                    'w-full h-full flex flex-col justify-center items-center rounded-xl text-white font-medium transition duration-150 relative',
                    { 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-500': isSelected(dia) },
                    { 'ring-2 ring-blue-500/50 bg-gray-700': isHoje(dia) && !isSelected(dia) },
                    { 'hover:bg-gray-700': !isSelected(dia) && !isHoje(dia) },
                    { 'bg-gray-700/50': !isSelected(dia) && !isHoje(dia) && getContagemPedidos(dia) > 0 }
                ]">
                    <span class="text-lg font-bold">{{ dia }}</span>

                    <span v-if="getContagemPedidos(dia) > 0"
                        class="absolute bottom-1 right-1 text-xs font-bold text-white w-5 h-5 flex items-center justify-center rounded-full"
                        :class="[
                            isSelected(dia) ? 'bg-white/30' : 'bg-blue-600'
                        ]">
                        {{ getContagemPedidos(dia) }}
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>