import { Engine } from ".."
import { System } from "../../interfaces"

export class InputSystem implements System {
    engine: Engine
    private canvas: HTMLCanvasElement
    private controller: AbortController

    public mousePosition: { x: number, y: number } = { x: 0, y: 0 }
    public actions: Map<string, boolean> = new Map();
    public mouseEvents: Map<string, boolean> = new Map();


    constructor(engine: Engine) {
        this.controller = new AbortController()
        this.engine = engine
        this.canvas = this.engine.canvas


        this.canvas.addEventListener('mousedown', () => {
            this.removeMouseEvent('mouseup')
            this.recordMouseEvent('mousedown')
        }, {
            signal: this.controller.signal
        })

        this.canvas.addEventListener('mouseup', () => {
            this.recordMouseEvent('mouseup')
            this.removeMouseEvent('mousedown')
        }, {
            signal: this.controller.signal
        })

        this.canvas.addEventListener('mousemove', (e) => {
            this.removeMouseEvent('mousedown')
            this.removeMouseEvent('mouseup')
            this.mousePosition = { x: e.clientX, y: e.clientY }
        }, {
            signal: this.controller.signal
        })
    }

    getMousePosition() {
        return this.mousePosition
    }

    public getCurrentActions(): string[] {
        return Array.from(this.actions.entries())
            .filter(([, value]) => value === true)
            .map(([key]) => key);
    }

    public isKeyPressed(key: string): boolean {
        return this.actions.get(key) === true;
    }

    public recordMouseEvent(eventName: string,) {
        this.actions.set(eventName, true)
    }

    public removeMouseEvent(eventName: string) {
        this.actions.delete(eventName)
    }

    update() { }
    draw() { }

    destroy() {
        this.controller.abort()
    }
}
