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
        const { tool, addElement } = this.engine.getState()

        if (tool === 'SELECT') return

        const { x, y } = this.inputSystem!.getWorldMousePosition();
        const width = 200;
        const height = 300;
        const x1 = x - width / 2;
        const y1 = y - height / 2;
        const x2 = x + width / 2;
        const y2 = y + height / 2;

        const id = crypto.randomUUID()
        const position = { x1, y1, x2, y2 };
        const newElement = {
            id,
            type: tool,
            position
        };
        addElement(newElement)
    }

    update() { }

    draw() { }


    destroy() {
        this.controller.abort()
    }
}
