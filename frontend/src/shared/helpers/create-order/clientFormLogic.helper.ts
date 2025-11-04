import { ref, computed } from 'vue';
import { useClienteStore } from '@/shared/stores/cliente.store';
import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';
import type { Cliente } from '@/shared/types/cliente.type';

export function useClientFormLogic() {
    const clienteStore = useClienteStore();
    const draftStore = useDraftOrderStore();

    const clienteBusca = ref(draftStore.rascunho.cliente?.nome || '');
    const mostrarNovoCliente = ref(false);
    const novoClienteData = ref<Omit<Cliente, 'uuid'>>({ nome: '', telefone: '' });

    const clientesFiltrados = computed(() => {
        if (!clienteBusca.value) {
            return clienteStore.clientes.slice(0, 5); 
        }
        return clienteStore.clientes.filter(c =>
            c.nome.toLowerCase().includes(clienteBusca.value.toLowerCase())
        );
    });

    const selecionarCliente = (cliente: Cliente) => {
        draftStore.setCliente(cliente); 
        clienteBusca.value = cliente ? cliente.nome : ''; 
    };

    const cadastrarESelecionarCliente = async () => {
        if (!novoClienteData.value.nome) {
            // Substituir 'alert' por modal de UI na implementação final.
            console.error('O nome do novo cliente é obrigatório.'); 
            return;
        }

        const uuid = await clienteStore.adicionarCliente(novoClienteData.value);

        if (uuid) {
            const clienteRecemCadastrado = clienteStore.clientes.find(c => c.uuid === uuid);
            if (clienteRecemCadastrado) {
                selecionarCliente(clienteRecemCadastrado);
                mostrarNovoCliente.value = false; 
            }
        } else {
            console.error('Erro ao cadastrar cliente.');
        }
    }

    return {
        clienteBusca,
        mostrarNovoCliente,
        novoClienteData,
        
        clientesFiltrados,
        clienteSelecionado: computed(() => draftStore.rascunho.cliente), 

        selecionarCliente,
        cadastrarESelecionarCliente,
    };
}

export type ClientFormLogic = ReturnType<typeof useClientFormLogic>;
