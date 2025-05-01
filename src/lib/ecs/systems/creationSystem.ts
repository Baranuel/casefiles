import { System } from "@/types/engine";
import { Engine } from "..";
import { InputSystem } from "./inputSystem";
import { EventSystem } from "./eventSystem";

export class CreationSystem implements System {
    engine: Engine
    inputSystem: InputSystem | undefined
    eventSystem: EventSystem | undefined
    private boundOnMouseDown: (e: MouseEvent) => void;

    constructor(engine: Engine) {
        this.engine = engine
        this.inputSystem = this.engine.getSystem('InputSystem')
        this.eventSystem = this.engine.getSystem('EventSystem')
        this.boundOnMouseDown = this.onMouseDown.bind(this)
        this.engine.canvas.addEventListener('mousedown', this.boundOnMouseDown)
    }

    onMouseDown() {
        const mousePos = this.inputSystem!.getWorldMousePosition()
        this.engine.getState().addElement({ x: mousePos?.x, y: mousePos?.y })
    }

    update() { }

    draw() { }


    destroy() {
        this.engine.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this))
    }
}
