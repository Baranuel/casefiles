import { System } from "@/types/engine";
import { Engine } from "..";
import { InputSystem } from "./inputSystem";
import { EventSystem } from "./eventSystem";
import { EngineEvents } from "@/types/events";

export class MovingSystem implements System {
    engine: Engine
    isMovingElement: boolean = false
    inputSystem: InputSystem | null = null
    eventSystem: EventSystem | null = null

    constructor(engine: Engine) {
        this.engine = engine
        this.inputSystem = this.engine.getSystem('InputSystem') || null
        this.eventSystem = this.engine.getSystem('EventSystem') || null

        if (this.eventSystem) {
            this.eventSystem.subscribe('action:move:start', this.onMoveStart)
            this.eventSystem.subscribe('action:move', this.onMove)
            this.eventSystem.subscribe('action:move:end', this.onMoveEnd)
        }

    }


    onMoveStart = (data: EngineEvents['action:move:start']) => {
        const movableEntities = this.engine.getEntitiesWithComponents('selectable', 'position', 'movable').filter(entity => entity.getComponent('selectable')?.selected);

        for (const entity of movableEntities) {
            const movableComponent = entity.getComponent('movable')!;
            movableComponent.moving = true
            movableComponent.mouseGrabOffset = {
                x: data.mouseDownSnapshot?.x - entity.getComponent('position')!.position.x1,
                y: data.mouseDownSnapshot?.y - entity.getComponent('position')!.position.y1
            }
        }
    }

    onMove = (data: EngineEvents['action:move']) => {
        const { x, y } = data
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

    onMoveEnd = () => {
        const movableEntities = this.engine.getEntitiesWithComponents('movable', 'position').filter(entity => entity.getComponent('movable')!.moving);
        for (const entity of movableEntities) {
            const movableComponent = entity.getComponent('movable')!;
            movableComponent.moving = false
        }
        const elements = movableEntities.map(entity => entity.element);
        this.engine.getState().updateBatchElements(elements);


    }

    update() { }
    draw() { }

    destroy() {
        if (this.eventSystem) {
            this.eventSystem.unsubscribe('action:move:start', this.onMoveStart)
            this.eventSystem.unsubscribe('action:move', this.onMove)
            this.eventSystem.unsubscribe('action:move:end', this.onMoveEnd)
        }
    }
}