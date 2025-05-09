import { System } from "@/types/engine";
import { Engine } from "..";
import { Entity } from "../entities/Entity";
import { PositionWithinElement } from "@/types/elements";
import { EventSystem, EngineEvents } from "./eventSystem";
import { getEntityAtPosition, isPointInSelectionArea } from "@/utils/calculations";

export class SelectionSystem implements System {
    engine: Engine;
    hoveredEntity: Entity | null = null;
    selectedEntity: Entity | null = null;
    interactionPoint: PositionWithinElement | null = null;

    private eventSystem: EventSystem | null = null;

    constructor(engine: Engine) {
        this.engine = engine;
        this.eventSystem = this.engine.getSystem('EventSystem') as EventSystem;

        if (this.eventSystem) {
            this.eventSystem.subscribe('mouse:down', this.onMouseDown);
            this.eventSystem.subscribe('mouse:up', this.onMouseUp);
            this.eventSystem.subscribe('selection:cleared', this.clearSelection);
        }
    }

    onMouseUp = (data: EngineEvents['mouse:up']) => {
        if(this.engine.getState().tool !== 'SELECT') return

        const { x, y, mouseDownSnapshot, modifier } = data
        const selectedEntities = this.engine.getEntitiesWithComponents('selectable').filter(entity => entity.getComponent('selectable')?.selected);
        const finishedClickInSelectionArea = isPointInSelectionArea(selectedEntities, data.x, data.y);
        const movedMouseSinceMouseDown = mouseDownSnapshot && (Math.abs(x - mouseDownSnapshot.x) > 5 || Math.abs(y - mouseDownSnapshot.y) > 5);

        if (finishedClickInSelectionArea && selectedEntities.length > 1 && !data.modifier && !movedMouseSinceMouseDown) {
            const entityHit = getEntityAtPosition(selectedEntities, data.x, data.y);
            if (entityHit) return this.selectEntity(entityHit, false);
        }

        if (!movedMouseSinceMouseDown && !modifier && selectedEntities.length > 1) {
            return this.clearSelection()
        }
    }


    onMouseDown = (data: EngineEvents['mouse:down']) => {
        if(this.engine.getState().tool !== 'SELECT') return

        const selectableEntities = this.engine.getEntitiesWithComponents('selectable');
        const entityHit = getEntityAtPosition(selectableEntities, data.x, data.y);
        const selectedEntities = selectableEntities.filter(entity => entity.getComponent('selectable')?.selected);

        const clickedInSelectionArea = isPointInSelectionArea(selectedEntities, data.x, data.y);

        if (clickedInSelectionArea && !data.modifier) {
            return
        }
        if (!entityHit && selectedEntities.length === 1) {
            return this.clearSelection()
        } else if (entityHit) {
            this.selectEntity(entityHit, data.modifier);
        }
    }



    private selectEntity(entity: Entity, modifier: boolean = false) {
        const selectableComponent = entity.getComponent('selectable');
        if (!selectableComponent) return;

        if (!modifier) {
            this.clearSelection();
            selectableComponent.selected = true;
        } else if (selectableComponent.selected) {
            selectableComponent.selected = false;
        } else {
            selectableComponent.selected = true;
        }
    }


    private clearSelection = () => {
        const entities = this.engine.getEntitiesWithComponents('selectable').filter(entity => entity.getComponent('selectable')?.selected);
        for (const entity of entities) {
            const selectableComponent = entity.getComponent('selectable')!;
            selectableComponent.selected = false;
        }
    }


    update() { }
    draw() { }
    destroy() {
        if (this.eventSystem) {
            this.eventSystem.unsubscribe('mouse:down', this.onMouseDown);
            this.eventSystem.unsubscribe('mouse:up', this.onMouseUp);
            this.eventSystem.unsubscribe('selection:cleared', this.clearSelection);

        }
    }
}