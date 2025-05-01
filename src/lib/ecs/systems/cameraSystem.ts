import { Camera, System } from "@/types/engine";
import { Engine } from "..";

export class CameraSystem implements System {
    engine: Engine;
    private controller: AbortController;
    private boundOnWheel: (e: WheelEvent) => void;
    private boundOnTouchMove: (e: TouchEvent) => void;
    private boundOnTouchStart: (e: TouchEvent) => void;

    private lastTouchPos: { x: number; y: number } | null = null;

    // for pinch‐to‐zoom
    private pinchStartDist: number | null = null;
    private pinchStartZoom = 1;
    private pinchCenter: { x: number; y: number } = { x: 0, y: 0 };

    constructor(engine: Engine) {
        this.engine = engine;
        this.controller = new AbortController()
        this.boundOnWheel = this.onWheel.bind(this);
        this.boundOnTouchMove = this.onTouchMove.bind(this)
        this.boundOnTouchStart = this.onTouchStart.bind(this)

        this.engine.canvas.addEventListener("wheel", this.onWheel.bind(this), { signal: this.controller.signal });
        this.engine.canvas.addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false, signal: this.controller.signal });
        this.engine.canvas.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false, signal: this.controller.signal });
        this.engine.canvas.addEventListener("touchend", this.onTouchEnd.bind(this), { signal: this.controller.signal });
    }

    onWheel(e: WheelEvent) {
        e.preventDefault();
        const camera = this.engine.camera;
        const canvas = this.engine.canvas;

        const ZOOM_SENSITIVITY = 20;
        const clampedDelta = Math.max(-ZOOM_SENSITIVITY, Math.min(ZOOM_SENSITIVITY, e.deltaY));

        const zoomFactor = Math.pow(0.99, clampedDelta);
        const zoomPointX = e.clientX - canvas.getBoundingClientRect().left;
        const zoomPointY = e.clientY - canvas.getBoundingClientRect().top;

        const updateX = camera.x + e.deltaX / camera.zoom;
        const updateY = camera.y + e.deltaY / camera.zoom;

        const updateZoom = camera.zoom;

        if (e.ctrlKey) {
            return this.engine.camera = this.zoomAtPoint(zoomPointX, zoomPointY, camera, zoomFactor);
        }
        const updateCamera = {
            x: updateX,
            y: updateY,
            zoom: updateZoom
        };

        this.engine.camera = updateCamera;
    }
    onTouchStart(e: TouchEvent) {
        if (e.touches.length === 2) {
            // start pinch
            const [t0, t1] = [e.touches[0], e.touches[1]];
            this.pinchStartDist = Math.hypot(
                t1.clientX - t0.clientX,
                t1.clientY - t0.clientY
            );
            this.pinchStartZoom = this.engine.camera.zoom;

            // midpoint in canvas‐coordinates:
            const rect = this.engine.canvas.getBoundingClientRect();
            this.pinchCenter = {
                x: (t0.clientX + t1.clientX) / 2 - rect.left,
                y: (t0.clientY + t1.clientY) / 2 - rect.top,
            };
        } else if (e.touches.length === 1) {
            // start pan
            const t = e.touches[0];
            this.lastTouchPos = { x: t.screenX, y: t.screenY };
        }
    }

    onTouchMove(e: TouchEvent) {
        e.preventDefault();
        const cam = this.engine.camera;

        if (e.touches.length === 2 && this.pinchStartDist != null) {
            
            const [t0, t1] = [e.touches[0], e.touches[1]];
            const newDist = Math.hypot(
                t1.clientX - t0.clientX,
                t1.clientY - t0.clientY
            );
            const scale = newDist / this.pinchStartDist;
            this.engine.camera = this.zoomAtPoint(
                this.pinchCenter.x,
                this.pinchCenter.y,
                { ...cam, zoom: this.pinchStartZoom },
                scale
            );
        } else if (e.touches.length === 1 && this.lastTouchPos) {
            
            const t = e.touches[0];
            const deltaX = (t.screenX - this.lastTouchPos.x) / cam.zoom;
            const deltaY = (t.screenY - this.lastTouchPos.y) / cam.zoom;
            this.engine.camera = {
                ...cam,
                x: cam.x - deltaX,
                y: cam.y - deltaY,
            };
            this.lastTouchPos = { x: t.screenX, y: t.screenY };
        }
    }

    onTouchEnd(e: TouchEvent) {
        // reset both gesture states once fingers lift
        if (e.touches.length < 2) {
            this.pinchStartDist = null;
        }
        if (e.touches.length === 0) {
            this.lastTouchPos = null;
        }
    }
    zoomAtPoint(newX: number, newY: number, camera: Camera, zoomFactor: number): Camera {
        const newZoom = camera.zoom * zoomFactor;
        const mouseWorldBefore = this.toCanvasPosition(newX, newY, camera);
        const mouseWorldAfter = this.toCanvasPosition(newX, newY, { ...camera, zoom: newZoom });
        const maxAllowedZoom = 0.25;
        if (newZoom < maxAllowedZoom) return camera;

        const zoomX = camera.x + (mouseWorldBefore.x - mouseWorldAfter.x);
        const zoomY = camera.y + (mouseWorldBefore.y - mouseWorldAfter.y);

        return {
            zoom: Math.max(maxAllowedZoom, newZoom),
            x: zoomX,
            y: zoomY,
        };
    }

    toCanvasPosition(x: number, y: number, camera: Camera) {
        return {
            x: camera.x + x / camera.zoom,
            y: camera.y + y / camera.zoom
        };
    }

    draw() { }

    update() { }

    destroy() {
        this.controller.abort()
    }
}