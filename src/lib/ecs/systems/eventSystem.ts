import { System } from "@/types/engine";
import { Engine } from "..";
import { EngineEvents } from "@/types/events";


export class EventSystem<Events extends object = EngineEvents> implements System {
    constructor(public engine: Engine) { }

    private listeners: Partial<{
        [K in keyof Events]: Array<(data: Events[K]) => void>;
    }> = {};

    subscribe<K extends keyof Events>(
        event: K,
        callback: (data: Events[K]) => void
    ): void {
        (this.listeners[event] ||= []).push(callback);
    }

    unsubscribe<K extends keyof Events>(
        event: K,
        callback: (data: Events[K]) => void
    ): void {
        this.listeners[event] = (this.listeners[event] ?? []).filter(cb => cb !== callback);
    }

    emit<K extends keyof Events>(event: K, data: Events[K]): void {
        (this.listeners[event] ?? []).forEach(cb => cb(data));
    }

    update() { }
    draw() { }

    destroy(): void {
        this.listeners = {};
    }
}
