import { Component } from "@/types/engine";
import { Entity } from "../entities/Entity";

export class MovableComponent implements Component {
    owner: Entity;
    moving: boolean = false;
    mouseGrabOffset: { x: number; y: number } | null = null;

    constructor(owner:Entity) {
        this.owner = owner
    }
    
}