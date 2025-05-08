import { System } from "@/types/engine"
import { Engine } from ".."

export class InputSystem implements System {
    engine: Engine
    private canvas: HTMLCanvasElement
    private controller: AbortController

    public mousePosition: { x: number, y: number } = { x: 0, y: 0 }
    public onMouseDownPositionSnapshot: { x: number, y: number } = { x: 0, y: 0 }
    public isMouseDown: boolean = false
    public isDragging: boolean = false


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
            'mouseup',
            this.onMouseUp,
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

    onMouseUp = () => {
        this.isMouseDown = false
        this.isDragging = false
    }

    onMouseDown = () => {
        this.isMouseDown = true
        this.onMouseDownPositionSnapshot = this.mousePosition
    }

    update() {

        if (this.mousePosition && this.onMouseDownPositionSnapshot && this.isMouseDown) {
            const dx = this.mousePosition.x - this.onMouseDownPositionSnapshot.x
            const dy = this.mousePosition.y - this.onMouseDownPositionSnapshot.y
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                this.isDragging = true
            }
        }
    }
    draw() { }

    destroy() {
        this.controller.abort()
    }
}
