import { Component, ComponentsType, GetComponent } from "@/types/engine";
import { ElementDto } from "@/types/elements";

export class Entity {
    public id: string;
    public element: ElementDto;
    private components: Map<ComponentsType, Component>;

    constructor(id: string, element: ElementDto) {
        this.id = id ?? crypto.randomUUID();
        this.element = element;
        this.components = new Map();
    }

    addComponent<K extends ComponentsType>(name: K, component: GetComponent<K>): void {
        this.components.set(name, component);
    }

    removeComponent(name: ComponentsType): void {
        this.components.delete(name);
    }

    getComponent<K extends ComponentsType>(name: K): GetComponent<K> | undefined {
        return this.components.get(name) as GetComponent<K> | undefined;
    }

    hasComponent(name: ComponentsType): boolean {
        return this.components.has(name);
    }

    init() {}
}