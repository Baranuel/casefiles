import { Engine } from "@/lib/ecs"
import { CreationSystem } from "@/lib/ecs/systems/creationSystem"
import { EventSystem } from "@/lib/ecs/systems/eventSystem"
import { InputSystem } from "@/lib/ecs/systems/inputSystem"
import { RenderingSystem } from "@/lib/ecs/systems/renderingSystem"

export interface System {
    engine: Engine
    update:() => void
    draw:() => void
    destroy: () => void
}

export type SystemsType = 'InputSystem' | 'CreationSystem' |'RenderingSystem' | 'EventSystem'

export type SystemsMap = {
    'InputSystem': InputSystem
    'CreationSystem': CreationSystem
    'RenderingSystem': RenderingSystem
    'EventSystem': EventSystem
}

// Helper type to get a specific system type
export type GetSystem<K extends SystemsType> = SystemsMap[K]