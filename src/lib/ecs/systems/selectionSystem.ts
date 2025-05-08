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
    private controller = new AbortController();

    constructor(engine: Engine) {
        this.engine = engine;
        const canvas = this.engine.canvas;
        canvas.addEventListener('mousedown', this.onMouseDown, { signal: this.controller.signal });
        canvas.addEventListener('mouseup', this.onMouseUp, { signal: this.controller.signal });
    }

    public getEntityAtPosition(x: number, y: number): Entity | null {
        for (const entity of this.engine.entities.values()) {
            const positionComponent = entity.getComponent('position');
            const typeComponent = entity.getComponent('type');
            if (!positionComponent || !typeComponent) continue;

            const { x1, y1, x2, y2 } = positionComponent.position;
            const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);

            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                const interactionPoint = getPositionWithinElement(x, y, entity.element);

                if (typeComponent.type === "POINTER" && interactionPoint &&
                    !['line_middle', 'inside', 'start', 'end'].includes(interactionPoint)) {
                    continue;
                }
                return entity;
            }
        }
        return null;
    }

    private getPositionWithinEntity(x: number, y: number, entity: Entity): PositionWithinElement | null {
        const typeComponent = entity.getComponent('type');
        const positionComponent = entity.getComponent('position');
        return (!typeComponent || !positionComponent) ? null :
            getPositionWithinElement(x, y, entity.element);
    }

    private onMouseDown = (e: MouseEvent) => {
        const mouse = this.engine.getSystem('InputSystem')?.getWorldMousePosition();
        if (!mouse) return;

        const isModifierKeyPressed = e.ctrlKey || e.shiftKey || e.altKey;
        const selectedEntities = this.getSelectedEntities();

        // MOVE EVERYTHING INSIDE THE BOUNDS
        if (selectedEntities.length > 1 && !isModifierKeyPressed) {
            const bounds = this.calculateSelectionBounds(selectedEntities);
            const padding = 10;
            const expandedBounds = {
                minX: bounds.minX - padding,
                minY: bounds.minY - padding,
                maxX: bounds.maxX + padding,
                maxY: bounds.maxY + padding
            };

            if (this.isPointInBounds(mouse, expandedBounds)) {
                for (const entity of selectedEntities) {
                    this.prepareEntityForMovement(entity, mouse);
                }
                return;
            }
        }

        const entity = this.getEntityAtPosition(mouse.x, mouse.y);

        if (!entity) {
            if (!isModifierKeyPressed) this.clearSelection();
            this.interactionPoint = null;
            this.selectedEntity = null;
            return;
        }

        const selectableComponent = entity.getComponent('selectable');
        if (!selectableComponent) return;

        // 2c. Handle shift clicking (toggle selection)
        if (isModifierKeyPressed && selectableComponent.selected) {
            this.toggleEntitySelection(entity, false);
            return;
        }

        if (!isModifierKeyPressed) this.clearSelection();
        this.toggleEntitySelection(entity, true);

        this.prepareEntityForMovement(entity, mouse);
    };


    private getSelectedEntities() {
        return this.engine.getEntitiesWithComponents('selectable', 'position')
            .filter(entity => entity.getComponent('selectable')?.selected);
    }

    private isPointInBounds(point: { x: number, y: number }, bounds: { minX: number, minY: number, maxX: number, maxY: number }) {
        return point.x >= bounds.minX && point.x <= bounds.maxX &&
            point.y >= bounds.minY && point.y <= bounds.maxY;
    }


    private prepareEntityForMovement(entity: Entity, mouse: { x: number, y: number }) {
        const posComp = entity.getComponent('position');
        const moveComp = entity.getComponent('movable');

        if (posComp && moveComp) {
            moveComp.mouseGrabOffset = {
                x: mouse.x - posComp.position.x1,
                y: mouse.y - posComp.position.y1
            };
        }

        this.interactionPoint = this.getPositionWithinEntity(mouse.x, mouse.y, entity);
    }

    private toggleEntitySelection(entity: Entity, select: boolean) {
        const selectableComponent = entity.getComponent('selectable');
        if (!selectableComponent) return;

        selectableComponent.selected = select;

        if (select) {
            this.setSelectedEntity(entity);
        } else if (this.selectedEntity === entity) {
            this.selectedEntity = null;
        }
    }


    private calculateSelectionBounds(entities: Entity[]) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (const entity of entities) {
            const { x1, y1, x2, y2 } = entity.getComponent('position')!.position;
            minX = Math.min(minX, Math.min(x1, x2));
            minY = Math.min(minY, Math.min(y1, y2));
            maxX = Math.max(maxX, Math.max(x1, x2));
            maxY = Math.max(maxY, Math.max(y1, y2));
        }

        return { minX, minY, maxX, maxY };
    }

    private onMouseUp = () => {
        this.interactionPoint = null;
    };

    public setSelectedEntity = (entity: Entity | null) => {
        this.selectedEntity = entity;
    };

    private clearSelection = () => {
        const selectableEntities = this.engine.getEntitiesWithComponents('selectable');
        selectableEntities.forEach(entity => {
            const selectableComponent = entity.getComponent('selectable');
            if (selectableComponent) selectableComponent.selected = false;
        });
        this.selectedEntity = null;
        this.interactionPoint = null;
    };

    update() {
        const mouse = this.engine.getSystem('InputSystem')?.getWorldMousePosition();
        if (mouse) this.hoveredEntity = this.getEntityAtPosition(mouse.x, mouse.y);
    }

    draw() { }

    destroy() {
        this.controller.abort();
    }
}