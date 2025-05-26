import { System } from "@/types/engine";
import { Engine } from "..";
import { Entity } from "../entities/Entity";
import { ElementPosition } from "@/types/elements";
import { EventSystem } from "./eventSystem";
import { EngineEvents } from "@/types/events";

export class AttachmentSystem implements System {
    engine: Engine
    eventSystem: EventSystem | null
    constructor(engine: Engine) {
        this.engine = engine
        this.eventSystem = this.engine.getSystem('EventSystem') || null

        if (this.eventSystem) {
            this.eventSystem.subscribe('action:resize:end', this.onResizeEnd)
        }

        setTimeout(() => this.initializeAttachments())
    }

    onResizeEnd = (data: EngineEvents['action:resize:end']) => {
        const nodeEntities = this.engine.getEntitiesWithComponents('type', 'position', 'node')
        const pointerEntities = this.engine.getEntitiesWithComponents('type', 'position')

        for (const pointer of pointerEntities) {
            const posC = pointer.getComponent('position')
            const typeC = pointer.getComponent('type')
            if (!posC || typeC?.type !== 'POINTER') continue
            const { x1, y1, x2, y2 } = posC.position

            for (const node of nodeEntities) {
                const nodePosC = node.getComponent('position')
                const nodeC = node.getComponent('node')
                if (!nodePosC || !nodeC) continue

                const padding = nodeC.areaPadding
                const attachedPts = nodeC.attachedPoints

                if (this.pointOverlapsNode(x1, y1, nodePosC.position, padding)) {
                    const rel = this.getRelativePosition(x1, y1, nodePosC.position)
                    attachedPts.set(pointer.id, { overlapsAt: 'start', x: rel.x, y: rel.y })
                }
                else if (this.pointOverlapsNode(x2, y2, nodePosC.position, padding)) {
                    const rel = this.getRelativePosition(x2, y2, nodePosC.position)
                    attachedPts.set(pointer.id, { overlapsAt: 'end', x: rel.x, y: rel.y })
                }
                else {
                    attachedPts.delete(pointer.id)
                }
            }
        }
        console.log('AttachmentSystem: onResizeEnd', nodeEntities)
    }

    onResizeEnded = (e: CustomEvent) => {
        const resizedEntity = e.detail.resizedEntity as Entity
        const resizedPos = resizedEntity.getComponent('position')
        if (!resizedPos) return

        const { x1, x2, y1, y2 } = resizedPos.position
        const nodeEntities = this.engine.getEntitiesWithComponents('node')

        for (const node of nodeEntities) {
            const nodePosC = node.getComponent('position')
            const nodeC = node.getComponent('node')
            if (!nodePosC || !nodeC) continue

            const nodePos = nodePosC.position
            const nodeAreaPadding = nodeC.areaPadding
            const attachedPoints = nodeC.attachedPoints

            if (this.pointOverlapsNode(x1, y1, nodePos, nodeAreaPadding)) {
                const rel = this.getRelativePosition(x1, y1, nodePos)
                attachedPoints.set(resizedEntity.id, {
                    overlapsAt: 'start' as const,
                    x: rel.x,
                    y: rel.y
                })
                continue
            }

            if (this.pointOverlapsNode(x2, y2, nodePos, nodeAreaPadding)) {
                const rel = this.getRelativePosition(x2, y2, nodePos)
                attachedPoints.set(resizedEntity.id, {
                    overlapsAt: 'end' as const,
                    x: rel.x,
                    y: rel.y
                })
                continue
            }

            attachedPoints.delete(resizedEntity.id)
        }
    }

    update() {
        const selectedEntity = this.engine.getSystem('SelectionSystem')!.selectedEntity
        const selectedEntityTypeC = selectedEntity?.getComponent('type')
        if (!selectedEntity || !selectedEntityTypeC) return

        if (this.engine.userAction !== 'moving' || selectedEntityTypeC.type === 'POINTER') return

        const nodeEntities = this.engine.getEntitiesWithComponents('node')

        for (const node of nodeEntities) {
            const nodePosC = node.getComponent("position");
            const nodeC = node.getComponent("node");
            if (!nodePosC || !nodeC?.attachedPoints) continue;

            const rect = nodePosC.position;
            const attachedPoints = nodeC.attachedPoints

            for (const [arrowId, data] of attachedPoints.entries()) {
                const arrow = this.engine.entities.get(arrowId);
                const posC = arrow?.getComponent("position");
                if (!posC) continue;

                const p = posC.position

                // simply reapply the stored offset
                if (data.overlapsAt === "start") {
                    p.x1 = rect.x1 + data.x
                    p.y1 = rect.y1 + data.y
                } else {
                    p.x2 = rect.x1 + data.x
                    p.y2 = rect.y1 + data.y
                }
            }
        }
    }

    draw() { }

    private pointOverlapsNode(
        px: number,
        py: number,
        nodeRect: ElementPosition,
        padding: number
    ): boolean {
        const left = Math.min(nodeRect.x1, nodeRect.x2) - padding;
        const right = Math.max(nodeRect.x1, nodeRect.x2) + padding;
        const top = Math.min(nodeRect.y1, nodeRect.y2) - padding;
        const bottom = Math.max(nodeRect.y1, nodeRect.y2) + padding;

        return px >= left && px <= right && py >= top && py <= bottom;
    }

    private getRelativePosition(
        px: number,
        py: number,
        nodePos: ElementPosition
    ) {
        return {
            x: px - nodePos.x1,
            y: py - nodePos.y1,
        };
    }

    /** iterate all pointers and try to attach their ends to any overlapping node */
    private initializeAttachments() {
        const pointerEntities = this.engine.getEntitiesWithComponents('type', 'position')
        const nodeEntities = this.engine.getEntitiesWithComponents('node')

        for (const pointer of pointerEntities) {
            const posC = pointer.getComponent('position')
            const typeC = pointer.getComponent('type')
            if (!posC || typeC?.type !== 'POINTER') continue
            const { x1, y1, x2, y2 } = posC.position

            for (const node of nodeEntities) {
                const nodePosC = node.getComponent('position')
                const nodeC = node.getComponent('node')
                if (!nodePosC || !nodeC) continue

                const padding = nodeC.areaPadding
                const attachedPts = nodeC.attachedPoints

                // try start
                if (this.pointOverlapsNode(x1, y1, nodePosC.position, padding)) {
                    const rel = this.getRelativePosition(x1, y1, nodePosC.position)
                    attachedPts.set(pointer.id, { overlapsAt: 'start', x: rel.x, y: rel.y })
                }
                // try end
                else if (this.pointOverlapsNode(x2, y2, nodePosC.position, padding)) {
                    const rel = this.getRelativePosition(x2, y2, nodePosC.position)
                    attachedPts.set(pointer.id, { overlapsAt: 'end', x: rel.x, y: rel.y })
                }
                else {
                    attachedPts.delete(pointer.id)
                }
                console.log(attachedPts)
            }
        }

    }

    destroy() {
        if (this.eventSystem) {
            this.eventSystem.unsubscribe('action:resize:end', this.onResizeEnd)
        }
    }
}
