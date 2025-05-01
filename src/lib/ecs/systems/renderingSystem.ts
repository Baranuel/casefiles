    import { System } from "@/types/engine";
    import { Engine } from "..";
    import { Position, Tool } from "@/providers/CaseStateProvider";

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
            const elements = this.engine.getState().elements
            const canvas = this.engine.canvas
            const {x,y, zoom} = this.engine.camera

            canvas.width = canvas.clientWidth * this.dpr;
            canvas.height = canvas.clientHeight * this.dpr;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.fillStyle = "red";
            ctx.scale(this.dpr, this.dpr)
            ctx.scale(zoom,zoom)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.save();
            ctx.translate(-x,-y)

            elements.forEach(el => {
                const x1 = el.x
                const y1 = el.y
                const width = 100
                const height = 100
                ctx.fillRect(x1 - (width / 2), y1 - (height / 2), width, height)
            })

            this.drawIntentElement(input?.getScreenMousePosition(), state.tool, ctx)
            ctx.restore()
        }

        drawIntentElement(mousePos: Position | undefined, tool: Tool, ctx: CanvasRenderingContext2D) {
            if (!mousePos || tool === 'select') return
            const x1 = mousePos.x
            const y1 = mousePos.y
            const width = 100
            const height = 100

            ctx.strokeRect(x1 - (width / 2), y1 - (height / 2), width, height)
        }

        destroy() { }

    }