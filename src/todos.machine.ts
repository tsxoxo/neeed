import { assign, setup } from "xstate";
import { nanoid } from "nanoid";
import { createTodoMachine } from "./todoItem.machine";
import { ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import type { Todo, Filters } from "./types";

const createTodo = (title: string) => {
  return {
    id: nanoid(),
    title,
    completed: false,
  };
};

// const todosModel = createModel(
//   {
//     todo: "",
//     todos: [] as Todo[],
//     filter: "all",
//   },
//   {
//     events: {
//       "NEWTODO.CHANGE": (value: string) => ({ value }),
//       "NEWTODO.COMMIT": (value: string) => ({ value }),
//       "TODO.COMMIT": (todo: Todo) => ({ todo }),
//       "TODO.DELETE": (id: string) => ({ id }),
//       SHOW: (filter: string) => ({ filter }),
//       "MARK.completed": () => ({}),
//       "MARK.active": () => ({}),
//       CLEAR_COMPLETED: () => ({}),
//     },
//   }
// );

interface Input { todos: Todo[] }

export const todosMachine = setup({
  types: {
    context: {} as {
      todo: string,
      todos: Todo[],
      filter: Filters
    },
    events: {} as
      | { type: "NEWTODO.CHANGE", value: string }
      | { type: "NEWTODO.COMMIT", value: string }
      | { type: "TODO.COMMIT", todo: Todo }
      | { type: "TODO.DELETE", id: string }
      | { type: "SHOW", filter: Filters }
      | { type: "MARK.completed" }
      | { type: "MARK.active" }
      | { type: "CLEAR_COMPLETED" },
    input: {} as { persistedTodos: Todo[] }
  },
  actions: {
    persist: ({ context, event }) => {
      localStorage.setItem("todos", JSON.stringify(context.todos));
      // context.localStorageState.value = context.todos.map(({ id, title, completed }) => ({ id, title, completed }));
    },
  },
}).createMachine(
  {
    id: "todos",
    context: ({ input }) => ({
      todo: "",
      todos: input.persistedTodos,
      filter: "all",
    }),
    initial: "loading",
    states: {
      loading: {
        entry: assign({
          todos: ({ context, spawn }) => {
            // console.log('CONTEXT\n', context);
            console.log('spawning...');
            console.log('todos: ', context.todos);
            console.log('context: ', context);

            return context.todos.map((todo: Todo) => Object.assign(
              todo,
              {
                ref: spawn(createTodoMachine(todo), { id: nanoid(), input: todo }),
              }));
            // return JSON.parse(localStorage.getItem("todos") || '').map((todo: Todo) => Object.assign(
            //   todo,
            //   {
            //     ref: spawn(createTodoMachine(todo), nanoid()),
            //   }));
          },
        }),
        always: "ready",
      },
      ready: {},
    },
    on: {
      "NEWTODO.CHANGE": {
        actions: assign({
          todo: ({ event }) => event.value,
        }),
      },
      "NEWTODO.COMMIT": {
        actions: [
          assign({
            todo: "", // clear todo
            todos: ({ context, event, spawn }) => {
              const newTodo = createTodo(event.value.trim());
              return context.todos.concat({
                ...newTodo,
                ref: spawn(createTodoMachine(newTodo)),
              });
            },
          }),
          "persist",
        ],
        guard: ({ event }) => !!event.value.trim().length,
      },
      "TODO.COMMIT": {
        actions: [
          assign({
            todos: ({ context, event }) =>
              context.todos.map((todo: Todo) => {
                console.log('committing');

                return todo.id === event.todo.id
                  ? { ...todo, ...event.todo, ref: todo.ref }
                  : todo;
              }),
          }),
          "persist",
        ],
      },
      "TODO.DELETE": {
        actions: [
          assign({
            todos: ({ context, event }) =>
              context.todos.filter((todo: Todo) => todo.id !== event.id),
          }),
          "persist",
        ],
      },
      SHOW: {
        actions: assign({
          filter: ({ event }) => event.filter,
        }),
      },
      "MARK.completed": {
        actions: ({ context }) => {
          context.todos.forEach((todo: Todo) => todo.ref.send("SET_COMPLETED"));
        },
      },
      "MARK.active": {
        actions: ({ context }) => {
          context.todos.forEach((todo: Todo) => todo.ref.send("SET_ACTIVE"));
        },
      },
      CLEAR_COMPLETED: {
        actions: assign({
          todos: ({ context }) => context.todos.filter((todo: Todo) => !todo.completed),
        }),
      },
    },
  },
);
