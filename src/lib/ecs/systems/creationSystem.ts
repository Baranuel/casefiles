import { System } from "@/types/engine";
import { Engine } from "..";
import { InputSystem } from "./inputSystem";
import { EventSystem } from "./eventSystem";

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
        const selectionSystem = this.engine.getSystem('SelectionSystem')
        const inputSystem = this.engine.getSystem('InputSystem')

        if (tool === 'SELECT' || !selectionSystem || !inputSystem) return
        const { x, y } = inputSystem.getWorldMousePosition()
        const id = crypto.randomUUID()

        // Make this more organized, abstract away the default sizes and styles??
        if (tool === 'PERSON') {
            const width = 200;
            const height = 300;
            const x1 = x - width / 2;
            const y1 = y - height / 2;
            const x2 = x + width / 2;
            const y2 = y + height / 2;

            const position = { x1, y1, x2, y2 };
            const newElement = {
                id,
                type: tool,
                position
            };
            addElement(newElement)
        }

        if (tool === 'POINTER') {
            const width = 5;
            const height = 5;
            const x1 = x - width / 2;
            const y1 = y - height / 2;
            const x2 = x + width / 2;
            const y2 = y + height / 2;

            const position = { x1, y1, x2, y2 };
            const newElement = {
                id,
                type: tool,
                position
            };
            addElement(newElement)
            // Weird use-case but helps, we need to wait until the addElement re-renders our canvas entity state and adds the behaviour for the entity with components,
            // then we immediately start drawing action on that element 
            //SetTimeout is a "MacroTask" in the event loop and will be run after the browser empties callstack and paints.
            setTimeout(() => {
                const entity = this.engine.entities.get(id);
                if (entity) {
                    selectionSystem.setSelectedEntity(entity)
                    selectionSystem.interactionPoint = "end";
                    this.engine.userAction = "resizing";
                }
            })
        }

    }

    update() {
    }

    draw() { }


    destroy() {
        this.controller.abort()
    }
}
