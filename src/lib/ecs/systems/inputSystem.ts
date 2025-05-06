import { System } from "@/types/engine"
import { Engine } from ".."

export class InputSystem implements System {
    engine: Engine
    private canvas: HTMLCanvasElement
    private controller: AbortController
    public mousePosition: { x: number, y: number } = { x: 0, y: 0 }
    public onMouseDownPositionSnapshot: { x: number, y: number } = { x: 0, y: 0 }


    constructor(engine: Engine) {
        this.controller = new AbortController()
        this.engine = engine
        this.canvas = this.engine.canvas
        this.canvas.addEventListener(
            'mousedown',
            this.onMouseDown,
            { signal: this.controller.signal }
        )
        this.canvas.addEventListener(
            'mousemove',
            this.updateMousePosition,
            { signal: this.controller.signal }
        )
        this.canvas.addEventListener(
            'wheel',
            this.updateMousePosition,
            { signal: this.controller.signal }
        )
    }

    private updateMousePosition = (e: MouseEvent) => {
        const { canvas, engine } = this
        const { camera } = engine
        const rect = canvas.getBoundingClientRect()
        const screenX = e.clientX - rect.left
        const screenY = e.clientY - rect.top
        const clientX = (screenX / camera.zoom) + camera.x
        const clientY = (screenY / camera.zoom) + camera.y

        this.mousePosition = { x: clientX, y: clientY }
    }

    getWorldMousePosition() {
        return this.mousePosition
    }

    getScreenMousePosition() {
        return this.mousePosition
    }

    onMouseDown = () => {
        this.onMouseDownPositionSnapshot = this.mousePosition
    }

    update() { }
    draw() { }

    destroy() {
        this.controller.abort()
    }
}
