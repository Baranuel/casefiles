import { System } from "@/types/engine";
import { Engine } from "..";
import { InputSystem } from "./inputSystem";
import { EventSystem } from "./eventSystem";

export class CreationSystem implements System {
    engine: Engine
    inputSystem: InputSystem | undefined
    eventSystem: EventSystem | undefined

    constructor(engine: Engine) {
        this.engine = engine
        this.inputSystem = this.engine.getSystem('InputSystem')
        this.eventSystem = this.engine.getSystem('EventSystem')

        this.eventSystem?.subscribe('mousedown', this.onMouseDown.bind(this))
    }

    onMouseDown() {
        const mousePos = this.inputSystem!.getMousePosition()
        this.engine.getState().addElement({ x: mousePos?.x, y: mousePos?.y })
    }


    update() { }

    draw() { }


    destroy() {
        this.eventSystem?.unsubscribe('mousedown', this.onMouseDown.bind(this))
    }
}
