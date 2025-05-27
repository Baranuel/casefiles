import { System } from "@/types/engine";
import { Engine } from "..";
import { SelectionSystem } from "./selectionSystem";
import { InputSystem } from "./inputSystem";
import { EventSystem } from "./eventSystem";
import { getEntityAtPosition, isPointInSelectionArea } from "@/utils/calculations";
import { Entity } from "../entities/Entity";
import { getPositionWithinElement } from "@/utils/positions";
import { PositionWithinElement } from "@/types/elements";
import { EngineEvents } from "@/types/events";

export class UserActionSystem implements System {
    engine: Engine
    selectionSystem: SelectionSystem | null
    inputSystem: InputSystem | null
    eventSystem: EventSystem | null
    currentAction: 'idle' | 'moving' | 'resizing' | 'panning' = 'idle'


    constructor(engine: Engine) {
        this.engine = engine
        this.selectionSystem = this.engine.getSystem('SelectionSystem') || null
        this.inputSystem = this.engine.getSystem('InputSystem') || null
        this.eventSystem = this.engine.getSystem('EventSystem') || null

        if (this.eventSystem) {
            this.eventSystem.subscribe('mouse:down', this.onMouseDown)
            this.eventSystem.subscribe('mouse:drag', this.onDrag)
            this.eventSystem.subscribe('mouse:up', this.onMouseUp)
            this.eventSystem.subscribe('touch:start', this.onTouchStart)
            this.eventSystem.subscribe('touch:move', this.onTouchMove)
            this.eventSystem.subscribe('touch:end', this.onTouchEnd)
            this.eventSystem.subscribe('action:change', this.updateAction)
            this.eventSystem.subscribe('action:pan', this.onPan)
        }

    }

    onPan = () => {
        this.eventSystem?.emit('action:change', { action: 'panning' })
    }

    onTouchStart = (data: EngineEvents['touch:start']) => {
        if (this.currentAction === 'panning') return
        if (data.touches.length > 1 || this.engine.getState().tool === 'MOVE') return this.eventSystem?.emit('selection:cleared', undefined)
        this.handleSelectionEvent(data.x, data.y, data.mouseDownSnapshot)
    }

    onMouseDown = (data: EngineEvents['mouse:down']) => {
        if (this.currentAction === 'panning') return
        this.handleSelectionEvent(data.x, data.y, data.mouseDownSnapshot, data.modifier)
    }

    onTouchMove = (data: EngineEvents['touch:move']) => {
        if (this.currentAction === 'panning') return
        if (data.touches.length > 1) return
        this.handleDragEvent(data.x, data.y, data.mouseDownSnapshot)
    }

    onDrag = (data: EngineEvents['mouse:drag']) => {
        if (this.currentAction === 'panning') return
        this.handleDragEvent(data.x, data.y, data.mouseDownSnapshot)
    }

    onTouchEnd = (data: EngineEvents['touch:end']) => {
        if (this.currentAction === 'panning') return
        this.eventSystem?.emit('action:select:end', { mouse: { x: data.x, y: data.y }, mouseDownSnapshot: data.mouseDownSnapshot, mouseScreenPositionSnapshot: data.mouseScreenPositionSnapshot, screenX: data.screenX, screenY: data.screenY })
        this.handleCleanup()
    }

    onMouseUp = (data: EngineEvents['mouse:up']) => {
        this.eventSystem?.emit('action:select:end', { mouse: { x: data.x, y: data.y }, modifier: data.modifier, mouseDownSnapshot: data.mouseDownSnapshot, mouseScreenPositionSnapshot: data.mouseScreenPositionSnapshot, screenX: data.screenX, screenY: data.screenY })
        this.handleCleanup()
    }





    private handleCleanup = () => {
        switch (this.currentAction) {
            case 'moving':
                this.eventSystem?.emit('action:move:end', null)
                break;
            case 'resizing':
                this.eventSystem?.emit('action:resize:end', null)
                break;
        }
        this.eventSystem?.emit('action:change', { action: 'idle' })
    }


