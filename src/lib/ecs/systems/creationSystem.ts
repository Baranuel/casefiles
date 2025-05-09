import { System } from "@/types/engine";
import { Engine } from "..";
import { InputSystem } from "./inputSystem";
import { EventSystem } from "./eventSystem";
import { ElementDto } from "@/types/elements";

export class CreationSystem implements System {
    engine: Engine
    inputSystem: InputSystem | undefined
    eventSystem: EventSystem | undefined
    controller: AbortController;

    constructor(engine: Engine) {
        this.engine = engine
        this.controller = new AbortController()
        this.inputSystem = this.engine.getSystem('InputSystem')
        this.eventSystem = this.engine.getSystem('EventSystem')
        this.engine.canvas.addEventListener('mousedown', this.onMouseDown, { signal: this.controller.signal })
    }

    onMouseDown = () => {
        const { tool, addElement } = this.engine.getState()
        const inputSystem = this.engine.getSystem('InputSystem')

        if (tool === 'SELECT' || !inputSystem) return

        const { x, y } = inputSystem.getWorldMousePosition()
        const id = crypto.randomUUID()

        switch (tool) {
            case 'PERSON':
                this.createPerson({ x, y, id, addElement })
                break
            case 'POINTER':
                this.createPointer({ x, y, id, addElement })
                break
        }

    }

    private createPerson({ x, y, id, addElement }: { x: number, y: number, id: string, addElement: (element: ElementDto) => void }) {

        const width = 200;
        const height = 300;
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

        const width = 20;
        const height = 1;
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

    update() {
    }

    draw() { }


    destroy() {
        this.controller.abort()
    }
}
