import { Component } from "@/types/engine";
import { Entity } from "../entities/Entity";


export class NodeComponent implements Component {
    owner: Entity;
    areaPadding:number = 35;
    attachedPoints = new Map<string, {overlapsAt:'start' | 'end',x:number, y:number}>()
    
    constructor(owner:Entity){
        this.owner = owner
    }
}