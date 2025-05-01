import { Engine } from "./ecs"
import { InputSystem } from "./ecs/systems/inputSystem"
import { CreationSystem } from "./ecs/systems/creationManager"

export interface System {
    engine: Engine
    update:() => void
    draw:() => void
    destroy: () => void
}

export type SystemsType = 'InputSystem' | 'CreationSystem'

export type SystemsMap = {
    'InputSystem': InputSystem
    'CreationSystem': CreationSystem
}

// Helper type to get a specific system type
export type GetSystem<K extends SystemsType> = SystemsMap[K]