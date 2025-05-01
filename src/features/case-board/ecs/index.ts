import { GetSystem, System, SystemsType } from "../interfaces";




export class Engine {

    public canvas: HTMLCanvasElement;
    private deltaTime: number;
    private lastTime: number;
    private dpr = window.devicePixelRatio || 1;
    private state: Record<string, number>[];
    private systems: Map<SystemsType, System> = new Map()

    constructor(canvas: HTMLCanvasElement, state: Record<string, number>[]) {
        this.canvas = canvas;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.state = state
    }

    init() {
        this.animate(0)
    }

    draw() {
        this.canvas.width = this.canvas.clientWidth * this.dpr;
        this.canvas.height = this.canvas.clientHeight * this.dpr;

        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "red";
        ctx.save();


        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.state.map(el => {

            ctx.fillRect(el.x, el.y, 100, 100);
        })
        ctx.restore()
    }

    update() {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        Array.from(this.systems.entries()).forEach(([, system]) => {
            system.update()
        })


    }

    animate(timestamp: number) {

        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update();
        this.draw();

        requestAnimationFrame(this.animate.bind(this));
    }

    addSystem(name: SystemsType, system: System) {
        this.systems.set(name, system)
    }

    getSystem<K extends SystemsType>(name: K): GetSystem<K> | undefined {
        return this.systems.get(name) as GetSystem<K> | undefined
    }

    cleanup() {
        this.systems.forEach(s => s.destroy)
    }


}