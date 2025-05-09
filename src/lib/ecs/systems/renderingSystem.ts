import { Layer, System } from "@/types/engine";
import { Engine } from "..";
import { Entity } from "../entities/Entity";

export class RenderingSystem implements System {
    engine: Engine;
    private dpr = window.devicePixelRatio || 1;
    private layerMap: Record<string, Layer> = {
        PERSON: Layer.PERSON,
        LOCATION: Layer.LOCATION,
        ITEM: Layer.ITEM,
        POINTER: Layer.POINTER,
    } as const;

    constructor(engine: Engine) {
        this.engine = engine;

    }

    update() { }

    private computeCursor(hovered: Entity | undefined): string {
        const action = this.engine.userAction;
        if (action === 'moving') return 'grabbing';
        if (action === 'resizing') return 'crosshair';
        if (hovered) return 'pointer';
        return 'default';
    }

    draw() {
        const canvas = this.engine.canvas;
        const ctx = this.prepareContext(canvas);
        if (!ctx) return;

        const entities = this.engine.getEntitiesWithComponents('position', 'type');
        entities.sort((a, b) => this.layerMap[a.getComponent('type')!.type] - this.layerMap[b.getComponent('type')!.type]);

        entities.forEach(entity => {
            this.renderEntity(ctx, entity);
            this.renderHoverOutline(ctx, entity);
        });

        const selected = this.engine.getEntitiesWithComponents('selectable', 'position')
            .filter(e => e.getComponent('selectable')!.selected);

        this.renderSelection(ctx, selected);
        this.drawIntent(ctx);

        ctx.restore();
    }

    private prepareContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
        const { x, y, zoom } = this.engine.camera;
        canvas.width = canvas.clientWidth * this.dpr;
        canvas.height = canvas.clientHeight * this.dpr;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.scale(this.dpr * zoom, this.dpr * zoom);
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(-x, -y);
        return ctx;
    }

    private renderEntity(ctx: CanvasRenderingContext2D, entity: Entity) {
        const typeC = entity.getComponent('type');
        if (!typeC) return;
        switch (typeC.type) {
            case 'POINTER':
                this.renderArrow(ctx, entity);
                break;
            case 'PERSON':
                this.renderPerson(ctx, entity);
                break;
            case 'LOCATION':
            case 'ITEM':
            default:
                break;
        }
    }

    private renderHoverOutline(ctx: CanvasRenderingContext2D, entity: Entity) {
        const sel = entity.getComponent('selectable');
        const pos = entity.getComponent('position');
        if (!sel?.hovered || !pos) return;
        this.drawDashedRect(ctx, pos.position, { padding: 10, alpha: 0.4, width: 4, dash: [5, 5] });
    }

    private renderSelection(ctx: CanvasRenderingContext2D, selected: Entity[]) {
        if (selected.length === 0) return;

        if (selected.length === 1) {
            const e = selected[0];
            const pos = e.getComponent('position')!.position;
            const type = e.getComponent('type')!.type;
            if (type === 'POINTER') {
                return
            } else {
                this.drawDashedRect(ctx, pos, { padding: 10, alpha: 1, width: 4, dash: [5, 5] });
            }
        } 
        if( selected.length > 1) {
            const bounds = selected.reduce((b, e) => {
                const p = e.getComponent('position')!.position;
                return {
                    minX: Math.min(b.minX, p.x1, p.x2),
                    minY: Math.min(b.minY, p.y1, p.y2),
                    maxX: Math.max(b.maxX, p.x1, p.x2),
                    maxY: Math.max(b.maxY, p.y1, p.y2),
                };
            }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

            this.drawDashedRect(ctx,
                { x1: bounds.minX, y1: bounds.minY, x2: bounds.maxX, y2: bounds.maxY },
                { padding: 10, alpha: 0.7, width: 4, dash: [5, 3],fill: '#FFC940', fillAlpha: 0.03 }
            );
        }
    }

    private drawIntent(ctx: CanvasRenderingContext2D) {
        const input = this.engine.getSystem('InputSystem');
        const mouse = input?.getWorldMousePosition();
        const tool = this.engine.getState().tool;
        if (!mouse || tool === 'SELECT') return;
        const size = 100;
        ctx.strokeRect(mouse.x - size / 2, mouse.y - size / 2, size, size);
    }

    private drawDashedRect(
        ctx: CanvasRenderingContext2D,
        { x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number },
        { padding, alpha, width, dash, fill, fillAlpha }: { padding: number; alpha: number; width: number; dash: number[]; fill?: string; fillAlpha?: number }
    ) {
        const x = x1 - padding;
        const y = y1 - padding;
        const w = x2 - x1 + 2 * padding;
        const h = y2 - y1 + 2 * padding;
    
        ctx.save();
        ctx.setLineDash(dash);
    
        if (fill) {
            ctx.globalAlpha = fillAlpha ?? alpha;
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, w, h);
        }
    
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#FFC940';
        ctx.lineWidth = width;
        ctx.strokeRect(x, y, w, h);
    
        ctx.restore();
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
        const posC = entity.getComponent('position');
        if (!posC) return;
        const { x1, y1, x2, y2 } = posC.position;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const angle = Math.atan2(dy, dx);
        const length = Math.hypot(dx, dy);
        const headLen = 20;
        const arrowColor = '#FFC940';

        // Determine opacity based on selection
        const isSelected = entity.getComponent('selectable')?.selected;
        const alpha = isSelected ? 1 : 0.6;

        // Compute base of arrow head
        const bx = x2 - headLen * Math.cos(angle);
        const by = y2 - headLen * Math.sin(angle);

        // Draw shaft
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = arrowColor;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(length >= 5 ? bx : x2, length >= 5 ? by : y2);
        ctx.stroke();
        ctx.restore();

        // Draw head
        if (length >= 10) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = arrowColor;
            ctx.shadowColor = arrowColor;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(
                x2 - headLen * Math.cos(angle - Math.PI / 7),
                y2 - headLen * Math.sin(angle - Math.PI / 7)
            );
            ctx.lineTo(
                x2 - headLen * Math.cos(angle + Math.PI / 7),
                y2 - headLen * Math.sin(angle + Math.PI / 7)
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }


    destroy() { }

}
