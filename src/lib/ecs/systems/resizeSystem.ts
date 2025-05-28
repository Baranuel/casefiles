import { System } from "@/types/engine";
import { Engine } from "..";
import { EventSystem } from "./eventSystem";
import { resizedCoordinates } from "@/utils/positions";
import { EngineEvents } from "@/types/events";

export class ResizeSystem implements System {
    engine: Engine;
    eventSystem: EventSystem | null = null;

    constructor(engine: Engine) {
        this.engine = engine;
        this.eventSystem = this.engine.getSystem('EventSystem') as EventSystem;

        if (this.eventSystem) {
            this.eventSystem.subscribe('action:resize:start', this.onResizeStart);
            this.eventSystem.subscribe('action:resize', this.onResize);
            this.eventSystem.subscribe('action:resize:end', this.onResizeEnd);
        }
    }

    private onResizeStart = (data: EngineEvents['action:resize:start']) => {
        const resizableElements = this.engine.getEntitiesWithComponents('resizable', 'selectable').filter(e => e.getComponent('selectable')!.selected)
        if (resizableElements.length !== 1) return

        const [entityToResize] = resizableElements
        const resizableC = entityToResize.getComponent('resizable')
        if (!resizableC) return

        resizableC.resizing = true
        resizableC.interactionPoint = data.interactionPoint

    }
    private onResize = (data: EngineEvents['action:resize']) => {
        const resizableElements = this.engine.getEntitiesWithComponents('resizable', 'selectable', 'position').filter(e => e.getComponent('selectable')!.selected)
        if (resizableElements.length !== 1) return
        const [entityToResize] = resizableElements

        const posC = entityToResize.getComponent('position')!;
        const resizableC = entityToResize.getComponent('resizable')!;
        if (!resizableC.resizing || !resizableC.interactionPoint) return;

        const { x, y } = data
        const ip = resizableC.interactionPoint

        const coordinates = resizedCoordinates(x, y, ip, posC.position)
        if (!coordinates) return
        posC.position.x1 = coordinates.x1
        posC.position.x2 = coordinates.x2
        posC.position.y1 = coordinates.y1
        posC.position.y2 = coordinates.y2



    }
    private onResizeEnd = () => {
        const resizedEntities = this.engine.getEntitiesWithComponents('resizable').filter(entity => entity.getComponent('resizable')!.resizing);
        for (const entity of resizedEntities) {
            const resizableC = entity.getComponent('resizable')!;
            resizableC.resizing = false
            this.engine.getState().updateElement(entity.element);
        }
    }

    update() { }

    draw() {
    }

    destroy() {
        this.eventSystem?.unsubscribe('action:resize:start', this.onResizeStart);
        this.eventSystem?.unsubscribe('action:resize', this.onResize);
        this.eventSystem?.unsubscribe('action:resize:end', this.onResizeEnd);
    }
}