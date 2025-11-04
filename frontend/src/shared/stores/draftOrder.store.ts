import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Pedido, PedidoItemPeca, PedidoStatus, FormaPagamento, PagamentoRegistro } from "@/shared/types/pedido.type";
import type { IGarmentType, IService } from "@/shared/types/catalog.type";
import type { Cliente } from "@/shared/types/cliente.type";
import { generateUUID } from "@/shared/helpers/uuid.helper";
import { getDataHojeString } from "@/shared/helpers/data.helper";

interface DraftOrder {
    cliente: Cliente | null;
    dataEntrega: string;
    horarioEntrega: string;
    itens: PedidoItemPeca[];
    pagamentos: PagamentoRegistro[];
}

function calcularValorTotalItens(itens: PedidoItemPeca[]): number {
    return itens.reduce((totalGeral, peca) => {
        const subtotalPeca = peca.servicos.reduce((totalPeca, servico) => {
            return totalPeca + (servico.quantidade * servico.unitPrice);
        }, 0);
        return totalGeral + subtotalPeca;
    }, 0);
}

export const useDraftOrderStore = defineStore('draft-order', () => {
    const rascunho = ref<DraftOrder>({
        cliente: null,
        dataEntrega: getDataHojeString(),
        horarioEntrega: '',
        itens: [],
        pagamentos: [],
    });

    const linhaAtual = computed(() => rascunho.value.itens.length + 1);

    const valorTotalPedido = computed(() => calcularValorTotalItens(rascunho.value.itens));

    const valorTotalPago = computed(() => {
        return rascunho.value.pagamentos.reduce((total, p) => total + p.valor, 0);
    });

    const valorRestante = computed(() => {
        return Math.max(0, valorTotalPedido.value - valorTotalPago.value);
    });

    function resetDraft() {
        rascunho.value = {
            cliente: null,
            dataEntrega: getDataHojeString(),
            horarioEntrega: '',
            itens: [],
            pagamentos: [],
        };
    }

    function setCliente(cliente: Cliente) {
        rascunho.value.cliente = cliente;
    }

    function addGarment(garmentType: IGarmentType) {
        const novaPeca: PedidoItemPeca = {
            uuid: generateUUID(),
            garmentTypeId: garmentType.uuid,
            garmentName: garmentType.name,
            lineNumber: linhaAtual.value,
            servicos: [],
        };
        rascunho.value.itens.push(novaPeca);
    }

    function addServiceToGarment(garmentUuid: string, service: IService, quantidade: number, price: number) {
        const peca = rascunho.value.itens.find(p => p.uuid === garmentUuid);
        if (peca) {
            peca.servicos.push({
                uuid: generateUUID(),
                serviceId: service.uuid,
                name: service.name,
                quantidade: quantidade,
                unitPrice: price,
            });
        }
    }

    function removeGarment(garmentUuid: string) {
        rascunho.value.itens = rascunho.value.itens.filter(p => p.uuid !== garmentUuid);
        rascunho.value.itens.forEach((p, index) => {
            p.lineNumber = index + 1;
        });
    }
    
    function removeServiceFromGarment(garmentUuid: string, serviceUuid: string) {
        const peca = rascunho.value.itens.find(p => p.uuid === garmentUuid);
        if (peca) {
            peca.servicos = peca.servicos.filter(s => s.uuid !== serviceUuid);
        }
    }

    function addPayment(forma: FormaPagamento, valor: number) {
        rascunho.value.pagamentos.push({
            forma,
            valor,
            timestamp: Date.now(),
        });
    }

    function removePayment(index: number) {
        rascunho.value.pagamentos.splice(index, 1);
    }

    function toPedidoForSave(): Omit<Pedido, 'uuid'> {
        if (!rascunho.value.cliente) {
            throw new Error('Cliente deve ser selecionado para salvar o pedido.');
        }

        const statusOperacionalInicial: PedidoStatus = 'PENDENTE';
        
        return {
            clienteUuidd: rascunho.value.cliente.uuid,
            clienteNome: rascunho.value.cliente.nome,
            dataEntrega: rascunho.value.dataEntrega,
            horarioEntrega: rascunho.value.horarioEntrega,
            itens: rascunho.value.itens, 
            status: statusOperacionalInicial,
            dataCriacao: getDataHojeString(),
            pagamentos: rascunho.value.pagamentos,
            valorPago: valorTotalPago.value,
        } as Omit<Pedido, 'uuid'>; 
    }

    return {
        rascunho,
        valorTotalPedido,
        valorTotalPago,
        valorRestante,
        linhaAtual,
        resetDraft,
        setCliente,
        addGarment,
        removeGarment,
        addServiceToGarment,
        removeServiceFromGarment,
        addPayment,
        removePayment,
        toPedidoForSave
    };
});
