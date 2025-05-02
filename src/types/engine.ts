import { Engine } from "@/lib/ecs"
import { CameraSystem } from "@/lib/ecs/systems/cameraSystem"
import { CreationSystem } from "@/lib/ecs/systems/creationSystem"
import { EventSystem } from "@/lib/ecs/systems/eventSystem"
import { InputSystem } from "@/lib/ecs/systems/inputSystem"
import { RenderingSystem } from "@/lib/ecs/systems/renderingSystem"

export interface System {
    engine: Engine
    update: (delta?: number) => void
    draw: () => void
    destroy: () => void
}

export type SystemsType = 'InputSystem' | 'CreationSystem' | 'RenderingSystem' | 'EventSystem' | 'CameraSystem'

export type SystemsMap = {
    'InputSystem': InputSystem
    'CreationSystem': CreationSystem
    'RenderingSystem': RenderingSystem
    'EventSystem': EventSystem
    'CameraSystem': CameraSystem
}

export type GetSystem<K extends SystemsType> = SystemsMap[K]


export type Camera = {
    x: number;
    y: number;
    zoom: number
}

export type MousePosition = {
    x:number,
    y:number
}