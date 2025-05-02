import { System } from "@/types/engine";
import { Engine } from "..";
import { InputSystem } from "./inputSystem";
import { EventSystem } from "./eventSystem";

export class CreationSystem implements System {
    engine: Engine
    inputSystem: InputSystem | undefined
    eventSystem: EventSystem | undefined
    controller: AbortController;

    constructor(engine: Engine) {
        this.engine = engine
        this.controller = new AbortController()
        this.inputSystem = this.engine.getSystem('InputSystem')
        this.eventSystem = this.engine.getSystem('EventSystem')
        this.engine.canvas.addEventListener('mousedown', this.onMouseDown, { signal: this.controller.signal })
    }

    onMouseDown = () => {
        const mousePos = this.inputSystem!.getWorldMousePosition()
        this.engine.getState().addElement({ x1: mousePos?.x, y1: mousePos?.y, x2: mousePos.x + 100, y2:mousePos.y + 100 })
    }

    update() { }

    draw() { }


    destroy() {
        this.controller.abort()
    }
}
