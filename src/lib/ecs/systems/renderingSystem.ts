import { Layer, MousePosition, System } from "@/types/engine";
import { Engine } from "..";
import { Tool } from "@/types/elements";
import { Entity } from "../entities/Entity";

export class RenderingSystem implements System {
    engine: Engine
    private dpr = window.devicePixelRatio || 1;

    private layerMap: Record<string, Layer> = {
        PERSON: Layer.PERSON,
        LOCATION: Layer.LOCATION,
        ITEM: Layer.ITEM,
        POINTER: Layer.POINTER,
    }
    constructor(engine: Engine) {
        this.engine = engine
    }

    update() {

        const { hoveredEntity } = this.engine.getSystem('SelectionSystem')!

        if (this.engine.userAction === 'moving') {
            return this.engine.canvas.style.cursor = 'grabbing'

        }
        if (this.engine.userAction === 'resizing') {
            return this.engine.canvas.style.cursor = 'crosshair'
        }

        if (hoveredEntity) {
            return this.engine.canvas.style.cursor = 'pointer'
        }

        if (this.engine.userAction === 'idle') {
            this.engine.canvas.style.cursor = 'default'
        }
    }


    draw() {
        const { selectedEntity } = this.engine.getSystem('SelectionSystem')!
        const selectedEntityTypeC = selectedEntity?.getComponent('type')
        const input = this.engine.getSystem('InputSystem')
        const state = this.engine.getState()
        const canvas = this.engine.canvas
        const { x, y, zoom } = this.engine.camera

        canvas.width = canvas.clientWidth * this.dpr;
        canvas.height = canvas.clientHeight * this.dpr;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.scale(this.dpr * zoom, this.dpr * zoom)
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.translate(-x, -y)

        const drawables = this.engine
            .getEntitiesWithComponents("position", "type")

        // sort by our layer map
        drawables.sort((a, b) => {
            const layerA = this.layerMap[a.getComponent("type")!.type]
            const layerB = this.layerMap[b.getComponent("type")!.type]
            return layerA - layerB
        })

        for (const entity of drawables) {
            const typeC = entity.getComponent('type')
            const positionC = entity.getComponent('position')
            const nodeC = entity.getComponent('node')

            if (nodeC && positionC) {
                const shouldRenderNodeArea = this.engine.userAction === 'resizing' || this.engine.userAction === 'moving' && selectedEntityTypeC?.type === 'POINTER'
                if (shouldRenderNodeArea) {
                    const { x1, y1, x2, y2 } = positionC.position;
                    const width = x2 - x1;
                    const height = y2 - y1;

                    ctx.save();
                    ctx.globalAlpha = 0.18;
                    ctx.fillStyle = "#2196F3"; // Material blue
                    const padding = nodeC.areaPadding;

                    ctx.fillRect(
                        x1 - padding,
                        y1 - padding,
                        width + 2 * padding,
                        height + 2 * padding
                    );
                    ctx.restore();
                }
            }

            if (typeC) {
                const { type } = typeC

                switch (type) {
                    case 'POINTER':
                        this.renderArrow(ctx, entity)
                        break
                    case 'PERSON':
                        this.renderPerson(ctx, entity)
                        break
                    case 'LOCATION':
                        break
                }
            }


        }
        this.drawIntentElement(input?.getScreenMousePosition(), state.tool, ctx)
        ctx.restore()
    }

    drawIntentElement(mousePos: MousePosition | undefined, tool: Tool, ctx: CanvasRenderingContext2D) {
        if (!mousePos || tool === 'SELECT') return
        const x1 = mousePos.x
        const y1 = mousePos.y
        const width = 100
        const height = 100

        ctx.strokeRect(x1 - (width / 2), y1 - (height / 2), width, height)
    }

    private renderPerson(ctx: CanvasRenderingContext2D, entity: Entity) {
        const positionComponent = entity.getComponent('position')

        if (!positionComponent) return

        const { x1, y1, x2, y2 } = positionComponent.position;
        const width = x2 - x1;
        const height = y2 - y1;


        ctx.fillStyle = 'red'
        ctx.fillRect(x1, y1, width, height);
    }

    private renderArrow(
        ctx: CanvasRenderingContext2D,
        entity: Entity
    ) {

        const positionComponent = entity.getComponent('position')

        if (!positionComponent) return

        const { x1, y1, x2, y2 } = positionComponent.position;

        // Arrowhead dimensions
        const arrowLength = 20;

        // Calculate angle and element length
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const elementLength = Math.hypot(x2 - x1, y2 - y1);

        // Use a more pleasant yellow (e.g., goldenrod)
        const arrowColor = "#FFC940"; // Soft golden yellow

        // Calculate the point where the line should end (base of the arrowhead)
        const lineEndX = x2 - arrowLength * Math.cos(angle);
        const lineEndY = y2 - arrowLength * Math.sin(angle);

        // Draw dashed line (ending at the base of the arrowhead if long enough, otherwise to x2/y2)
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = arrowColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        if (elementLength >= 5) {
            ctx.lineTo(lineEndX, lineEndY);
        } else {
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Draw wider arrowhead at the tip (x2, y2) only if long enough
        if (elementLength >= 10) {
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(
                x2 - arrowLength * Math.cos(angle - Math.PI / 7),
                y2 - arrowLength * Math.sin(angle - Math.PI / 7)
            );
            ctx.lineTo(
                x2 - arrowLength * Math.cos(angle + Math.PI / 7),
                y2 - arrowLength * Math.sin(angle + Math.PI / 7)
            );
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.fillStyle = arrowColor;
            ctx.shadowColor = "#FFD700";
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    destroy() { }

}