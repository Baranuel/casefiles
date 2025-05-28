import { State } from "@/providers/CaseStateProvider";
import { Camera, ComponentsType, GetSystem, System, SystemsType } from "@/types/engine";
import { Entity } from "./entities/Entity";
import { PositionComponent } from "./components/PositionComponent";
import { StyleComponent } from "./components/StyleComponent";
import { TypeComponent } from "./components/TypeComponent";
import { MovableComponent } from "./components/MovableComponent";
// import { ResizableComponent } from "./components/ResizableComponent";
import { SelectableComponent } from "./components/SelectableComponent";
import { ResizableComponent } from "./components/ResizableComponent";
import { NodeComponent } from "./components/NodeComponent";
// import { NodeComponent } from "./components/NodeComponent";


export class Engine {
    public canvas: HTMLCanvasElement;
    public camera: Camera;
    public entities: Map<string, Entity> = new Map();
    public userAction: 'idle' | 'moving' | 'resizing' | 'panning' = 'idle'
    private dpr = window.devicePixelRatio || 1;
    private systems: Map<SystemsType, System> = new Map()
    private deltaTime: number;
    private lastTime: number;
    private state: State


    constructor(canvas: HTMLCanvasElement, initialState: State) {
        this.canvas = canvas;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.state = initialState
        this.camera = { x: 0, y: 0, zoom: 1 }

        this.updateEngineState(initialState)
    }

    public init() {
        this.animate(0)
    }



    private animate(timestamp: number) {
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        const engineSystems = Array.from(this.systems.entries())
        const ctx = this.prepareContext(this.canvas);
        if (!ctx) return;

        engineSystems.forEach(([, system]) => system.update(this.deltaTime))
        engineSystems.forEach(([, system]) => system.draw(ctx))
        requestAnimationFrame(this.animate.bind(this));
    }

    public addSystem(name: SystemsType, system: System) {
        this.systems.set(name, system)
        system.init?.()
    }

    public getSystem<K extends SystemsType>(name: K): GetSystem<K> | undefined {
        return this.systems.get(name) as GetSystem<K> | undefined
    }

    public getState(): State {
        return this.state
    }

    public updateEngineState(newState: State) {
        this.state = newState;

        const newIds = new Set(newState.elements.map(e => e.id));
        const oldIds = new Set(this.entities.keys());

        for (const id of oldIds) {
            if (!newIds.has(id)) this.entities.delete(id);
        }


        for (const element of newState.elements) {
            const { id } = element;

            if (this.entities.has(id)) {
                const entity = this.entities.get(id)!;
                entity.element = element;
                entity.getComponent('position')!.position = element.position
            } else {
                const entity = new Entity(id, element);
                this.entities.set(id, entity);

                entity.addComponent(
                    'position',
                    new PositionComponent(entity, element.position)
                );
                switch (element.type) {
                    case 'PERSON':
                        entity.addComponent('type', new TypeComponent(entity, 'PERSON'));
                        entity.addComponent('style', new StyleComponent(entity, 'green'));
                        entity.addComponent('movable', new MovableComponent(entity));
                        entity.addComponent('selectable', new SelectableComponent(entity));
                        entity.addComponent('node', new NodeComponent(entity));
                        break;
                    case 'LOCATION':
                        entity.addComponent('type', new TypeComponent(entity, 'LOCATION'));
                        entity.addComponent('style', new StyleComponent(entity, 'blue'));
                        entity.addComponent('movable', new MovableComponent(entity));
                        entity.addComponent('selectable', new SelectableComponent(entity));
                        entity.addComponent('node', new NodeComponent(entity));
                        break;
                    case 'NOTE':
                        entity.addComponent('type', new TypeComponent(entity, 'NOTE'));
                        entity.addComponent('style', new StyleComponent(entity, 'blue'));
                        entity.addComponent('movable', new MovableComponent(entity));
                        entity.addComponent('selectable', new SelectableComponent(entity));
                        break;
                    case 'POINTER':
                        entity.addComponent('type', new TypeComponent(entity, 'POINTER'));
                        entity.addComponent('movable', new MovableComponent(entity));
                        entity.addComponent('selectable', new SelectableComponent(entity));
                        entity.addComponent('resizable', new ResizableComponent(entity));
                    default:
                        break;
                }
            }
        }

        const engineSystems = Array.from(this.systems.entries())
        engineSystems.forEach(([, system]) => {
            if (system.stateUpdated) {
                system.stateUpdated(this.state)
            }
        }
        )

    }
    public addEntity(entity: Entity) {
        this.entities.set(entity.id, entity)
    }
    public cleanup() {
        this.systems.forEach(s => s.destroy())
    }
    public getEntitiesWithComponents<
        K extends readonly ComponentsType[]
    >(
        ...componentKeys: K
    ): Entity[] {
        const result = Array.from(this.entities.values()).filter((entity) =>
            componentKeys.every((key) => entity.hasComponent(key))
        )
        return result
    }

    private prepareContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
        const { x, y, zoom } = this.camera;
        canvas.width = canvas.clientWidth * this.dpr;
        canvas.height = canvas.clientHeight * this.dpr;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.scale(this.dpr * zoom, this.dpr * zoom);
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(-x, -y);
        return ctx;
    }


}