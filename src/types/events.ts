import { Entity } from "@/lib/ecs/entities/Entity";
import { PositionWithinElement, Tool } from "./elements";

export interface MousePosition {
    x: number;
    y: number;
}

export interface EngineEvents {
    // Mouse events
    'mouse:move': { mouse:MousePosition, modifier: boolean };
    'mouse:down': { x: number, y: number, modifier?: boolean, mouseDownSnapshot:{x:number, y:number}, screenPositionSnapshot?:MousePosition };
    'mouse:up': { x: number, y: number, mouseDownSnapshot: { x: number, y: number }, mouseScreenPositionSnapshot:MousePosition,  modifier?: boolean,   screenPositionSnapshot?: MousePosition; screenX?: number, screenY?: number };
    'mouse:drag': { x: number, y: number, mouseDownSnapshot: { x: number, y: number }, modifier?: boolean };
    
    'key:down': { key: string, code: string, modifier: boolean };
    'key:up': { key: string, code: string, modifier: boolean };

    'touch:start': TouchEvent;
    'touch:move': TouchEvent; 
    'touch:end': TouchEvent;

    // Selection events
    'entity:deselected': { entity: Entity };
    'selection:cleared': undefined;
    
    // Interaction events
    'action:pan:start': undefined;
    'action:pan': {mouse:MousePosition, mouseDownSnapshot:MousePosition};
    'action:select:end':{mouse:MousePosition, mouseDownSnapshot:MousePosition, modifier?:boolean, mouseScreenPositionSnapshot?:MousePosition, screenX?:number, screenY?:number};
    'action:select': {mouse:MousePosition,  onMouseDownSnapshot:MousePosition, modifier?: boolean, entity?:Entity};
    'action:hover':{mouse:MousePosition, entityId:Entity['id'], interactionPoint:PositionWithinElement, isMouseDown?: boolean};
    'action:move:start': { x: number, y: number, mouseDownSnapshot: { x: number, y: number }, entityId?: Entity['id'],};
    'action:move': { x: number, y: number };
    'action:move:end': null;
    'action:resize:start': ActionResizeStartDto;
    'action:resize': { x: number, y: number };
    'action:resize:end': ActionResizeStartDto | null;
    'action:change': { action: 'idle' | 'moving' | 'resizing' | 'panning' };
    'action:create': ActionCreateDto;
    'action:delete': { entityIds: Entity['id'][] };

    [key: string]: unknown;
}

type TouchEvent = {
    x: number;
    y: number;
    screenX: number;
    screenY: number;
    touches: TouchList;
    mouseDownSnapshot: MousePosition;
    mouseScreenPositionSnapshot?: MousePosition;
}

type ActionResizeStartDto = {
    x: number;
    y: number;
    mouseDownSnapshot: { x: number; y: number };
    interactionPoint: PositionWithinElement;
    entityId: Entity['id'];
}

type ActionCreateDto = {
    x: number;
    y: number;
    tool: Tool;
}