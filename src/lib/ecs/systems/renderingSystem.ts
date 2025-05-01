import { System } from "@/types/engine";
import { Engine } from "..";

export class RenderingSystem implements System {
    engine: Engine
    private dpr = window.devicePixelRatio || 1;
    constructor(engine: Engine) {
        this.engine = engine
    }

    update() { }

    draw() {
        const elements = this.engine.getState().elements
        const canvas = this.engine.canvas

        canvas.width = canvas.clientWidth * this.dpr;
        canvas.height = canvas.clientHeight * this.dpr;


        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        ctx.fillStyle = "red";
        ctx.save();
        ctx.scale(this.dpr, this.dpr)
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        elements.forEach(el => {
            const x1 = el.x
            const y1 = el.y
            const width = 100
            const height = 100
            ctx.fillRect(x1 - (width/2), y1 - (height/2), width, height)
        })
        ctx.restore()
    }

    destroy() { }

}