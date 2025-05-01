import { State } from "@/providers/CaseStateProvider";
import { Camera, GetSystem, System, SystemsType } from "@/types/engine";


export class Engine {
    public canvas: HTMLCanvasElement;
    private systems: Map<SystemsType, System> = new Map()
    private deltaTime: number;
    private lastTime: number;
    public camera: Camera;
    private state: State

    constructor(canvas: HTMLCanvasElement, initialState: State) {
        this.canvas = canvas;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.state = initialState
        this.camera = { x: 0, y: 0, zoom: 1 }
    }

    public init() {
        this.animate(0)
    }



    private animate(timestamp: number) {

        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        const engineSystems = Array.from(this.systems.entries())

        // tick systems 
        engineSystems.forEach(([, system]) => system.update(this.deltaTime))
        engineSystems.forEach(([, system]) => system.draw())

        requestAnimationFrame(this.animate.bind(this));
    }

    public addSystem(name: SystemsType, system: System) {
        this.systems.set(name, system)
    }

    public getSystem<K extends SystemsType>(name: K): GetSystem<K> | undefined {
        return this.systems.get(name) as GetSystem<K> | undefined
    }

    public getState(): State {
        return this.state
    }

    public updateEngineState(state: State) {
        this.state = state
    }

    public cleanup() {
        this.systems.forEach(s => s.destroy)
    }


}