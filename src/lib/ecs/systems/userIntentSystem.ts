import { System } from "@/types/engine";
import { Engine } from "..";
import { SelectionSystem } from "./selectionSystem";

export class UserIntentSystem implements System {
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
        this.isMouseDown = false
        this.engine.userIntent = 'idle'
    }


    update() {
        if (!this.selectionSystem || this.engine.getState().tool !== 'SELECT') return

        const hoveredEntity = this.selectionSystem.hoveredEntity
        const interactionPoint = this.selectionSystem.interactionPoint

        if(hoveredEntity && interactionPoint !== 'inside' && this.isMouseDown) {
            return this.engine.userIntent = 'resize'

        }

        if (hoveredEntity && interactionPoint === 'inside' && this.isMouseDown) {
            return this.engine.userIntent = 'move'
        }
        
        

    }

    draw() {
    }

    destroy() {
        this.controller.abort();
    }
}