import { System } from "@/types/engine";
import { Engine } from "..";
import { SelectionSystem } from "./selectionSystem";

export class UserActionSystem implements System {
    engine: Engine
    controller: AbortController
    selectionSystem: SelectionSystem | null

    isMouseDown: boolean = false;

    constructor(engine: Engine) {
        this.engine = engine
        this.selectionSystem = this.engine.getSystem('SelectionSystem') || null
        this.controller = new AbortController()
        this.engine.canvas.addEventListener('mousedown', this.onMouseDown, { signal: this.controller.signal })
        this.engine.canvas.addEventListener('mouseup', this.onMouseUp, { signal: this.controller.signal })
    }

    onMouseDown = () => {
        this.isMouseDown = true

    }

    onMouseUp = () => {
        this.engine.userAction= 'idle'
        this.isMouseDown = false
    }


    update() {
        if (!this.selectionSystem || this.engine.getState().tool !== 'SELECT') return

        const selectedEntity = this.selectionSystem.selectedEntity
        const interactionPoint = this.selectionSystem.interactionPoint

        const resizeInteraction = interactionPoint === 'start' || interactionPoint === 'end'
        const moveInteraction = !resizeInteraction

        // RESIZE ACTION
        if (selectedEntity && resizeInteraction &&  this.isMouseDown) {
            return this.engine.userAction= 'resizing'
        }

        // MOVE ACTION
        if (selectedEntity && moveInteraction && this.isMouseDown) {
            const input = this.engine.getSystem('InputSystem')
            if (!input) return
            const { onMouseDownPositionSnapshot, mousePosition } = input

            if (
                Math.abs(onMouseDownPositionSnapshot.x - mousePosition.x) >= 5 ||
                Math.abs(onMouseDownPositionSnapshot.y - mousePosition.y) >= 5
            ) {
                return this.engine.userAction= 'moving'
            }
        }
        

    }

    draw() { }

    destroy() {
        this.controller.abort();
    }
}