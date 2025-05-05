import { System } from "@/types/engine";
import { Engine } from "..";
import { PositionComponent } from "../components/PositionComponent";
import { TypeComponent } from "../components/TypeComponent";

export class ResizeSystem implements System {
    engine: Engine;
    controller: AbortController;

    constructor(engine: Engine) {
        this.engine = engine;
        this.controller = new AbortController();
    }

    update() {
        if (this.engine.userIntent !== "resize") return;

        const selectionSystem = this.engine.getSystem("SelectionSystem");
        const selectedEntity = selectionSystem?.selectedEntity;
        const handle = selectionSystem?.interactionPoint 

        if (!selectedEntity) return;

        const typeComponent = selectedEntity.getComponent<TypeComponent>("type");
        if (!typeComponent || typeComponent.type !== "POINTER") return;

        const positionComponent = selectedEntity.getComponent<PositionComponent>("position");
        if (!positionComponent) return;

        const { x, y } = this.engine.getSystem("InputSystem")!.getWorldMousePosition();

        // Use the handle from selectionSystem
        if (handle === "end") {
            positionComponent.position.x2 = x;
            positionComponent.position.y2 = y;
        } else if (handle === "start") {
            positionComponent.position.x1 = x;
            positionComponent.position.y1 = y;
        }
    }

    draw() {
        // Optionally, draw resize handles or highlight the arrow being resized
    }

    destroy() {
        this.controller.abort();
    }
}