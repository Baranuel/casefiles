import { Layer, System } from "@/types/engine";
import { Engine } from "..";
import { Entity } from "../entities/Entity";
import { EventSystem } from "./eventSystem";
import { EngineEvents } from "@/types/events";
import { PositionWithinElement, Tool } from "@/types/elements";
import { ELEMENT_CONFIGURATION } from "../configurations";
import { State } from "@/providers/CaseStateProvider";


type HoverProperties = {
    interactionPoint?: PositionWithinElement
    entityId?: Entity['id'],
} | null
export class RenderingSystem implements System {
    engine: Engine;
    eventSystem: EventSystem | null = null;
    currentCursor: string | null = null;
    hoverProperties: HoverProperties = null
    hoverEventPrecedence?: boolean = true

    private imageCache: Map<string, HTMLImageElement> = new Map();
    private dpr = window.devicePixelRatio || 1;
    private layerMap: Record<string, Layer> = {
        PERSON: Layer.PERSON,
        LOCATION: Layer.LOCATION,
        ITEM: Layer.ITEM,
        NOTE: Layer.NOTE,
        POINTER: Layer.POINTER,
    } as const;

    constructor(engine: Engine) {
        this.engine = engine;
        this.eventSystem = this.engine.getSystem('EventSystem') || null;

        if (this.eventSystem) {
            this.eventSystem.subscribe('action:pan:start', this.onPanStart);
            this.eventSystem.subscribe('action:change', this.onActionChange);
            this.eventSystem.subscribe('action:hover:end', this.onHoverEnd);
            this.eventSystem.subscribe('action:hover', this.onHover);
        }
    }


    private onPanStart = () => {
        this.currentCursor = 'grabbing'
    }
    private onActionChange = (data: EngineEvents['action:change']) => {
        const { action } = data
        switch (action) {
            case 'panning':
                this.currentCursor = 'grabbing'
                break
            case 'moving':
                this.currentCursor = 'move'
                break
            case 'resizing':
                this.currentCursor = 'grabbing'
                break
            case 'idle':
                this.currentCursor = 'default'
                break
            default:
                this.currentCursor = 'default'
                break
        }
    }


    onHover = (data: EngineEvents['action:hover']) => {
        this.currentCursor = 'pointer'
        const selected = this.engine.getEntitiesWithComponents('selectable', 'position').filter(entity => entity.getComponent('selectable')!.selected);
        if (selected.length !== 1) return

        if (selected[0].id !== data.entityId) return

        if (data.interactionPoint === 'start' || data.interactionPoint === 'end') {
            this.hoverProperties = {
                interactionPoint: data.interactionPoint,
                entityId: data.entityId,
            }
            return this.currentCursor = 'grab'
        }
    };

    onHoverEnd = () => {
        this.eventSystem?.emit('action:change', { action: 'idle' })
        this.hoverProperties = null
    };


    update() { }

    stateUpdated(state: State) {
        const { elements } = state
        const entities = this.engine.entities

        if (!elements || !entities) return

        for (const [, entity] of entities) {
            const typeC = entity.getComponent('type');
            if (!typeC) continue

            if (this.imageCache.has(entity.id)) {
                const image = this.imageCache.get(entity.id);

                if (image && image.src !== entity.element?.content?.image) {
                    image.src = entity.element?.content?.image || ''
                }
                continue
            }

            const image = new Image();
            image.src = entity.element?.content?.image || ''
            this.imageCache.set(entity.id, image)
        }

        if (this.imageCache.has('LOCATION')) return

        const locationImage = new Image();
        locationImage.src = '/location-pin.svg'
        this.imageCache.set('LOCATION', locationImage)


    }



