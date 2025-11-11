import { db } from '@/shared/services/Database/Database';
import type { Cliente } from '@/shared/types/cliente.type';
import type { Pedido } from '@/shared/types/order.type';
import { generateUUID } from './uuid.helper';
import { showToast } from './toastState';

interface ClienteBackup {
    clientes: Cliente[];
    version: string;
    timestamp: number;
}

interface PedidoBackup {
    pedidos: Pedido[];
    version: string;
    timestamp: number;
}

const DATABASE_VERSION = '1.0.0';

function iniciarDownload(data: object, filenamePrefix: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const dataFormatada = new Date().toISOString().slice(0, 10);
    a.download = `${filenamePrefix}_${dataFormatada}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ Download iniciado com sucesso!', 'success');
}

export async function exportarBackupClientes(): Promise<void> {
    try {
        const clientes = await db.clientes.toArray();
        const backupData: ClienteBackup = {
            clientes: clientes,
            version: DATABASE_VERSION,
            timestamp: Date.now(),
        };
        iniciarDownload(backupData, 'backup_clientes');
    } catch (error) {
        showToast('❌ Falha ao exportar clientes. Verifique o acesso ao IndexedDB.', 'error');
    }
}

export async function exportarBackupPedidos(): Promise<void> {
    try {
        const pedidos = await db.pedidos.toArray();
        const backupData: PedidoBackup = {
            pedidos: pedidos,
            version: DATABASE_VERSION,
            timestamp: Date.now(),
        };
        iniciarDownload(backupData, 'backup_pedidos');
    } catch (error) {
        showToast('❌ Falha ao exportar pedidos. Verifique o acesso ao IndexedDB.', 'error');
    }
}

export async function importarBackupClientes(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const result = event.target?.result as string;
                const backupData: ClienteBackup = JSON.parse(result);

                if (!backupData.clientes || !Array.isArray(backupData.clientes)) {
                    throw new Error('Estrutura de arquivo de clientes inválida.');
                }

                await db.transaction('rw', db.clientes, async () => {
                    for (const clienteDoArquivo of backupData.clientes) {
                        const clienteExistente = await db.clientes
                            .where({ nome: clienteDoArquivo.nome, telefone: clienteDoArquivo.telefone })
                            .first();

                        const clienteParaSalvar: Cliente = {
                            nome: clienteDoArquivo.nome,
                            telefone: clienteDoArquivo.telefone,
                            uuid: clienteExistente ? clienteExistente.uuid : generateUUID() 
                        };

                        if (clienteExistente) {
                            await db.clientes.update(clienteExistente.uuid, clienteParaSalvar);
                        } else {
                            await db.clientes.add(clienteParaSalvar);
                        }
                    }
                });
                showToast('Clientes importados com sucesso!', 'success');
                resolve();
            } catch (e) {
                const errorMessage = (e as Error).message || 'Formato de arquivo ou dados de clientes inválidos.';
                showToast(`❌ Erro ao importar clientes: ${errorMessage}`, 'error');
                reject(errorMessage); 
            }
        };
        reader.onerror = () => {
            showToast('❌ Erro ao ler o arquivo de clientes.', 'error');
            reject('Erro ao ler o arquivo de clientes.');
        };
        reader.readAsText(file);
    });
}

export async function importarBackupPedidos(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const result = event.target?.result as string;
                const backupData: PedidoBackup = JSON.parse(result);

                if (!backupData.pedidos || !Array.isArray(backupData.pedidos)) {
                    throw new Error('Estrutura de arquivo de pedidos inválida.');
                }

                const totalClientes = await db.clientes.count();
                if (totalClientes === 0) {
                    const msg = 'Não há clientes no banco de dados. Importe os clientes primeiro.';
                    showToast(`⚠️ ${msg}`, 'warning');
                    reject(msg);
                    return;
                }

                await db.transaction('rw', db.pedidos, async () => {
                    await db.pedidos.bulkPut(backupData.pedidos);
                });

                showToast('Pedidos importados com sucesso!', 'success');
                resolve();

            } catch (error) {
                const errorMessage = (error as Error).message || 'Formato de arquivo ou dados de pedidos inválidos.';
                showToast(`❌ Erro ao importar pedidos: ${errorMessage}`, 'error');
                reject(errorMessage);
            }
        };
        reader.onerror = () => {
            showToast('❌ Erro ao ler o arquivo de pedidos.', 'error');
            reject('Erro ao ler o arquivo de pedidos.');
        };
        reader.readAsText(file);
    });
}