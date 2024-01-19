<template>
  <!-- TODO not sure how to refactor :data-state="state.toStrings()" in the section tag-->
  <section class="todoapp">
    <header class="header">
      <h1>Todos</h1>
      <input class="new-todo" autofocus type="text" placeholder="What needs to be done?" @keypress.enter="
        send({ type: 'NEWTODO.COMMIT', value: ($event.target as HTMLInputElement).value })
        " @input="send({ type: 'NEWTODO.CHANGE', value: ($event.target as HTMLInputElement).value })" :value="todo" />
    </header>
    <section class="main">
      <input id="toggle-all" class="toggle-all" type="checkbox" :checked="allCompleted"
        @change="send({ type: markEvent })" />
      <label for="toggle-all" :title="`Mark all as ${mark}`">Mark all as {{ mark }}</label>
      <ul class="todo-list">
        <TodoItem v-for="todoItem in filteredTodos" :key="todoItem.id" :todo-ref="todoItem.ref"></TodoItem>
      </ul>
      <footer class="footer" v-show="todos.length">
        <span class="todo-count">
          <strong>
            {{ numActiveTodos }} item{{ numActiveTodos === 1 ? "" : "s" }}
            left
          </strong>
        </span>
        <ul class="filters">
          <li>
            <a href="#/" :class="{
              selected: filter === 'all',
            }">All</a>
          </li>
          <li>
            <a href="#/active" :class="{
              selected: filter === 'active',
            }">Active</a>
          </li>
          <li>
            <a href="#/completed" :class="{
              selected: filter === 'completed',
            }">Completed</a>
          </li>
        </ul>
        <button v-show="numActiveTodos < todos.length" class="clear-completed" @click="send({ type: 'CLEAR_COMPLETED' })">
          Clear completed
        </button>
      </footer>
    </section>
  </section>
</template>
<script setup lang="ts">

import TodoItem from "./TodoItem.vue";
import { todosMachine } from "./todos.machine";
import { useMachine } from "@xstate/vue";
import { computed } from "vue";
import type { Todo, Filters } from "./types";
import type { Ref } from 'vue'

import { useHashChange } from "./useHashChange";

function filterTodos(filter: string, todos: Todo[]) {
  if (filter === "active") {
    return todos.filter((todo) => !todo.completed);
  }
  if (filter === "completed") {
    return todos.filter((todo) => todo.completed);
  }
  return todos;
}

const persistedTodos: Todo[] = JSON.parse(localStorage.getItem("todos") || '[]')

// const restoredState = State.from('ready', initContext)
// const resolvedState = todosMachine.resolveState(restoredState);

// const { state, send } = useMachine(todosMachine, {
//   state: resolvedState, devTools: false
// });
const { snapshot, send } = useMachine(todosMachine, {
  input: {
    persistedTodos
  }
});

const todos = computed(() => snapshot.value.context.todos);
const todo = computed(() => snapshot.value.context.todo);
const filter = computed(() => snapshot.value.context.filter);

// TODO Where do we set window.location.hash?
useHashChange(() =>
  send({ type: "SHOW", filter: window.location.hash.slice(2) as Filters || "all" })
);

const numActiveTodos = computed(
  () => todos.value.filter((todo) => !todo.completed).length
);
const allCompleted = computed(
  () => todos.value.length > 0 && numActiveTodos.value === 0
);
const mark = computed(() => (!allCompleted.value ? "completed" : "active"));
type MarkEvent = "MARK.completed" | "MARK.active"
const markEvent = computed(() => `MARK.${mark.value}`) as Ref<MarkEvent>;
const filteredTodos = computed(() => filterTodos(filter.value, todos.value));
</script>
