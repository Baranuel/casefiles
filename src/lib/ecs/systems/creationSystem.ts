import { System } from "@/types/engine";
import { Engine } from "..";
import { EventSystem } from "./eventSystem";
import { ElementDto } from "@/types/elements";
import { EngineEvents } from "@/types/events";
import { ELEMENT_CONFIGURATION } from "../configurations";

export class CreationSystem implements System {
    engine: Engine
    eventSystem: EventSystem | undefined

    constructor(engine: Engine) {
        this.engine = engine
        this.eventSystem = this.engine.getSystem('EventSystem')
        if (this.eventSystem) {
            this.eventSystem.subscribe('action:create', this.onCreate)
        }
    }

    onCreate = (data: EngineEvents['action:create']) => {
        const { x, y, tool } = data

        const { addElement } = this.engine.getState()
        const id = crypto.randomUUID()

        switch (tool) {
            case 'PERSON':
                this.createPerson({ x, y, id, addElement })
                break
            case 'LOCATION':
                this.createLocation({ x, y, id, addElement })
                break
            case 'ITEM': 
                this.createItem({ x, y, id, addElement })
                break
            case 'NOTE':
                this.createNote({ x, y, id, addElement })
                break
            case 'POINTER':
                this.createPointer({ x, y, id, addElement })
                break
        }
    }

    private createPerson({ x, y, id, addElement }: { x: number, y: number, id: string, addElement: (element: ElementDto) => void }) {
        const { width, height } = ELEMENT_CONFIGURATION['PERSON']
        const x1 = x - width / 2;
        const y1 = y - height / 2;
        const x2 = x + width / 2;
        const y2 = y + height / 2;

        const position = { x1, y1, x2, y2 };
        const newElement: ElementDto = {
            id,
            type: 'PERSON',
            position
        };
        addElement(newElement)

    }

    private createPointer({ x, y, id, addElement }: { x: number, y: number, id: string, addElement: (element: ElementDto) => void }) {
        const { width, height } = ELEMENT_CONFIGURATION['POINTER']
        const x1 = x - width / 2;
        const y1 = y - height / 2;
        const x2 = x + width / 2;
        const y2 = y + height / 2;

        const position = { x1, y1, x2, y2 };
        const newElement: ElementDto = {
            id,
            type: 'POINTER',
            position
        };
        addElement(newElement)
        // Weird use-case but helps, we need to wait until the addElement re-renders our canvas entity state and adds the behaviour for the entity with components,
        // then we immediately start drawing action on that element 
        //SetTimeout is a "MacroTask" in the event loop and will be run after the browser empties callstack and paints.
        setTimeout(() => {
            const entity = this.engine.entities.get(id);
            if (entity) {

                this.eventSystem?.emit('selection:cleared', undefined)
                const selectableC = entity.getComponent('selectable')!
                const resizableC = entity.getComponent('resizable')!
                selectableC.selected = true
                resizableC.resizing = true
                resizableC.interactionPoint = 'end'
                this.eventSystem?.emit('action:change', { action: 'resizing' })
            }
        })
    }

    private createLocation({ x, y, id, addElement }: { x: number, y: number, id: string, addElement: (element: ElementDto) => void }) {
        const { width, height } = ELEMENT_CONFIGURATION['LOCATION']
        const x1 = x - width / 2;
        const y1 = y - height / 2;
        const x2 = x + width / 2;
        const y2 = y + height / 2;

        const position = { x1, y1, x2, y2 };
        const newElement: ElementDto = {
            id,
            type: 'LOCATION',
            position
        };
        addElement(newElement)
    }

    private createItem({ x, y, id, addElement }: { x: number, y: number, id: string, addElement: (element: ElementDto) => void }) {
        const { width, height } = ELEMENT_CONFIGURATION['ITEM']
        const x1 = x - width / 2;
        const y1 = y - height / 2;
        const x2 = x + width / 2;
        const y2 = y + height / 2;

        const position = { x1, y1, x2, y2 };
        const newElement: ElementDto = {
            id,
            type: 'ITEM',
            position
        };
        addElement(newElement)
    }

    private createNote({ x, y, id, addElement }: { x: number, y: number, id: string, addElement: (element: ElementDto) => void }) {
        const { width, height } = ELEMENT_CONFIGURATION['NOTE']
        const x1 = x - width / 2;
        const y1 = y - height / 2;
        const x2 = x + width / 2;
        const y2 = y + height / 2;
        const position = { x1, y1, x2, y2 };
        const newElement: ElementDto = {
            id,
            type: 'NOTE',
            position
        };
        addElement(newElement)
    }

    update() {
    }

    draw() { }


    destroy() {
        if (this.eventSystem) {
            this.eventSystem.unsubscribe('action:create', this.onCreate)
        }
    }
}
