import { MousePosition, System } from "@/types/engine";
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
            this.eventSystem.subscribe('touch:end', this.onTouchEnd);
            this.eventSystem.subscribe('mouse:up', this.onMouseUp);
            this.eventSystem.subscribe('action:select', this.onActionSelect);
            this.eventSystem.subscribe('selection:cleared', this.clearSelection);
        }
    }

    onTouchEnd = (data: EngineEvents['touch:end']) => {
        const { x, y } = data;
        this.onSelectCleanup(x, y, data.mouseDownSnapshot,false, data.screenPositionSnapshot, data.screenX, data.screenY);
    }

    onMouseUp = (data: EngineEvents['mouse:up']) => {
        console.log('Mouse up event', data);
        this.onSelectCleanup(data.x, data.y, data.mouseDownSnapshot, data.modifier,data.screenPositionSnapshot, data.screenX, data.screenY);
    }


    onActionSelect = (data: EngineEvents['action:select']) => {
        const selectableEntities = this.engine.getEntitiesWithComponents('selectable');
        const entityHit = getEntityAtPosition(selectableEntities, data.mouse.x, data.mouse.y);

        const selectedEntities = selectableEntities.filter(entity => entity.getComponent('selectable')?.selected);
        const clickedInSelectionArea = isPointInSelectionArea(selectedEntities, data.mouse.x, data.mouse.y);

        if (clickedInSelectionArea && !data.modifier) {
            console.log('Clicked in selection area, but no modifier key pressed');
            return
        }
        if (!entityHit && selectedEntities.length === 1) {
            return this.clearSelection()
        } else if (entityHit) {
            this.selectEntity(entityHit, data.modifier);
        }
    }

    onSelectCleanup = (x: number, y: number, mouseDownSnapshot?: MousePosition, modifier?: boolean, mouseScreenPosition?:MousePosition, screenX?:number, screenY?:number) => {
        const selectedEntities = this.engine.getEntitiesWithComponents('selectable').filter(entity => entity.getComponent('selectable')?.selected);
        const finishedClickInSelectionArea = isPointInSelectionArea(selectedEntities, x, y);
        const movedMouseSinceMouseDown = mouseDownSnapshot && (Math.abs(x - mouseDownSnapshot.x) > 5 || Math.abs(y - mouseDownSnapshot.y) > 5);
        const screenMovedMouseSinceMouseDown = mouseScreenPosition && (Math.abs(screenX! - mouseScreenPosition.x) > 5 || Math.abs(screenY! - mouseScreenPosition.y) > 5);

        if (finishedClickInSelectionArea && !modifier && !movedMouseSinceMouseDown) {
            const entityHit = getEntityAtPosition(selectedEntities, x, y);
            if (entityHit && selectedEntities.length > 1) {
                this.selectEntity(entityHit, false)
            }
        }

        if (!finishedClickInSelectionArea && !movedMouseSinceMouseDown && !screenMovedMouseSinceMouseDown) {
            const entityHit = getEntityAtPosition(this.engine.getEntitiesWithComponents('selectable'), x, y);
            this.handleSelectPreviewEntity(entityHit);
        }

        if (!movedMouseSinceMouseDown && !modifier && selectedEntities.length > 1) {
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
            this.eventSystem.unsubscribe('touch:end', this.onTouchEnd);
            this.eventSystem.unsubscribe('mouse:up', this.onMouseUp);
            this.eventSystem.unsubscribe('selection:cleared', this.clearSelection);

        }
    }
}