import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Pedido, PedidoItemPeca, PedidoItemServico, FormaPagamento, PagamentoRegistro } from "@/shared/types/pedido.type";
import type { IGarmentType, IService } from "@/shared/types/catalog.type"; // Tipagens de Catálogo
import type { Cliente } from "@/shared/types/cliente.type";
import { generateUUID } from "@/shared/helpers/uuid.helper";
import { getDataHojeString } from "@/shared/helpers/data.helper";

// Define a estrutura do rascunho (apenas os dados necessários)
interface DraftOrder {
    cliente: Cliente | null;
    dataEntrega: string;
    horarioEntrega: string;
    itens: PedidoItemPeca[];
    pagamentos: PagamentoRegistro[];
}

// ==========================================================
// FUNÇÕES UTILITÁRIAS
// ==========================================================

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
        // Reajusta os lineNumbers
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

    // Função que transforma o rascunho em um objeto Pedido pronto para salvar
    function toPedidoForSave(): Omit<Pedido, 'uuid'> {
        if (!rascunho.value.cliente) {
            throw new Error('Cliente deve ser selecionado para salvar o pedido.');
        }

        return {
            clienteUuidd: rascunho.value.cliente.uuid,
            clienteNome: rascunho.value.cliente.nome,
            dataEntrega: rascunho.value.dataEntrega,
            horarioEntrega: rascunho.value.horarioEntrega,
            // NOVO: Usando a nova estrutura
            itens: rascunho.value.itens, 
            status: valorRestante.value <= 0 ? 'CONCLUIDO' : 'PENDENTE',
            dataCriacao: getDataHojeString(),
            pagamentos: rascunho.value.pagamentos,
            valorPago: valorTotalPago.value,
        } as Omit<Pedido, 'uuid'>; 
        // Omit<Pedido, 'uuid'> é usado para satisfazer o argumento da store principal
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