import { Engine } from "@/lib/ecs"
import { Entity } from "@/lib/ecs/entities/Entity"
import { CameraSystem } from "@/lib/ecs/systems/cameraSystem"
import { CreationSystem } from "@/lib/ecs/systems/creationSystem"
import { EventSystem } from "@/lib/ecs/systems/eventSystem"
import { InputSystem } from "@/lib/ecs/systems/inputSystem"
import { MovingSystem } from "@/lib/ecs/systems/movingSystem"
import { RenderingSystem } from "@/lib/ecs/systems/renderingSystem"
import { SelectionSystem } from "@/lib/ecs/systems/selectionSystem"

export interface System {
    engine: Engine
    update: (delta?: number) => void
    draw: () => void
    destroy: () => void
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
    'SelectionSystem'|
    'MovingSystem'

export type SystemsMap = {
    'InputSystem': InputSystem
    'CreationSystem': CreationSystem
    'RenderingSystem': RenderingSystem
    'EventSystem': EventSystem
    'CameraSystem': CameraSystem
    'SelectionSystem': SelectionSystem
    'MovingSystem': MovingSystem
}

export type GetSystem<K extends SystemsType> = SystemsMap[K]


export type Camera = {
    x: number;
    y: number;
    zoom: number
}

export type MousePosition = {
    x: number,
    y: number
}