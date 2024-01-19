import { ActorRef } from "xstate";

export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    ref: ActorRef<any, any>;
}

export type Filters = "all" | "active" | "completed";
