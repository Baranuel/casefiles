import { Component } from "@/types/engine";
import { Entity } from "../entities/Entity";

export class SelectableComponent implements Component {
    owner: Entity;
    selected: boolean = false;
    hovered: boolean = false;

    constructor(owner:Entity) {
        this.owner = owner
    }
    
}