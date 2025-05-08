import { System } from "@/types/engine";
import { Engine } from "..";
import { InputSystem } from "./inputSystem";

export class MovingSystem implements System {
    engine: Engine
    controller: AbortController
    isMovingElement: boolean = false
    inputSystem: InputSystem | null = null

    constructor(engine: Engine) {
        this.engine = engine
        this.controller = new AbortController()
        this.inputSystem = this.engine.getSystem('InputSystem') || null

        this.engine.canvas.addEventListener('mouseup', this.onMouseUp, { signal: this.controller.signal })
    }


    onMouseUp = () => {
        const movingEntities = this.engine.getEntitiesWithComponents('movable', 'position')
            .filter(entity => entity.getComponent('movable')!.moving);

        for (const entity of movingEntities) {
            const movableComponent = entity.getComponent('movable')!;
            movableComponent.moving = false;
            this.engine.getState().updateElement(entity.element);
        }
    }

    update() {
        if (!this.inputSystem) return

        const { x, y } = this.inputSystem.getWorldMousePosition();

        const movableEntities = this.engine.getEntitiesWithComponents('movable', 'position');

        for (const entity of movableEntities) {
            const movableComponent = entity.getComponent('movable')!;
            const positionComponent = entity.getComponent('position')!;

            if (!movableComponent.moving) continue;

            const { position } = positionComponent;
            const width = position.x2 - position.x1;
            const height = position.y2 - position.y1;

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