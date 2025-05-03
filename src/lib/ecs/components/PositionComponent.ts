import { ElementPosition } from "@/types/elements";
import { Component } from "@/types/engine";
import { Entity } from "../entities/Entity";

export class PositionComponent implements Component {
    public position: ElementPosition
    owner: Entity;

    constructor(owner: Entity, position: ElementPosition) {
        this.owner = owner
        this.position = position
    }
}