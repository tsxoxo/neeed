import { onMounted, onUnmounted } from 'vue';

export function useHashChange(onHashChange: () => void) {
  onMounted(() => {
    window.addEventListener('hashchange', onHashChange);
  });
  onUnmounted(() => {
    window.removeEventListener('hashchange', onHashChange);
  });
}
