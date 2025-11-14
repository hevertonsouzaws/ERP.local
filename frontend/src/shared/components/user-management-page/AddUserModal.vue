<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUserStore } from '@/shared/stores/user.store';
import type { User, UserRole } from '@/shared/types/user.type';

const userStore = useUserStore();

const props = defineProps<{
    isOpen: boolean;
    userToEdit: User | null;
}>();

const emit = defineEmits(['close', 'success']);

const isEditing = ref(false);
const name = ref('');
const password = ref('');
const role = ref<UserRole>('OPERADOR');
const nameError = ref('');
const passwordError = ref('');
const showPassword = ref(false); 

watch(() => props.userToEdit, (newUser) => {
    if (newUser) {
        isEditing.value = true;
        name.value = newUser.name;
        role.value = newUser.role;
        password.value = newUser.password || ''; 
    } else {
        isEditing.value = false;
        resetForm();
    }
}, { immediate: true });

function resetForm() {
    name.value = '';
    password.value = '';
    role.value = 'OPERADOR';
    nameError.value = '';
    passwordError.value = '';
    showPassword.value = false; 
}

function validateForm(): boolean {
    nameError.value = '';
    passwordError.value = '';
    
    if (!name.value.trim()) {
        nameError.value = 'O nome é obrigatório.';
        return false;
    }
    
    if (!isEditing.value && !password.value.trim()) {
        passwordError.value = 'A senha é obrigatória para um novo usuário.';
        return false;
    }
    
    if (userStore.users.some(u => u.name.toLowerCase() === name.value.toLowerCase() && u.uuid !== props.userToEdit?.uuid)) {
        nameError.value = 'Este nome de usuário já está em uso.';
        return false;
    }
    
    return true;
}

async function handleSubmit() {
    if (!validateForm()) {
        return;
    }

    try {
        if (isEditing.value && props.userToEdit) {
            const updatePayload: Partial<User> = { uuid: props.userToEdit.uuid, name: name.value, role: role.value };
            
            if (password.value.trim() && password.value !== props.userToEdit.password) {
                updatePayload.password = password.value;
            } else if (!password.value.trim() && props.userToEdit.password) {
                updatePayload.password = props.userToEdit.password;
            } else if (!password.value.trim() && !props.userToEdit.password) {
            }

            await userStore.updateUser(updatePayload);
            emit('success', 'Usuário atualizado com sucesso!');
        } else {
            await userStore.addUser(name.value, password.value, role.value);
            emit('success', 'Novo usuário adicionado com sucesso!');
        }
        
        closeModal();
    } catch (error: any) {
        emit('success', `Erro: ${error.message}`);
    }
}

function closeModal() {
    resetForm();
    emit('close');
}

function togglePasswordVisibility() {
    showPassword.value = !showPassword.value;
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl">
            <h3 class="text-2xl font-bold mb-6 text-gray-200">
                {{ isEditing ? 'Editar Usuário: ' + props.userToEdit?.name : 'Adicionar Novo Usuário' }}
            </h3>
            
            <form @submit.prevent="handleSubmit" class="space-y-4">
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Nome do Usuário</label>
                    <input type="text" v-model.trim="name" required
                        class="w-full p-3 bg-gray-800 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" />
                    <p v-if="nameError" class="text-red-400 text-sm mt-1">{{ nameError }}</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Perfil de Acesso</label>
                    <select v-model="role" required
                        class="w-full p-3 bg-gray-800 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500">
                        <option value="ADMIN">ADMINISTRADOR</option>
                        <option value="OPERADOR">OPERADOR</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                        {{ isEditing ? 'Senha Atual / Nova Senha' : 'Senha' }}
                    </label>
                    <div class="relative">
                        <input 
                            :type="showPassword ? 'text' : 'password'" 
                            v-model="password" 
                            :required="!isEditing"
                            class="w-full p-3 bg-gray-800 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 pr-10" 
                        />
                        <button type="button" @click="togglePasswordVisibility" 
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition"
                            :title="showPassword ? 'Ocultar Senha' : 'Visualizar Senha'">
                            <i v-if="showPassword" class="fi fi-rr-eye-crossed"></i>
                            <i v-else class="fi fi-rr-eye"></i>
                        </button>
                    </div>
                    <p v-if="passwordError" class="text-red-400 text-sm mt-1">{{ passwordError }}</p>
                    <p v-if="isEditing" class="text-xs text-gray-200 mt-1">Preencha este campo apenas se desejar **alterar** a senha.</p>
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" @click="closeModal"
                        class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition">
                        Cancelar
                    </button>
                    <button type="submit"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                        {{ isEditing ? 'Salvar Alterações' : 'Adicionar Usuário' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>