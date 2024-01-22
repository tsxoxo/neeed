<template>
  <li class="todo" :class="{
    editing: todoRef.getSnapshot().matches('editing'),
    completed
  }" :data-todo-state="completed ? 'completed' : 'active'">
    <div class="view">
      <input class="toggle" type="checkbox" @change="send({ type: 'TOGGLE_COMPLETE' })" :checked="completed.value" />
      <label @dblclick="send({ type: 'EDIT' })">{{ title }}</label>
      <button class="destroy" @click="send({ type: 'DELETE' })"></button>
    </div>
    <input class="edit" type="text" :value="title" @blur="send({ type: 'BLUR' })"
      @input="send({ type: 'CHANGE', value: ($event.target as HTMLInputElement).value })"
      @keypress.enter="send({ type: 'COMMIT' })" @keydown.escape="send({ type: 'CANCEL' })" ref="inputRef" />
  </li>
</template>

<script setup lang="ts">
import { ActorRef, ActorRefFrom } from 'xstate';
import { useActor, useSelector } from '@xstate/vue';
import { computed, watch, ref, nextTick } from 'vue';
import { createTodoMachine } from "./todoItem.machine";

const props = defineProps<{
  todoRef: ActorRefFrom<typeof createTodoMachine>
}>();
// const props = defineProps<{
//   todoRef: ActorRef<any, any>;
// }>();

// const { snapshot, send } = useActor(props.todoRef);

const todoRef = props.todoRef
const { send } = todoRef
const inputRef = ref(null);

// console.log(props.todoRef.getSnapshot());

// not sure what this does
// watch(
//   () => snapshot.value.actions,
//   async (actions) => {
//     if (actions.find((action) => action.type === 'focusInput')) {
//       if (inputRef.value) {
//         await nextTick();
//         inputRef.value.select();
//       }
//     }
//   }
// );

const title = computed(() => useSelector(todoRef, (snapshot) => snapshot.context.title))
const completed = computed(() => useSelector(todoRef, (snapshot) => snapshot.context.completed))
// snapshot.value.context.title);
// const completed = computed(() => snapshot.value.context.completed);
</script>
