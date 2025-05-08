import { System } from "@/types/engine";
import { Engine } from "..";
import { SelectionSystem } from "./selectionSystem";
import { InputSystem } from "./inputSystem";

export class UserActionSystem implements System {
    engine: Engine
    controller: AbortController
    selectionSystem: SelectionSystem | null
    inputSystem: InputSystem | null

    isMouseDown: boolean = false;

    constructor(engine: Engine) {
        this.engine = engine
        this.selectionSystem = this.engine.getSystem('SelectionSystem') || null
        this.inputSystem = this.engine.getSystem('InputSystem') || null

        this.controller = new AbortController()
        this.engine.canvas.addEventListener('mousedown', this.onMouseDown, { signal: this.controller.signal })
        this.engine.canvas.addEventListener('mouseup', this.onMouseUp, { signal: this.controller.signal })
    }

    onMouseDown = () => {
        this.isMouseDown = true

    }

    onMouseUp = () => {
        this.engine.userAction = 'idle'
        this.isMouseDown = false
    }


    update() {
        if (!this.selectionSystem || !this.inputSystem || this.engine.getState().tool !== 'SELECT') return

        const selectedEntity = this.selectionSystem.selectedEntity
        const interactionPoint = this.selectionSystem.interactionPoint

        const resizeInteraction = interactionPoint === 'start' || interactionPoint === 'end'
        const moveInteraction = !resizeInteraction

        // RESIZE ACTION
        if (selectedEntity && resizeInteraction && this.isMouseDown) {
            return this.engine.userAction = 'resizing'
        }
        // MOVE ACTION
        const selectedEntities = this.engine.getEntitiesWithComponents('movable', 'position', 'selectable')
            .filter(entity => entity.getComponent('selectable')?.selected);

        if (selectedEntities.length > 0 && moveInteraction && this.inputSystem.isDragging) {
            for (const entity of selectedEntities) {
                const movableComp = entity.getComponent('movable');
                if (!movableComp) continue;
                movableComp.moving = true;
            }
        }


    }

    draw() { }

    destroy() {
        this.controller.abort();
    }
}