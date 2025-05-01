import { Camera, System } from "@/types/engine";
import { Engine } from "..";

export class CameraSystem implements System {
    private lastTouchPos: { x: number; y: number } | null = null;
    private pinch = { startDist: null as number | null, startCam: null as Camera | null, center: { x: 0, y: 0 } };
    private controller = new AbortController();

    constructor(public engine: Engine) {
        const { canvas } = engine;

        canvas.addEventListener("wheel", this.onWheel, { passive: false, signal: this.controller.signal });

        canvas.addEventListener("touchstart", this.onTouchStart, { passive: false, signal: this.controller.signal });
        canvas.addEventListener("touchmove", this.onTouchMove, { passive: false, signal: this.controller.signal });
        canvas.addEventListener("touchend", this.onTouchEnd, { signal: this.controller.signal });
    }

    private onWheel = (e: WheelEvent) => {
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

    private onTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        const t = e.touches;
        if (t.length === 2) {
            const d = Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
            this.pinch.startDist = d;
            this.pinch.startCam = { ...this.engine.camera };
            const rect = this.engine.canvas.getBoundingClientRect();
            this.pinch.center = {
                x: (t[0].clientX + t[1].clientX) / 2 - rect.left,
                y: (t[0].clientY + t[1].clientY) / 2 - rect.top,
            };
        } else if (t.length === 1) {
            this.lastTouchPos = { x: t[0].screenX, y: t[0].screenY };
        }
    };

    private onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const { camera } = this.engine;
        const t = e.touches;

        if (t.length === 2 && this.pinch.startDist && this.pinch.startCam) {
            const newD = Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
            const scale = newD / this.pinch.startDist;
            this.engine.camera = this.zoomAtPoint(this.pinch.center.x, this.pinch.center.y, this.pinch.startCam, scale);
        }
        else if (t.length === 1 && this.lastTouchPos) {
            const dx = (t[0].screenX - this.lastTouchPos.x) / camera.zoom;
            const dy = (t[0].screenY - this.lastTouchPos.y) / camera.zoom;
            this.engine.camera = { ...camera, x: camera.x - dx, y: camera.y - dy };
            this.lastTouchPos = { x: t[0].screenX, y: t[0].screenY };
        }
    };

    private onTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
            this.pinch.startDist = null;
            this.pinch.startCam = null;
            const rem = e.touches[0];
            this.lastTouchPos = rem ? { x: rem.screenX, y: rem.screenY } : null;
        }
    };

    private zoomAtPoint(px: number, py: number, cam: Camera, factor: number): Camera {
        const newZoom = cam.zoom * factor;

        const MIN_ZOOM = 0.25;
        const MAX_ZOOM = 4;
        const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));

        const before = this.toCanvasPos(px, py, cam);
        const after = this.toCanvasPos(px, py, { ...cam, zoom: clampedZoom });

        return {
            zoom: clampedZoom,
            x: cam.x + (before.x - after.x),
            y: cam.y + (before.y - after.y),
        };
    }

    private toCanvasPos(x: number, y: number, cam: Camera) {
        return { x: cam.x + x / cam.zoom, y: cam.y + y / cam.zoom };
    }

    update() { }
    draw() { }
    destroy() {
        this.controller.abort();
    }
}
