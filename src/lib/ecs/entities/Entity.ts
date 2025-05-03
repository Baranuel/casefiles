import { Component } from "@/types/engine";

export class Entity {
    public id: string;
    private components: Map<string, Component>;

    constructor(id?: string) {
        this.id = id ?? crypto.randomUUID();
        this.components = new Map();
    }

    addComponent<T extends Component>(name: string, component: T): void {
        this.components.set(name, component);
    }

    removeComponent(name: string): void {
        this.components.delete(name);
    }

    getComponent<T extends Component>(name: string): T | undefined {
        return this.components.get(name) as T | undefined;
    }

    hasComponent(name: string): boolean {
        return this.components.has(name);
    }

    init() {}
}