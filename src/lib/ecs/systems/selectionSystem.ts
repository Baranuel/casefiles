import { System } from "@/types/engine";
import { Engine } from "..";
import { Entity } from "../entities/Entity";
import { PositionWithinElement } from "@/types/elements";
import { getPositionWithinElement } from "@/utils/positions";

export class SelectionSystem implements System {
    engine: Engine;
    hoveredEntity: Entity | null = null;
    selectedEntity: Entity | null = null;
    interactionPoint: PositionWithinElement | null = null;
    grabElementMouseOffset: { x: number; y: number } | null = null;

    private controller = new AbortController();

    constructor(engine: Engine) {
        this.engine = engine;
        const canvas = this.engine.canvas;

        canvas.addEventListener('mousedown', this.onMouseDown, { signal: this.controller.signal });
        canvas.addEventListener('mouseup', this.onMouseUp, { signal: this.controller.signal });
    }

    public getEntityAtPosition(x: number, y: number): Entity | null {
        const entities = this.engine.entities.values();

        for (const entity of entities) {
            const positionComponent = entity.getComponent('position')
            if (!positionComponent) continue;

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

    private getPositionWithinEntity(x: number, y: number, entity: Entity): PositionWithinElement | null {
        const typeComponent = entity.getComponent('type');
        const positionComponent = entity.getComponent('position');
        if (!typeComponent || !positionComponent) return null;

        return getPositionWithinElement(x, y, entity.element);
    }

    private onMouseDown = () => {
        const mouse = this.engine.getSystem('InputSystem')?.getWorldMousePosition();
        if (!mouse) return;

        const entity = this.getEntityAtPosition(mouse.x, mouse.y);
        this.setSelectedEntity(entity);

        const positionComponent = this.selectedEntity?.getComponent('position')

        if (positionComponent && this.selectedEntity) {
            const { x, y } = mouse
            const { x1, y1 } = positionComponent.position

            this.grabElementMouseOffset = { x: x - x1, y: y - y1 };
        }

        if (this.selectedEntity) {
            this.interactionPoint = this.getPositionWithinEntity(mouse.x, mouse.y, this.selectedEntity);
        } else {
            this.interactionPoint = null;
        }
    };

    private onMouseUp = () => {
        this.interactionPoint = null;
    };

    public setSelectedEntity = (entity: Entity | null) => {
        this.selectedEntity = entity;
    }

    update() {
        const mouse = this.engine.getSystem('InputSystem')?.getWorldMousePosition();
        if (!mouse) return;
        this.hoveredEntity = this.getEntityAtPosition(mouse.x, mouse.y);

    }
    draw() { }

    destroy() {
        this.controller.abort();
    }
}