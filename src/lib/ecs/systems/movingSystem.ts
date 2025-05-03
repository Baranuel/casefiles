import { System } from "@/types/engine";
import { Engine } from "..";
import { MovableComponent } from "../components/MovableComponent";
import { PositionComponent } from "../components/PositionComponent";

export class MovingSystem implements System {
    engine: Engine
    controller: AbortController

    constructor(engine: Engine) {
        this.engine = engine
        this.controller = new AbortController()

        this.engine.canvas.addEventListener('mousedown', this.onMouseDown, { signal: this.controller.signal })
        this.engine.canvas.addEventListener('mouseup', this.onMouseUp, { signal: this.controller.signal })
    }

    onMouseDown = () => {
        const selectedEntity = this.engine.getSystem('SelectionSystem')?.selectedEntity
        if (!selectedEntity) return

        const movableComponent = selectedEntity.getComponent<MovableComponent>('movable')
        const positionComponent = selectedEntity.getComponent<PositionComponent>('position')

        if (movableComponent && positionComponent) {
            movableComponent.moving = true
            const { x, y } = this.engine.getSystem('InputSystem')!.getWorldMousePosition();
            const { x1, y1 } = positionComponent.position;
            movableComponent.mouseGrabOffset = { x: x - x1, y: y - y1 };
        }
    }

    onMouseUp = () => {
        const selectedEntity = this.engine.getSystem('SelectionSystem')?.selectedEntity
        if (!selectedEntity) return

        const movableComponent = selectedEntity.getComponent<MovableComponent>('movable')
        if (movableComponent) {
            movableComponent.moving = false
        }
    }

    update() {
        if(this.engine.getState().tool !== 'SELECT') return 
        
        for (const entity of this.engine.entities.values()) {
            if (!entity.hasComponent('movable')) continue

            const movableComponent = entity.getComponent<MovableComponent>('movable')
            const positionComponent = entity.getComponent<PositionComponent>('position')

            if (!movableComponent || !movableComponent.moving || !positionComponent) continue

            const { position } = positionComponent
            const { x, y } = this.engine.getSystem('InputSystem')!.getWorldMousePosition()

            const width = position.x2 - position.x1;
            const height = position.y2 - position.y1;

            // Use the stored offset
            const offset = movableComponent.mouseGrabOffset ?? { x: width / 2, y: height / 2 };
            
            position.x1 = x - offset.x;
            position.y1 = y - offset.y;
            position.x2 = position.x1 + width;
            position.y2 = position.y1 + height;

        }
    }
    draw() { }

    destroy() {
        this.controller.abort()
    }
}