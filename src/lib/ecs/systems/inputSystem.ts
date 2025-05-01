import { System } from "@/types/engine"
import { Engine } from ".."
import { EventSystem } from "./eventSystem"

export class InputSystem implements System {
    engine: Engine
    private canvas: HTMLCanvasElement
    private controller: AbortController
    private eventSystem: EventSystem | undefined
    public mousePosition: { x: number, y: number } = { x: 0, y: 0 }

    constructor(engine: Engine) {
        this.controller = new AbortController()
        this.engine = engine
        this.canvas = this.engine.canvas
        this.eventSystem = this.engine.getSystem('EventSystem')

        this.canvas.addEventListener('mousedown', (e) => {
            this.eventSystem?.emit('mousedown', e)
        }, {
            signal: this.controller.signal
        })

        this.canvas.addEventListener('mouseup', (e) => {
            this.eventSystem?.emit('mouseup', e)
        }, {
            signal: this.controller.signal
        })

        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePosition(e)
        }, {
            signal: this.controller.signal
        })
    }

    private updateMousePosition(e: MouseEvent) {
        const canvas = this.engine.canvas
        const rect = canvas.getBoundingClientRect();

        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        this.mousePosition = {
            x: screenX,
            y: screenY
        }

    }

    getMousePosition() {
        return this.mousePosition
    }

    update() { }
    draw() { }

    destroy() {

        this.controller.abort()
    }
}
