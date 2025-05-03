import { System } from "@/types/engine";
import { Engine } from "..";
import { PositionComponent } from "../components/PositionComponent";
import { Entity } from "../entities/Entity";

export class SelectionSystem implements System {
    engine: Engine;
    hoveredEntity: Entity | null = null;
    selectedEntity: Entity | null = null;
    private controller = new AbortController();

    constructor(engine: Engine) {
        this.engine = engine;
        const canvas = this.engine.canvas;

        canvas.addEventListener('mousedown', this.onMouseDown, { signal: this.controller.signal });
        // canvas.addEventListener('mouseup', this.onMouseUp, { signal: this.controller.signal });
    }

    private getEntityAtPosition(x: number, y: number): Entity | null {
        const entities = this.engine.entities.values();

        for (const entity of entities) {
            const positionComponent = entity.getComponent<PositionComponent>('position')
            if (!positionComponent) return null

            const { x1, y1, x2, y2 } = positionComponent.position;
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                return entity
            }
        }
        return null;
    }

    private onMouseDown = () => {
        const mouse = this.engine.getSystem('InputSystem')?.getWorldMousePosition();
        if (!mouse) return;
        this.selectedEntity = this.getEntityAtPosition(mouse.x, mouse.y);
    };

    private onMouseUp = () => {
        this.selectedEntity = null
    };


    update() {
        const mouse = this.engine.getSystem('InputSystem')?.getWorldMousePosition();
        if (!mouse) return;
        this.hoveredEntity = this.getEntityAtPosition(mouse.x, mouse.y);

        if (this.hoveredEntity) {
            // console.log(this.hoveredElement)
        }
    }
    draw() { }

    destroy() {
        this.controller.abort();
    }
}