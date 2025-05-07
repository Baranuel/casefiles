import { Component } from "@/types/engine";
import { Entity } from "../entities/Entity";


export class NodeComponent implements Component {
    owner: Entity;
    areaPadding:number = 20;
    attachedPoints = new Map<string, {overlapsAt:'start' | 'end',x:number, y:number}>()

    constructor(owner:Entity){
        this.owner = owner
    }
}