    private handleSelectionEvent(x: number, y: number, mouseDownSnapshot: { x: number, y: number }, modifier?: boolean) {
        const tool = this.engine.getState().tool
        if (tool === 'SELECT') {
            //handle the interaction here
            const selectedEntities = this.engine.getEntitiesWithComponents('selectable').filter(entity => entity.getComponent('selectable')?.selected);
            this.eventSystem?.emit('action:select', { mouse: { x, y }, onMouseDownSnapshot: mouseDownSnapshot, modifier: modifier })

            if (selectedEntities.length < 1) return

            // Here we're clicking on the select entity again so probably want extra interaction like resize
            const interactionData = this.checkForResizeInteraction({ x, y }, selectedEntities)
            if (!interactionData) return
            const { entity, interactionPoint } = interactionData

            if (interactionPoint !== null) {
                this.emitStartResizeAction({ x, y }, mouseDownSnapshot, interactionPoint, entity.id)
                return
            }

        }

        if (tool !== 'SELECT' && tool !== 'MOVE') {
            // Probably emit a create action here
            this.eventSystem?.emit('action:create', { x, y, tool })
        }
    }

    private handleDragEvent(x: number, y: number, mouseDownSnapshot: { x: number, y: number }) {
        const selectableEntities = this.engine.getEntitiesWithComponents('selectable').filter(entity => entity.getComponent('selectable')?.selected);

        // Bock shooting a start event even during a drag
        if (this.checkForMoveInteraction({ x, y }, selectableEntities)) {
            if (this.currentAction === 'idle') {
                const entityHit = getEntityAtPosition(selectableEntities, x, y)


                    this.emitStartMoveAction({ x, y }, mouseDownSnapshot, entityHit?.id)

            }
        }

        /// This is were we actually keep the current dragging event going
        switch (this.currentAction) {
            case 'moving':
                this.eventSystem?.emit('action:move', { x: x, y: y })
                break;

            case 'resizing':
                this.eventSystem?.emit('action:resize', { x: x, y: y })
                break;
        }
    }



    private checkForMoveInteraction(mouse: { x: number, y: number }, entities: Entity[]) {
        const { x, y } = mouse

        if (entities.length <= 1) {
            const entityHit = getEntityAtPosition(entities, x, y)
            return !!entityHit
        }

        const selectedAreaHit = isPointInSelectionArea(entities, x, y)

        return !!selectedAreaHit
    }

    private checkForResizeInteraction(mouse: { x: number, y: number }, entities: Entity[]) {
        const { x, y } = mouse
        const entityHit = getEntityAtPosition(entities, x, y)
        if (!entityHit) return null

        const interactionPoint = getPositionWithinElement(x, y, entityHit.element)

        if (interactionPoint === 'start' || interactionPoint === 'end') {
            return {
                entity: entityHit,
                interactionPoint: interactionPoint
            }
        }
        return null
    }

    private updateAction = (data: EngineEvents['action:change']) => {
        this.currentAction = data.action
        this.engine.userAction = data.action
    }

    private emitStartMoveAction(mouse: { x: number, y: number }, mouseDownSnapshot: { x: number, y: number }, entityId?: Entity['id']) {
        const { x, y } = mouse
        this.eventSystem?.emit('action:change', { action: 'moving' })
        this.eventSystem?.emit('action:move:start', { x, y, mouseDownSnapshot, entityId })
    }

    private emitStartResizeAction(mouse: { x: number, y: number }, mouseDownSnapshot: { x: number, y: number }, interactionPoint: PositionWithinElement, entityId: Entity['id']) {
        const { x, y } = mouse
        this.eventSystem?.emit('action:change', { action: 'resizing' })
        this.eventSystem?.emit('action:resize:start', { x, y, mouseDownSnapshot, interactionPoint, entityId })
    }


    update() { }

    draw() { }

    destroy() {
        if (this.eventSystem) {
            this.eventSystem.unsubscribe('mouse:down', this.onMouseDown)
            this.eventSystem.unsubscribe('mouse:drag', this.onDrag)
            this.eventSystem.unsubscribe('mouse:up', this.onMouseUp)
            this.eventSystem.unsubscribe('touch:start', this.onTouchStart)
            this.eventSystem.unsubscribe('touch:move', this.onTouchMove)
            this.eventSystem.unsubscribe('touch:end', this.onTouchEnd)
            this.eventSystem.unsubscribe('action:change', this.updateAction)
            this.eventSystem.unsubscribe('action:pan', this.onPan)
        }
    }
}