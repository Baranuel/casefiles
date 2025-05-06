    import { MousePosition, System } from "@/types/engine";
    import { Engine } from "..";
    import { Tool } from "@/types/elements";

    export class RenderingSystem implements System {
        engine: Engine
        private dpr = window.devicePixelRatio || 1;
        constructor(engine: Engine) {
            this.engine = engine
        }

        update() {

            const { hoveredEntity } = this.engine.getSystem('SelectionSystem')!

            if (this.engine.userAction === 'moving') {
                return this.engine.canvas.style.cursor = 'grabbing'

            }
            if (this.engine.userAction === 'resizing') {
                return this.engine.canvas.style.cursor = 'crosshair'
            }

            if (hoveredEntity) {
                return this.engine.canvas.style.cursor = 'pointer'
            }

            if (this.engine.userAction === 'idle') {
                this.engine.canvas.style.cursor = 'default'
            }
        }


        draw() {
            const input = this.engine.getSystem('InputSystem')
            const state = this.engine.getState()
            const canvas = this.engine.canvas
            const { x, y, zoom } = this.engine.camera

            canvas.width = canvas.clientWidth * this.dpr;
            canvas.height = canvas.clientHeight * this.dpr;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.scale(this.dpr * zoom, this.dpr * zoom)
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.translate(-x, -y)

            for (const entity of this.engine.entities.values()) {

                const position = entity.getComponent('position');
                const style = entity.getComponent('style')
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