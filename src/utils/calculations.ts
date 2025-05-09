import { Entity } from "@/lib/ecs/entities/Entity"
import { getPositionWithinElement } from "./positions";

export const getEntityAtPosition = (entities: Entity[], x: number, y: number): Entity | null => {

    for (const entity of entities) {
        const positionComponent = entity.getComponent('position');
        const typeComponent = entity.getComponent('type');
        if (!positionComponent || !typeComponent) continue;

        const { x1, y1, x2, y2 } = positionComponent.position;
        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);



        const interactionPoint = getPositionWithinElement(x, y, entity.element)
        if (!interactionPoint) continue;

        switch (typeComponent.type) {
            case 'POINTER':
                if (interactionPoint) {
                    const validPointerInteraction = ['start', 'end', 'inside', 'line_middle'].includes(interactionPoint)
                    return validPointerInteraction ? entity : null
                }
                break;

            default:
                return entity
        }

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {

        }
    }
    return null;
}


export const isPointInSelectionArea = (entities: Entity[], x: number, y: number, padding = 10): boolean => {
    if (entities.length === 0) return false;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Calculate bounding box for all entities
    for (const entity of entities) {
        const positionC = entity.getComponent('position');
        if (!positionC) continue;

        const { x1, y1, x2, y2 } = positionC.position;

        minX = Math.min(minX, Math.min(x1, x2));
        minY = Math.min(minY, Math.min(y1, y2));
        maxX = Math.max(maxX, Math.max(x1, x2));
        maxY = Math.max(maxY, Math.max(y1, y2));
    }

    // Add padding
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Check if point is inside the padded bounding box
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
}