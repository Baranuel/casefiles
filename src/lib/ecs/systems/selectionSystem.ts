import { System } from "@/types/engine";
import { Engine } from "..";
import { Entity } from "../entities/Entity";
import { PositionWithinElement } from "@/types/elements";
import { EventSystem } from "./eventSystem";
import { getEntityAtPosition, isPointInSelectionArea } from "@/utils/calculations";
import { EngineEvents } from "@/types/events";

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
            this.eventSystem.subscribe('action:select', this.onActionSelect);
            this.eventSystem.subscribe('action:select:end', this.onSelectCleanup);
            this.eventSystem.subscribe('selection:cleared', this.clearSelection);
        }
    }

    onActionSelect = (data: EngineEvents['action:select']) => {
        const selectableEntities = this.engine.getEntitiesWithComponents('selectable');
        const entityHit = data.entity ??  getEntityAtPosition(selectableEntities, data.mouse.x, data.mouse.y);

        const selectedEntities = selectableEntities.filter(entity => entity.getComponent('selectable')?.selected);
        const clickedInSelectionArea = isPointInSelectionArea(selectedEntities, data.mouse.x, data.mouse.y);

        if (clickedInSelectionArea && !data.modifier) {
            return console.warn('Clicked in selection area, but no modifier key pressed. No action taken.');
        }
        if (!entityHit && selectedEntities.length === 1) {
            return this.clearSelection()
        } else if (entityHit) {
            this.selectEntity(entityHit, data.modifier);
        }
    }

    onSelectCleanup = (data: EngineEvents['action:select:end']) => {
        const { mouse, mouseDownSnapshot, modifier, mouseScreenPositionSnapshot, screenX, screenY } = data;
        const { x, y } = mouse;
        const selectedEntities = this.engine.getEntitiesWithComponents('selectable').filter(entity => entity.getComponent('selectable')?.selected);
        const finishedClickInSelectionArea = isPointInSelectionArea(selectedEntities, x, y);
        const movedMouseSinceMouseDown = mouseDownSnapshot && (Math.abs(x - mouseDownSnapshot.x) > 5 || Math.abs(y - mouseDownSnapshot.y) > 5);
        const screenMovedMouseSinceMouseDown = mouseScreenPositionSnapshot && (Math.abs(screenX! - mouseScreenPositionSnapshot.x) > 5 || Math.abs(screenY! - mouseScreenPositionSnapshot.y) > 5);

        if (finishedClickInSelectionArea && !modifier && !movedMouseSinceMouseDown && !screenMovedMouseSinceMouseDown) {
            const entityHit = getEntityAtPosition(selectedEntities, x, y);
            if (entityHit && selectedEntities.length > 1) {
                this.selectEntity(entityHit, false)
            }
        }

        if (!finishedClickInSelectionArea && !movedMouseSinceMouseDown && !screenMovedMouseSinceMouseDown && !modifier) {
            const entityHit = getEntityAtPosition(this.engine.getEntitiesWithComponents('selectable'), x, y);
            this.handleSelectPreviewEntity(entityHit);
        }

        if (!movedMouseSinceMouseDown && !screenMovedMouseSinceMouseDown && !modifier && selectedEntities.length > 1) {
            return this.clearSelection()
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

    private handleSelectPreviewEntity(entity: Entity | null) {
        const { setPreviewElementId } = this.engine.getState();
        const typeC = entity?.getComponent('type')
        if (!typeC || !entity) return setPreviewElementId(null)

        if (typeC.type === 'POINTER') return setPreviewElementId(null)

        const elementId = entity ? entity.element.id : null;

        setPreviewElementId(elementId)
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
            this.eventSystem.unsubscribe('action:select', this.onActionSelect);
            this.eventSystem.unsubscribe('action:select:end', this.onSelectCleanup);
            this.eventSystem.unsubscribe('selection:cleared', this.clearSelection);

        }
    }
}