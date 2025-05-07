import { System } from "@/types/engine";
import { Engine } from "..";

export class MovingSystem implements System {
    engine: Engine
    controller: AbortController
    isMovingElement: boolean = false

    constructor(engine: Engine) {
        this.engine = engine
        this.controller = new AbortController()
        this.engine.canvas.addEventListener('mouseup', this.onMouseUp, { signal: this.controller.signal })
    }


    onMouseUp = () => {
        const selectedEntity = this.engine.getSystem('SelectionSystem')?.selectedEntity
        if (!selectedEntity) return

        if (this.isMovingElement) {
            this.engine.getState().updateElement(selectedEntity.element)

            const moveEnded = new CustomEvent('moveended', {
                detail: { resizedEntity:selectedEntity },
                bubbles: true,    
                cancelable: false,
                composed: false   
              });
        
            this.engine.canvas.dispatchEvent(moveEnded)
        }
        this.isMovingElement = false
    }

    update() {
        if (this.engine.userAction !== 'moving') return
        const selectionSystem = this.engine.getSystem('SelectionSystem')

        if (!selectionSystem) return
        const { selectedEntity, grabElementMouseOffset } = selectionSystem

        if (!selectedEntity) return

        const movableComponent = selectedEntity.getComponent('movable')
        const positionComponent = selectedEntity.getComponent('position')
        const typeComponent = selectedEntity.getComponent('type')
        
        if (!movableComponent || !positionComponent || !typeComponent) return

        if(typeComponent.type === 'POINTER'){
            // add move logic for pointer so we only it if we click on the line
        }

        this.isMovingElement = true

        const { position } = positionComponent
        const { x, y } = this.engine.getSystem('InputSystem')!.getWorldMousePosition()

        const width = position.x2 - position.x1;
        const height = position.y2 - position.y1;

        const offset = grabElementMouseOffset ?? { x: width / 2, y: height / 2 };

        position.x1 = x - offset.x;
        position.y1 = y - offset.y;
        position.x2 = position.x1 + width;
        position.y2 = position.y1 + height;



    }
    draw() { }

    destroy() {
        this.controller.abort()
    }
}