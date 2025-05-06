import { Component } from "@/types/engine";
import { Entity } from "../entities/Entity";

export class ResizableComponent implements Component {
    owner: Entity;
    constructor(owner:Entity) {
        this.owner = owner
    }
    
}