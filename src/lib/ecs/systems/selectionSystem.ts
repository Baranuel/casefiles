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
            this.eventSystem.subscribe('mouse:up', this.onMouseUp);
            this.eventSystem.subscribe('action:select', this.onActionSelect);
            this.eventSystem.subscribe('selection:cleared', this.clearSelection);
        }
    }

    onMouseUp = (data: EngineEvents['mouse:up']) => {
        if (this.engine.getState().tool !== 'SELECT') return

        const { x, y, mouseDownSnapshot, modifier } = data
        const selectedEntities = this.engine.getEntitiesWithComponents('selectable').filter(entity => entity.getComponent('selectable')?.selected);
        const finishedClickInSelectionArea = isPointInSelectionArea(selectedEntities, data.x, data.y);
        const movedMouseSinceMouseDown = mouseDownSnapshot && (Math.abs(x - mouseDownSnapshot.x) > 5 || Math.abs(y - mouseDownSnapshot.y) > 5);

        if (finishedClickInSelectionArea && !data.modifier && !movedMouseSinceMouseDown) {
            const entityHit = getEntityAtPosition(selectedEntities, data.x, data.y);
            if (entityHit && selectedEntities.length > 1) {
                this.selectEntity(entityHit, false)
            }
        }

        if(!finishedClickInSelectionArea && !movedMouseSinceMouseDown) {
            const entityHit = getEntityAtPosition(this.engine.getEntitiesWithComponents('selectable'), data.x, data.y);
                this.handleSelectPreviewEntity(entityHit);
        }

        if (!movedMouseSinceMouseDown && !modifier && selectedEntities.length > 1) {
            return this.clearSelection()
        }
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

    private handleSelectPreviewEntity (entity: Entity | null) {
        const el = entity ? entity.element : null;
       const {setPreviewElement} = this.engine.getState();
        
       setPreviewElement(el)
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
            this.eventSystem.unsubscribe('mouse:up', this.onMouseUp);
            this.eventSystem.unsubscribe('selection:cleared', this.clearSelection);

        }
    }
}