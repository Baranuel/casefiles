import { Component } from "@/types/engine";
import {  ElementDto } from "@/types/elements";

export class Entity {
    public id: string;
    public element:ElementDto
    private components: Map<string, Component>;

    constructor(id: string, element:ElementDto) {
        this.id = id ?? crypto.randomUUID();
        this.element = element
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