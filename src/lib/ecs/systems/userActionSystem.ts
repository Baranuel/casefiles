import { System } from "@/types/engine";
import { Engine } from "..";
import { SelectionSystem } from "./selectionSystem";
import { InputSystem } from "./inputSystem";
import { EngineEvents, EventSystem } from "./eventSystem";
import { getEntityAtPosition, isPointInSelectionArea } from "@/utils/calculations";
import { Entity } from "../entities/Entity";
import { getPositionWithinElement } from "@/utils/positions";
import { PositionWithinElement } from "@/types/elements";

export class UserActionSystem implements System {
    engine: Engine
    selectionSystem: SelectionSystem | null
    inputSystem: InputSystem | null
    eventSystem: EventSystem | null
    currentAction: 'idle' | 'moving' | 'resizing' = 'idle'


    constructor(engine: Engine) {
        this.engine = engine
        this.selectionSystem = this.engine.getSystem('SelectionSystem') || null
        this.inputSystem = this.engine.getSystem('InputSystem') || null
        this.eventSystem = this.engine.getSystem('EventSystem') || null

        if (this.eventSystem) {
            this.eventSystem.subscribe('mouse:down', this.onMouseDown)
            this.eventSystem.subscribe('mouse:drag', this.onDrag)
            this.eventSystem.subscribe('mouse:up', this.onMouseUp)
            this.eventSystem.subscribe('action:change', this.updateAction)
        }

    }

    onMouseDown = (data: EngineEvents['mouse:down']) => {
        const { x, y } = data
        const entities = this.engine.getEntitiesWithComponents('resizable', 'selectable').filter(e => e.getComponent('selectable')!.selected)
        const interactionPoint = this.checkForResizeInteraction({ x, y }, entities)
        if (interactionPoint !== null) {
            this.emitStartResizeAction({ x, y }, data.mouseDownSnapshot, interactionPoint)
            return 
        }
    }

    onDrag = (data: EngineEvents['mouse:drag']) => {
        const selectableEntities = this.engine.getEntitiesWithComponents('selectable').filter(entity => entity.getComponent('selectable')?.selected);

        // Bock shooting a start event even during a drag
        if (this.checkForMoveInteraction(data, selectableEntities)) {
            if (this.currentAction === 'idle') {
                this.emitStartMoveAction(data, data.mouseDownSnapshot)
            }
        }

        /// This is were we actually keep the current action dragging event going
        switch (this.currentAction) {
            case 'moving':
                this.eventSystem?.emit('action:move', { x: data.x, y: data.y })
                break;

            case 'resizing':
                this.eventSystem?.emit('action:resize', { x: data.x, y: data.y })
                break;
        }
    }

    onMouseUp = () => {

        switch (this.currentAction) {
            case 'moving':
                this.eventSystem?.emit('action:move:end', null)
                break;
            case 'resizing':
                this.eventSystem?.emit('action:resize:end', null)
                break;
        }
        
        this.currentAction = 'idle'
    }



    private checkForMoveInteraction(mouse: { x: number, y: number }, entities: Entity[]) {
        const { x, y } = mouse
        const selectedAreaHit = isPointInSelectionArea(entities, x, y)

        return !!selectedAreaHit
    }

    private checkForResizeInteraction(mouse: { x: number, y: number }, entities: Entity[]): PositionWithinElement | null {
        const { x, y } = mouse
        const entityHit = getEntityAtPosition(entities, x, y)
        if (!entityHit) return null

        const interactionPoint = getPositionWithinElement(x, y, entityHit.element)
        
        if (interactionPoint === 'start' || interactionPoint === 'end') {
            return interactionPoint
        }
        return null
    }

    private updateAction = (data: EngineEvents['action:change']) => {
        this.currentAction = data.action
        console.log('action updated', this.currentAction)
    }

    private emitStartMoveAction(mouse: { x: number, y: number }, mouseDownSnapshot: { x: number, y: number }) {
        const { x, y } = mouse
        this.currentAction = 'moving'
        this.eventSystem?.emit('action:move:start', { x, y, mouseDownSnapshot })
    }

    private emitStartResizeAction(mouse: { x: number, y: number }, mouseDownSnapshot: { x: number, y: number }, interactionPoint: PositionWithinElement) {
        const { x, y } = mouse
        this.currentAction = 'resizing'
        this.eventSystem?.emit('action:resize:start', { x, y, mouseDownSnapshot, interactionPoint })
    }


    update() { }

    draw() { }

    destroy() {
        if (this.eventSystem) {
            this.eventSystem.unsubscribe('mouse:down', this.onMouseDown)
            this.eventSystem.unsubscribe('mouse:drag', this.onDrag)
            this.eventSystem.unsubscribe('mouse:up', this.onMouseUp)
            this.eventSystem.unsubscribe('action:change', this.updateAction)
        }
    }
}