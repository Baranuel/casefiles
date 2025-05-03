import { Component } from "@/types/engine";
import { Entity } from "../entities/Entity";

export class StyleComponent implements Component {
    owner: Entity;
    color: string;
    
    constructor(owner: Entity, color: string) {
        this.owner = owner
        this.color = color
    }
}