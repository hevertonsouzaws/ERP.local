import { defineStore } from "pinia";
import { ref, computed } from 'vue'
import type { User, UserRole } from "../types/user.type";
import { generateUUID } from "../helpers/uuid.helper";
import type { PersistedStateOptions } from "pinia-plugin-persistedstate";
import { db } from "../services/Database/Database";
import { showToast } from "../helpers/toastState";

const initialUsers: User[] = [
    { uuid: generateUUID(), name: 'Tom', role: 'ADMIN', avatarColor: '#4F46E5', password: 'tom', avatarUrl: null },
];

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>([]); 
    const currentUser = ref<User | null>(null);

    const isLoggedIn = computed(() => currentUser.value !== null);
    const isAdmin = computed(() => currentUser.value?.role === 'ADMIN');

    async function loadUsers() {
        const count = await db.users.count();
        if (count === 0) {
            await db.users.bulkAdd(initialUsers);
            users.value = initialUsers;
        } else {
            users.value = await db.users.toArray();
        }
    }

    async function addUser(name: string, password: string, role: UserRole) {
        if (users.value.some(u => u.name.toLowerCase() === name.toLowerCase())) {
            throw showToast('Nome de usuário já existe.', 'error');
        }

        const newUser: User = {
            uuid: generateUUID(),
            name,
            role,
            password,
            avatarColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
            avatarUrl: null,
        };

        await db.users.add(newUser);
        await loadUsers();
    }

    async function updateUser(userUpdate: Partial<User>) {
        if (!userUpdate.uuid) return;
        
        await db.users.update(userUpdate.uuid, userUpdate);
        await loadUsers();
        
        if (currentUser.value && currentUser.value.uuid === userUpdate.uuid) {
            const updatedUser = users.value.find(u => u.uuid === userUpdate.uuid);
            if (updatedUser) {
                const { password, ...safeUser } = updatedUser; 
                currentUser.value = { ...safeUser, password: currentUser.value.password };
            }
        }
    }
    
    async function deleteUser(uuid: string) {
        if (currentUser.value && currentUser.value.uuid === uuid) {
            throw new Error('Não é possível deletar o usuário logado.');
        }
        await db.users.delete(uuid);
        await loadUsers();
    }

    function findUserByName(name: string): User | undefined {
        return users.value.find(u => u.name.toLowerCase() === name.toLowerCase());
    }

    function authenticateUser(name: string, pass: string): User | undefined {
        const user = users.value.find(u => u.name.toLowerCase() === name.toLowerCase());

        if (user && user.password && user.password === pass) {
            return user;
        }
        return undefined;
    }

    function setCurrentUser(user: User) {
        currentUser.value = user;
    }

    function clearCurrentUser() {
        currentUser.value = null;
    }

    return {
        users,
        currentUser,
        isLoggedIn,
        isAdmin,
        loadUsers,
        addUser,
        updateUser,
        deleteUser,
        findUserByName,
        authenticateUser,
        setCurrentUser,
        clearCurrentUser,
    }
}, {
    ...( {
        persist: {
            storage: localStorage,
            paths: ['currentUser'],
        },
    } as const as { persist: PersistedStateOptions } )
});