    draw() {
        const canvas = this.engine.canvas;
        const ctx = this.prepareContext(canvas);
        const tool = this.engine.getState().tool;
        if (!ctx) return;

        ctx.canvas.style.cursor = this.currentCursor || 'default';


        const entities = this.engine.getEntitiesWithComponents('position', 'type');
        entities.sort((a, b) => this.layerMap[a.getComponent('type')!.type] - this.layerMap[b.getComponent('type')!.type]);

        entities.forEach(entity => {
            this.renderEntity(ctx, entity);
            this.renderHoverOutline(ctx, entity);
        });

        const selected = this.engine.getEntitiesWithComponents('selectable', 'position')
            .filter(e => e.getComponent('selectable')!.selected);

        this.renderSelection(ctx, selected);
        this.drawIntent(ctx, tool);

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
                this.renderLocation(ctx, entity);
                break;
            case 'NOTE':
                this.renderNote(ctx, entity);
                break;
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
        if (selected.length > 1) {
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
                { padding: 10, alpha: 0.7, width: 4, dash: [5, 3], fill: '#FFC940', fillAlpha: 0.03 }
            );
        }
    }

    private drawIntent(ctx: CanvasRenderingContext2D, tool: Tool) {
        const input = this.engine.getSystem('InputSystem');
        const mouse = input?.getWorldMousePosition();
        if (!mouse || tool === 'SELECT' || tool === 'MOVE') return;

        const { width, height } = ELEMENT_CONFIGURATION[tool]
        ctx.save();
        ctx.fillStyle = '#FFC940';
        ctx.globalAlpha = 0.2;
        ctx.fillRect(mouse.x - width / 2, mouse.y - height / 2, width, height);
        ctx.restore()
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

    private renderLocation(ctx: CanvasRenderingContext2D, entity: Entity) {
        const posC = entity.getComponent('position');
        if (!posC) return;

        const location = entity.element
        if (!location) return;

        const { x1, y1, x2, y2 } = posC.position;
        const width = x2 - x1;
        const height = y2 - y1;
        const IMAGE_RATIO = 0.8;
        const IMAGE_PADDING = 5;
        const PADDING = 5;

        ctx.save();
        ctx.fillStyle = '#F5F7FA';
        ctx.fillRect(x1, y1, width, height);
        ctx.strokeStyle = '#F5F7FA';
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, width, height);
        ctx.restore();
        // inner box, inset for portrait + name
        const innerX = x1 + PADDING;
        const innerY = y1 + PADDING;
        const innerW = width - 2 * PADDING;
        const innerH = height - 2 * PADDING;
        const portraitH = innerH * IMAGE_RATIO;
        const nameH = innerH - portraitH;
        const nameY = innerY + portraitH;

        ctx.save();
        ctx.fillStyle = '#2E3A46';
        ctx.fillRect(x1, y1, width, height);
        ctx.restore();


        ctx.save();
        ctx.fillStyle = 'transparent';
        ctx.fillRect(innerX, innerY, innerW, portraitH);
        ctx.drawImage(this.imageCache.get('LOCATION')!, innerX + IMAGE_PADDING, innerY + IMAGE_PADDING, innerW - IMAGE_PADDING * 2, portraitH - IMAGE_PADDING * 2);
        ctx.restore();

        // 4) name tag area at bottom
        this.drawWrappedTextInBox(
            ctx,
            entity.element.content?.name || 'Unknown',
            innerX,
            nameY,
            innerW,
            nameH, {
            font: 'bold 18px serif',
            fillStyle: '#FFF',
        }
        )
    }

  // Updated renderNote to emulate a sticky note with shadow, slight rotation, and a pin
