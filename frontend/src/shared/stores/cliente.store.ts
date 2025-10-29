import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { db } from "../services/Database/Database";
import type { Cliente } from "../types/cliente.type";
import { toCaps, formatarTelefone } from "@/shared/helpers/data.helper";

export const useClienteStore = defineStore('clientes', () => {
    const clientes = ref<Cliente[]>([]);
    const carregando = ref(false);

    async function carregarClientes() {
        try {
            clientes.value = await db.clientes.toArray();
            carregando.value = true;
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    }

    async function adicionarCliente(novoCliente: Cliente): Promise<number | undefined> {
        try {
            let clienteParaSalvar = toRaw(novoCliente);

            clienteParaSalvar.nome = toCaps(clienteParaSalvar.nome);
            if (clienteParaSalvar.telefone) {
                clienteParaSalvar.telefone = formatarTelefone(clienteParaSalvar.telefone);
            }

            const id = await db.clientes.add(clienteParaSalvar);
            await carregarClientes();
            return id;

        } catch (error) {
            console.error('Erro ao adicionar cliente ao Dexie:', error);
        }
    }

    return {
        clientes,
        carregando,
        carregarClientes,
        adicionarCliente,
    };
});