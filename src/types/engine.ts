import { Engine } from "@/lib/ecs"
import { Entity } from "@/lib/ecs/entities/Entity"
import { CameraSystem } from "@/lib/ecs/systems/cameraSystem"
import { CreationSystem } from "@/lib/ecs/systems/creationSystem"
import { EventSystem } from "@/lib/ecs/systems/eventSystem"
import { InputSystem } from "@/lib/ecs/systems/inputSystem"
import { MovingSystem } from "@/lib/ecs/systems/movingSystem"
import { RenderingSystem } from "@/lib/ecs/systems/renderingSystem"
import { ResizeSystem } from "@/lib/ecs/systems/resizeSystem"
import { SelectionSystem } from "@/lib/ecs/systems/selectionSystem"
import { UserActionSystem } from "@/lib/ecs/systems/userActionSystem"
import { PositionComponent } from "@/lib/ecs/components/PositionComponent";
import { TypeComponent } from "@/lib/ecs/components/TypeComponent";
import { StyleComponent } from "@/lib/ecs/components/StyleComponent";
import { MovableComponent } from "@/lib/ecs/components/MovableComponent";
import { ResizableComponent } from "@/lib/ecs/components/ResizableComponent"
import { NodeComponent } from "@/lib/ecs/components/NodeComponent"
import { AttachmentSystem } from "@/lib/ecs/systems/attachmentSystem"
import { SelectableComponent } from "@/lib/ecs/components/SelectableComponent"
import { PositionWithinElement } from "./elements"
import { State } from "@/providers/CaseStateProvider"

export interface System {
    engine: Engine
    update: (delta?: number) => void
    draw: (ctx:CanvasRenderingContext2D) => void
    destroy: () => void,
    stateUpdated?: (state: State) => void
}

export type Component = {
    owner: Entity
}

export type SystemsType =
    'InputSystem' |
    'CreationSystem' |
    'RenderingSystem' |
    'EventSystem' |
    'CameraSystem' |
    'SelectionSystem' |
    'MovingSystem' |
    'UserActionSystem' |
    'ResizeSystem' |
    'AttachmentSystem'

export type SystemsMap = {
    'InputSystem': InputSystem
    'CreationSystem': CreationSystem
    'RenderingSystem': RenderingSystem
    'EventSystem': EventSystem
    'CameraSystem': CameraSystem
    'SelectionSystem': SelectionSystem
    'MovingSystem': MovingSystem,
    'UserActionSystem': UserActionSystem
    'ResizeSystem': ResizeSystem
    'AttachmentSystem': AttachmentSystem
}

export type GetSystem<K extends SystemsType> = SystemsMap[K]

export type ComponentsType =
    'position' |
    'type' |
    'style' |
    'movable' |
    'resizable' |
    'node' |
    'selectable'

export type ComponentsMap = {
    'position': PositionComponent,
    'type': TypeComponent,
    'style': StyleComponent,
    'movable': MovableComponent,
    'resizable': ResizableComponent
    'node': NodeComponent
    'selectable': SelectableComponent
}

export type GetComponent<K extends ComponentsType> = ComponentsMap[K];


export type Camera = {
    x: number;
    y: number;
    zoom: number
}

export type MousePosition = {
    x: number,
    y: number
}

export type PointerHandle = Extract<PositionWithinElement, 'start'|'end'>;


// 1) Define your layers (bottom → top)
export enum Layer {
    PERSON = 4,
    LOCATION = 3,
    ITEM = 2,
    NOTE = 1,
    POINTER = 0,
}



