<template>
  <Transition name="fade-slide">
    <div v-if="toastState.isVisible" :class="toastClasses"
      class="fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white z-[100] max-w-sm cursor-pointer"
      @click="toastState.isVisible = false">
      <div class="flex items-center">
        <i :class="iconClasses" class="mr-3 text-xl"></i>
        <p class="font-medium text-sm">{{ toastState.message }}</p>
      </div>

    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { toastState } from '@/shared/helpers/toastState'; 

const toastClasses = computed(() => {
  switch (toastState.type) {
    case 'error':
      return 'bg-red-600 border border-red-800';
    case 'warning':
      return 'bg-yellow-500 border border-yellow-700';
    case 'success':
    default:
      return 'bg-green-600 border border-green-800';
  }
});

const iconClasses = computed(() => {
  switch (toastState.type) {
    case 'error':
      return 'fi fi-rr-cross-circle';
    case 'warning':
      return 'fi fi-rr-triangle-warning';
    case 'success':
    default:
      return 'fi fi-rr-check-circle';
  }
});
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>