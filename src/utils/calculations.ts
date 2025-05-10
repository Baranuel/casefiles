import { Entity } from "@/lib/ecs/entities/Entity"
import { getPositionWithinElement } from "./positions"
import { Layer } from "@/types/engine"

export const getEntityAtPosition = (entities: Entity[], x: number, y: number): Entity | null => {
    // sort by layer descending so higher-priority types come first
    const sorted = entities
        .slice()
        .filter(e => e.getComponent('position') && e.getComponent('type'))
        .sort((a, b) => {
            const ta = a.getComponent('type')!.type as keyof typeof Layer
            const tb = b.getComponent('type')!.type as keyof typeof Layer
            return Layer[tb] - Layer[ta]
        })

    for (const entity of sorted) {
        const posC = entity.getComponent('position')!
        const typeC = entity.getComponent('type')!
        const { x1, y1, x2, y2 } = posC.position
        const interactionPoint = getPositionWithinElement(x, y, entity.element)
        if (!interactionPoint) continue

        if (typeC.type === 'POINTER') {
            const valid = ['start', 'end', 'inside', 'line_middle'].includes(interactionPoint)
            return valid ? entity : null
        }

        // for non-pointer types, just return the first one whose bbox contains the point
        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2)
        const minY = Math.min(y1, y2), maxY = Math.max(y1, y2)
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            return entity
        }
    }

    return null
}

export const isPointInSelectionArea = (entities: Entity[], x: number, y: number, padding = 10): boolean => {
    if (entities.length <= 1) return false;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

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