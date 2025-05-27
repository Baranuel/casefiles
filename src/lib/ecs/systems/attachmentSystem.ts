import { System } from "@/types/engine";
import { Engine } from "..";
import { ElementPosition } from "@/types/elements";
import { EventSystem } from "./eventSystem";
import { EngineEvents } from "@/types/events";
import { Entity } from "../entities/Entity";

export class AttachmentSystem implements System {
    engine: Engine
    eventSystem: EventSystem | null
    entityToAttach: Entity | null = null

    constructor(engine: Engine) {
        this.engine = engine
        this.eventSystem = this.engine.getSystem('EventSystem') || null

        if (this.eventSystem) {
            this.eventSystem.subscribe('action:move:start', this.onMoveStart)
            this.eventSystem.subscribe('action:resize:start', this.onResizeStart)
            this.eventSystem.subscribe('action:resize:end', this.attachToNode)
            this.eventSystem.subscribe('action:move:end', this.attachToNode)
        }

    }

    stateUpdated () {
        this.initializeAttachments()
    }

    onResizeStart = (data: EngineEvents['action:resize:start']) => {
        const entityToAttach = this.engine.entities.get(data.entityId)
        this.entityToAttach = entityToAttach || null
    }

    onMoveStart = (data: EngineEvents['action:move:start']) => {
        const entityToAttach = this.engine.entities.get(data.entityId)
        this.entityToAttach = entityToAttach || null
    }

    attachToNode = () => {
        console.log('Attaching to node')
        if(!this.entityToAttach) return;
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
        this.entityToAttach = null;
    }




    update() { }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.entityToAttach) return;

        const nodeEntities = this.engine.getEntitiesWithComponents('node')
        const posC = this.entityToAttach.getComponent('position')
        if (!posC) return

        const { x1:pointX1, y1:pointY1, x2:pointX2, y2:pointY2 } = posC.position

        for (const node of nodeEntities) {
            const nodePosC = node.getComponent('position')
            const nodeC = node.getComponent('node')
            if (!nodePosC || !nodeC) continue
            const padding = nodeC.areaPadding
            const nodeRect = nodePosC.position

            const overlapsStart = this.pointOverlapsNode(pointX1, pointY1, nodeRect, padding);
            const overlapsEnd = this.pointOverlapsNode(pointX2, pointY2, nodeRect, padding);

            if (overlapsStart || overlapsEnd) {
                const posC = node.getComponent('position');
                const nodeC = node.getComponent('node');
                if (!posC || !nodeC) continue;

                const { x1, y1, x2, y2 } = posC.position;
                const width = x2 - x1;
                const height = y2 - y1;
                const { areaPadding } = nodeC;

                const renderWidth = width + areaPadding * 2;
                const renderHeight = height + areaPadding * 2;

                const centerX = x1 + width / 2;
                const centerY = y1 + height / 2;

                const startX = centerX - renderWidth / 2;
                const startY = centerY - renderHeight / 2;

                ctx.fillStyle = '#FFC940';
                ctx.globalAlpha = 0.2;
                ctx.fillRect(startX, startY, renderWidth, renderHeight);
            }


        }
    }

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


    private initializeAttachments() {
    const pointerEntities = this.engine.getEntitiesWithComponents('type', 'position')
    const nodeEntities    = this.engine.getEntitiesWithComponents('node')

    for (const pointer of pointerEntities) {
      const posC = pointer.getComponent('position')
      const typeC = pointer.getComponent('type')
      if (!posC || typeC?.type !== 'POINTER') continue
      const { x1, y1, x2, y2 } = posC.position

      for (const node of nodeEntities) {
        const nodePosC = node.getComponent('position')
        const nodeC    = node.getComponent('node')
        if (!nodePosC || !nodeC) continue

        const padding     = nodeC.areaPadding
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
            this.eventSystem.unsubscribe('action:resize:end', this.attachToNode)
            this.eventSystem.unsubscribe('action:resize:start', this.onResizeStart)
            this.eventSystem.unsubscribe('action:move:end', this.attachToNode)
        }
    }
}
