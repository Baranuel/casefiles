import { System } from "@/types/engine";
import { Engine } from "..";

export class ResizeSystem implements System {
    engine: Engine;
    controller: AbortController;
    isResizing: boolean = false

    constructor(engine: Engine) {
        this.engine = engine;
        this.controller = new AbortController();
        this.engine.canvas.addEventListener('mouseup', this.onMouseUp, { signal: this.controller.signal })

    }
    
    private onMouseUp = () => {
        const selectedEntity = this.engine.getSystem('SelectionSystem')?.selectedEntity
        if (!selectedEntity) return
        
        if (this.isResizing) {
            this.engine.getState().updateElement(selectedEntity.element)
            const resizeEnded = new CustomEvent('resizeended', {
                detail: { resizedEntity:selectedEntity },
                bubbles: true,    
                cancelable: false,
                composed: false   
              });
        
            this.engine.canvas.dispatchEvent(resizeEnded)
        }
        

        this.isResizing = false
    }

    update() {
        if (this.engine.userAction !== "resizing") return;

        const selectionSystem = this.engine.getSystem("SelectionSystem");
        const selectedEntity = selectionSystem?.selectedEntity;
        const handle = selectionSystem?.interactionPoint

        if (!selectedEntity || !selectedEntity.hasComponent('resizable')) return;

        const positionComponent = selectedEntity.getComponent("position");
        if (!positionComponent) return;

        const { x, y } = this.engine.getSystem("InputSystem")!.getWorldMousePosition();
        this.isResizing = true

        if (handle === "end") {
            if (positionComponent.position.x2 !== x || positionComponent.position.y2 !== y) {
                positionComponent.position.x2 = x;
                positionComponent.position.y2 = y;
            }
        } else if (handle === "start") {
            if (positionComponent.position.x1 !== x || positionComponent.position.y1 !== y) {
                positionComponent.position.x1 = x;
                positionComponent.position.y1 = y;
            }
        }
    }

    draw() {
    }

    destroy() {
        this.controller.abort();
    }
}