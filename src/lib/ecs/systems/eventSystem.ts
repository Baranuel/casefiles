import { System } from "@/types/engine";
import { Engine } from "..";
import { Entity } from "../entities/Entity";
import { PositionWithinElement } from "@/types/elements";

export interface EngineEvents {
    // Mouse events
    'mouse:move': { x: number, y: number, modifier?: boolean };
    'mouse:down': { x: number, y: number, modifier?: boolean, mouseDownSnapshot:{x:number, y:number} };
    'mouse:up': { x: number, y: number, mouseDownSnapshot?: { x: number, y: number }, modifier?: boolean };
    'mouse:drag': { x: number, y: number, mouseDownSnapshot: { x: number, y: number }, modifier?: boolean };
    // Selection events
    'select:entity': { entity: Entity };
    'entity:deselected': { entity: Entity };
    'selection:cleared': undefined;

    // Interaction events
    'action:move:start': { x: number, y: number, mouseDownSnapshot: { x: number, y: number } };
    'action:move': { x: number, y: number };
    'action:move:end': null;
    'action:resize:start': { x: number, y: number, mouseDownSnapshot: { x: number, y: number }, interactionPoint:PositionWithinElement };
    'action:resize': { x: number, y: number };
    'action:resize:end': null
    'action:change': { action: 'idle' | 'moving' | 'resizing' };

    // Keep this for backward compatibility with any existing code
    [key: string]: unknown;
}

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
