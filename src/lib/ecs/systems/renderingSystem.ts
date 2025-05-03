import { MousePosition, System } from "@/types/engine";
import { Engine } from "..";
import { Tool } from "@/types/elements";
import { PositionComponent } from "../components/PositionComponent";
import { StyleComponent } from "../components/StyleComponent";

export class RenderingSystem implements System {
    engine: Engine
    private dpr = window.devicePixelRatio || 1;
    constructor(engine: Engine) {
        this.engine = engine
    }

    update() { }

    draw() {
        const input = this.engine.getSystem('InputSystem')
        const state = this.engine.getState()
        const canvas = this.engine.canvas
        const { x, y, zoom } = this.engine.camera

        canvas.width = canvas.clientWidth * this.dpr;
        canvas.height = canvas.clientHeight * this.dpr;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "red";
        ctx.scale(this.dpr * zoom, this.dpr * zoom)
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.translate(-x, -y)

        
        // Query all entities with a position component
        for (const entity of this.engine.entities.values()) {
            
            const position = entity.getComponent<PositionComponent>('position');
            const style = entity.getComponent<StyleComponent>('style')
            
            if (position) {

                ctx.fillStyle = style?.color || 'red'
                const { x1, y1, x2, y2 } = position.position;
                const width = x2 - x1;
                const height = y2 - y1;
                ctx.fillRect(x1, y1, width, height);
            }
        }
        this.drawIntentElement(input?.getScreenMousePosition(), state.tool, ctx)
        ctx.restore()
    }

    drawIntentElement(mousePos: MousePosition | undefined, tool: Tool, ctx: CanvasRenderingContext2D) {
        if (!mousePos || tool === 'SELECT') return
        const x1 = mousePos.x
        const y1 = mousePos.y
        const width = 100
        const height = 100

        ctx.strokeRect(x1 - (width / 2), y1 - (height / 2), width, height)
    }

    destroy() { }

}