import { sendParent, setup, assign } from 'xstate';

// TODO remove arguments?
export const createTodoMachine = ({
  id,
  title,
  completed
}: {
  id: string;
  title: string;
  completed: boolean;
}) => {
  return setup({
    types: {
      context: {} as {
        id: string,
        title: string,
        prevTitle: string,
        completed: boolean
      },
      events: {} as
        {
          type: 'TOGGLE_COMPLETE'
        }
        | {
          type: 'DELETE'
        }
        | { type: 'SET_COMPLETED' }
        | {
          type: 'SET_ACTIVE'
        }
        | { type: 'EDIT' }
        | {
          type: 'CHANGE',
          value: string
        }
        | { type: 'COMMIT' }
        | { type: 'BLUR' }
        | { type: 'CANCEL' }
    },
    actions: {
      commit: sendParent((context) => ({
        type: 'TODO.COMMIT',
        todo: context
      })),
      focusInput: () => { }
    }
  }).createMachine(
    {
      id: 'todo',
      initial: 'reading',
      context: {
        id: '',
        title: '',
        prevTitle: '',
        completed: false
      },
      on: {
        TOGGLE_COMPLETE: {
          actions: [
            assign({ completed: true }),
            sendParent((context) => ({ type: 'TODO.COMMIT', todo: context }))
          ]
        },
        DELETE: 'deleted'
      },
      states: {
        reading: {
          on: {
            SET_COMPLETED: {
              actions: [assign({ completed: true }), 'commit']
            },
            TOGGLE_COMPLETE: {
              actions: [
                assign({
                  completed: !completed
                }),
                'commit'
              ]
            },
            SET_ACTIVE: {
              actions: [assign({ completed: false }), 'commit']
            },
            EDIT: {
              target: 'editing',
              actions: 'focusInput'
            }
          }
        },
        editing: {
          entry: assign({ prevTitle: title }),
          on: {
            CHANGE: {
              actions: assign({
                title: ({ event }) => event.value
              })
            },
            COMMIT: [
              {
                target: 'reading',
                actions: sendParent((context) => ({
                  type: 'TODO.COMMIT',
                  todo: context
                })),
                guard: ({ context }) => context.title.trim().length > 0
              },
              { target: 'deleted' }
            ],
            BLUR: {
              target: 'reading',
              actions: sendParent((context) => ({
                type: 'TODO.COMMIT',
                todo: context
              }))
            },
            CANCEL: {
              target: 'reading',
              actions: assign({
                title: ({ context }) => context.prevTitle
              })
            }
          }
        },
        deleted: {
          entry: sendParent(({ context }) => ({
            type: 'TODO.DELETE',
            id: context.id
          }))
        }
      }
    },
  );
};
