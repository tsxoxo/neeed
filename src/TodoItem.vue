<template>
  <li class="todo" :class="{
    editing: state.matches('editing'),
    completed
  }" :data-todo-state="completed ? 'completed' : 'active'">
    <div class="view">
      <input class="toggle" type="checkbox" @change="send({ type: 'TOGGLE_COMPLETE' })" :checked="completed" />
      <label @dblclick="send({ type: 'EDIT' })">{{ title }}</label>
      <button class="destroy" @click="send({ type: 'DELETE' })"></button>
    </div>
    <input class="edit" type="text" :value="title" @blur="send({ type: 'BLUR' })"
      @input="send({ type: 'CHANGE', value: ($event.target as HTMLInputElement).value })"
      @keypress.enter="send({ type: 'COMMIT' })" @keydown.escape="send({ type: 'CANCEL' })" ref="inputRef" />
  </li>
</template>

<script setup lang="ts">
import { ActorRef } from 'xstate';
import { useActor } from '@xstate/vue';
import { computed, watch, ref, nextTick } from 'vue';

const props = defineProps<{
  todoRef: ActorRef<any, any>;
}>();

const { state, send } = useActor(props.todoRef);
console.log(JSON.stringify(state.value));

const inputRef = ref(null);

// not sure what this does
// watch(
//   () => state.value.actions,
//   async (actions) => {
//     if (actions.find((action) => action.type === 'focusInput')) {
//       if (inputRef.value) {
//         await nextTick();
//         inputRef.value.select();
//       }
//     }
//   }
// );

const title = computed(() => state.value.context.title);
const completed = computed(() => state.value.context.completed);
</script>
