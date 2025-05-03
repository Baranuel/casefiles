import { Component } from "@/types/engine";
import { Entity } from "../entities/Entity";
import { ElementType } from "@/types/elements";

export class TypeComponent implements Component {
    owner: Entity
    type: ElementType
    
    constructor(owner: Entity, type: ElementType) {
        this.owner = owner
        this.type = type
    }
}