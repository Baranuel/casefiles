import { System } from "@/types/engine"
import { Engine } from ".."
import { EngineEvents, EventSystem } from "./eventSystem"

export class InputSystem implements System {
    engine: Engine
    private canvas: HTMLCanvasElement
    private controller: AbortController
    private eventSystem: EventSystem | null = null

    public mousePosition: { x: number, y: number } = { x: 0, y: 0 }
    public onMouseDownPositionSnapshot: { x: number, y: number } = { x: 0, y: 0 }
    public isMouseDown: boolean = false
    public isDragging: boolean = false
    private mouseButton: number = 0

    constructor(engine: Engine) {
        this.controller = new AbortController()
        this.engine = engine
        this.canvas = this.engine.canvas
        this.eventSystem = this.engine.getSystem('EventSystem') as EventSystem

        // Set up DOM event listeners
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
            this.onWheel,
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

        // Emit mouse move event
        if (this.eventSystem) {
            this.eventSystem.emit('mouse:move', {
                x: screenX,
                y: screenY,
                modifier: e.shiftKey || e.ctrlKey || e.altKey
            })
        }

        // Check if dragging and emit drag event if needed
        if (this.isMouseDown && this.isDragging) {
            this.emitDragEvent()
        }
    }

    private emitDragEvent() {
        if (!this.eventSystem) return

        const dragData:EngineEvents['mouse:drag'] = {
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            mouseDownSnapshot: this.onMouseDownPositionSnapshot,
        }

        this.eventSystem.emit('mouse:drag', dragData)
    }

    private onWheel = (e: WheelEvent) => {
        if (!this.eventSystem) return

        this.updateMousePosition(e)

        // Then emit wheel event
        this.eventSystem.emit('mouse:wheel', {
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            deltaY: e.deltaY,
            deltaX: e.deltaX
        })
    }

    getWorldMousePosition() {
        return this.mousePosition
    }

    onMouseUp = (e:MouseEvent) => {
        this.isMouseDown = false

        if (this.eventSystem) {
            const mousePos = this.getWorldMousePosition()

            this.eventSystem.emit('mouse:up', {
                x: mousePos.x,
                y: mousePos.y,
                mouseDownSnapshot: this.onMouseDownPositionSnapshot,
                modifier: e.shiftKey || e.ctrlKey || e.altKey

            })
        }

        if (this.isDragging && this.eventSystem) {
            this.eventSystem.emit('mouse:drag:end', {
                x: this.mousePosition.x,
                y: this.mousePosition.y,
                startX: this.onMouseDownPositionSnapshot.x,
                startY: this.onMouseDownPositionSnapshot.y,
                deltaX: this.mousePosition.x - this.onMouseDownPositionSnapshot.x,
                deltaY: this.mousePosition.y - this.onMouseDownPositionSnapshot.y,
                button: this.mouseButton
            })
        }

        this.isDragging = false
    }

    onMouseDown = (e: MouseEvent) => {
        this.isMouseDown = true
        this.mouseButton = e.button
        this.onMouseDownPositionSnapshot = { ...this.mousePosition }

        if (this.eventSystem) {
            const mousePos = this.getWorldMousePosition()

            this.eventSystem.emit('mouse:down', {
                x: mousePos.x,
                y: mousePos.y,
                modifier: e.shiftKey || e.ctrlKey || e.altKey
            })
        }
    }

    update() {
        if (this.mousePosition && this.onMouseDownPositionSnapshot && this.isMouseDown) {
            const dx = this.mousePosition.x - this.onMouseDownPositionSnapshot.x
            const dy = this.mousePosition.y - this.onMouseDownPositionSnapshot.y

            if (!this.isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                this.isDragging = true

                if (this.eventSystem) {
                    this.eventSystem.emit('mouse:drag:start', {
                        x: this.mousePosition.x,
                        y: this.mousePosition.y,
                        startX: this.onMouseDownPositionSnapshot.x,
                        startY: this.onMouseDownPositionSnapshot.y,
                        deltaX: dx,
                        deltaY: dy,
                        button: this.mouseButton
                    })
                }
            }
        }
    }

    draw() { }

    destroy() {
        this.controller.abort()
    }
}
