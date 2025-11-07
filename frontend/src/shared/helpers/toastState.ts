import { reactive } from 'vue';

interface ToastState {
    message: string;
    type: 'success' | 'error' | 'warning';
    isVisible: boolean;
    timeoutId?: number; // Tipagem corrigida para setTimeout
}

export const toastState = reactive<ToastState>({
    message: '',
    type: 'success', 
    isVisible: false,
    timeoutId: undefined,
});

export function showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    if (toastState.timeoutId) {
        clearTimeout(toastState.timeoutId);
    }

    toastState.message = message;
    toastState.type = type;
    toastState.isVisible = true;

    toastState.timeoutId = setTimeout(() => {
        toastState.isVisible = false;
        toastState.timeoutId = undefined; 
    }, 4000) as unknown as number; 
}