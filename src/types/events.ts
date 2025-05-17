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
    'mouse:up': { x: number, y: number, mouseDownSnapshot?: { x: number, y: number }, mouseScreenPositionSnapshot?:MousePosition,  modifier?: boolean };
    'mouse:drag': { x: number, y: number, mouseDownSnapshot: { x: number, y: number }, modifier?: boolean };

    'touch:start': TouchEvent;
    'touch:move': TouchEvent; 
    'touch:end': TouchEvent;

    // Selection events
    'entity:deselected': { entity: Entity };
    'selection:cleared': undefined;
    
    // Interaction events
    'action:select': {mouse:MousePosition,  onMouseDownSnapshot:MousePosition, modifier?: boolean };
    'action:hover':{mouse:MousePosition, entityId:Entity['id'], interactionPoint:PositionWithinElement, isMouseDown?: boolean};
    'action:move:start': { x: number, y: number, mouseDownSnapshot: { x: number, y: number } };
    'action:move': { x: number, y: number };
    'action:move:end': null;
    'action:resize:start': ActionResizeStartDto;
    'action:resize': { x: number, y: number };
    'action:resize:end': null
    'action:change': { action: 'idle' | 'moving' | 'resizing' };
    'action:create': ActionCreateDto;

    // Keep this for backward compatibility with any existing code
    [key: string]: unknown;
}

type TouchEvent = {
    x: number;
    y: number;
    screenX: number;
    screenY: number;
    touches: TouchList;
    mouseDownSnapshot: MousePosition;
    screenPositionSnapshot?: MousePosition;
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