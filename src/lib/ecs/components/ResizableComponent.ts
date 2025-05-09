import { Component } from "@/types/engine";
import { Entity } from "../entities/Entity";
import { PositionWithinElement } from "@/types/elements";

export class ResizableComponent implements Component {
    owner: Entity;
    resizing: boolean = false;
    interactionPoint: PositionWithinElement | null = null

    constructor(owner:Entity) {
        this.owner = owner
    }
    
}