private renderNote(ctx: CanvasRenderingContext2D, entity: Entity) {
  const posC = entity.getComponent('position');
  if (!posC) return;
  const note = entity.element;
  if (!note) return;

  const { x1, y1, x2, y2 } = posC.position;
  const width = x2 - x1;
  const height = y2 - y1;

  // ---------- Sticky note styling ----------
  const PADDING = 8;
  const SHADOW_COLOR = 'rgba(0, 0, 0, 0.2)';
  const NOTE_COLOR = '#FFFB8F'; // pale yellow sticky note
  const centerX = x1 + width / 2;
  const centerY = y1 + height / 2;

  // Save and apply rotation about center
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.translate(-centerX, -centerY);

  // Drop shadow
  ctx.save();
  ctx.shadowColor = SHADOW_COLOR;
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = NOTE_COLOR;
  ctx.fillRect(x1, y1, width, height);
  ctx.restore();

  // Draw note border
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#E0D600';
  ctx.strokeRect(x1, y1, width, height);
  ctx.restore();

  // Draw pin at top center
  const pinX = centerX;
  const pinY = y1 + 4;
  const PIN_RADIUS = 6;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = '#D32F2F';
  ctx.strokeStyle = '#B71C1C';
  ctx.lineWidth = 1;
  ctx.arc(pinX, pinY, PIN_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // restore unrotated coordinate system

  // Compute inner text box with padding
  const innerX = x1 + PADDING;
  const innerY = y1 + PADDING;
  const innerW = width - 2 * PADDING;
  const innerH = height - 2 * PADDING;

  // Draw wrapped text inside
  this.drawWrappedTextInBox(
    ctx,
    note.content?.text || 'Unknown',
    innerX,
    innerY,
    innerW,
    innerH,
    {
      font: '16px sans-serif',
      fillStyle: '#333',
    }
  );
}



    private renderPerson(ctx: CanvasRenderingContext2D, entity: Entity) {
        const posC = entity.getComponent('position');
        if (!posC) return;

        const person = entity.element
        if (!person) return;

        const { x1, y1, x2, y2 } = posC.position;
        const width = x2 - x1;
        const height = y2 - y1;

        const PORTRAIT_RATIO = 0.8;
        const PADDING = 5;

        const personImage = this.imageCache.get(person.id);
        if (!personImage) return;

        // inner box, inset for portrait + name
        const innerX = x1 + PADDING;
        const innerY = y1 + PADDING;
        const innerW = width - 2 * PADDING;
        const innerH = height - 2 * PADDING;
        const portraitH = innerH * PORTRAIT_RATIO;
        const nameH = innerH - portraitH;
        const nameY = innerY + portraitH;

        ctx.save();
        ctx.fillStyle = '#F8DCB2';
        ctx.fillRect(x1, y1, width, height);
        ctx.restore();


        ctx.save();
        ctx.fillStyle = '#000';
        ctx.fillRect(innerX, innerY, innerW, portraitH);
        ctx.drawImage(personImage, innerX + 2, innerY + 2, innerW - 4, portraitH - 4);
        ctx.restore();

        // 4) name tag area at bottom
        this.drawWrappedTextInBox(
            ctx,
            entity.element.content?.name || 'Unknown',
            innerX,
            nameY,
            innerW,
            nameH
        )
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
        const isHovered = this.hoverProperties?.entityId === entity.id;
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



        // —— Draw interaction handles ——
        if (isSelected || isHovered && isSelected) {
            if (this.engine.getEntitiesWithComponents('selectable', 'position').filter(e => e.getComponent('selectable')!.selected).length > 1) return

            ctx.save();
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#FFFFFF';      // white fill
            ctx.strokeStyle = arrowColor;   // same outline color
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 4;


            this.drawHandle(ctx, this.hoverProperties?.interactionPoint, x1, y1, 'start', entity.id);
            this.drawHandle(ctx, this.hoverProperties?.interactionPoint, x2, y2, 'end', entity.id);

            ctx.restore();
        }
    }

    // utility to draw one handle
    // …existing code…
    private drawHandle = (
        ctx: CanvasRenderingContext2D,
        activeHandle: PositionWithinElement | undefined,
        cx: number,
        cy: number,
        name: 'start' | 'end',
        entityId: Entity['id']
    ) => {
        const isActive = activeHandle === name && this.hoverProperties?.entityId === entityId;
        const baseR = 10;
        const r = baseR

        if (isActive) {
            const glowR = r + 12;
            const glowGrad = ctx.createRadialGradient(
                cx, cy, glowR * 0.5,
                cx, cy, glowR
            );
            glowGrad.addColorStop(0, 'rgba(255, 201, 64, 0.2)');
            glowGrad.addColorStop(1, 'rgba(255, 201, 64, 0)');
            ctx.save();
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const grad = ctx.createRadialGradient(
            cx, cy, r * 0.1,
            cx, cy, r
        );
        if (isActive) {
            grad.addColorStop(0, '#FFF8E1');
            grad.addColorStop(1, '#FFC940');
        } else {
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(1, '#F0F0F0');
        }

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#8B4513';  // saddle‐brown stroke
        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    /**
 * Draw multi-line, ellipsis-truncated text centered inside a rectangular box.
 */
    drawWrappedTextInBox(
        ctx: CanvasRenderingContext2D,
        text: string,
        boxX: number,
        boxY: number,
        boxWidth: number,
        boxHeight: number,
        options: {
            font?: string;
            fillStyle?: string;
            textAlign?: CanvasTextAlign;
            textBaseline?: CanvasTextBaseline;
            maxLines?: number;
            lineHeight?: number;
            paddingX?: number;
        } = {}
    ): void {
        const {
            font = 'bold 18px serif',
            fillStyle = '#333',
            textAlign = 'center',
            textBaseline = 'middle',
            maxLines = 2,
            lineHeight = 18,
            paddingX = 2,
        } = options;

        ctx.save();
        ctx.font = font;
        ctx.fillStyle = fillStyle;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;

        const maxTextWidth = boxWidth - 2 * paddingX;
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words.shift() || '';

        // Build lines
        for (const word of words) {
            const testLine = currentLine + ' ' + word;
            if (ctx.measureText(testLine).width <= maxTextWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
                if (lines.length === maxLines) break;
            }
        }
        lines.push(currentLine);

        if (lines.length > maxLines) {
            lines.length = maxLines;
            let last = lines[maxLines - 1];
            while (ctx.measureText(last + '…').width > maxTextWidth && last.length > 0) {
                last = last.slice(0, -1);
            }
            lines[maxLines - 1] = last + '…';
        }

        // Vertical centering
        const drawCount = Math.min(lines.length, maxLines);
        const totalTextHeight = drawCount * lineHeight;
        const startY =
            boxY +
            (boxHeight - totalTextHeight) / 2 +
            lineHeight / 2;

        // Draw each line
        const centerX = boxX + boxWidth / 2;
        for (let i = 0; i < drawCount; i++) {
            ctx.fillText(lines[i], centerX, startY + i * lineHeight);
        }

        ctx.restore();
    }




    destroy() {
        if (this.eventSystem) {
            this.eventSystem.unsubscribe('action:pan:start', this.onPanStart);
            this.eventSystem.unsubscribe('action:change', this.onActionChange);
            this.eventSystem.unsubscribe('action:hover', this.onHover);
            this.eventSystem.unsubscribe('action:hover:end', this.onHoverEnd);
        }
    }

}
