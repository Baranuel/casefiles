import { ElementDto, PositionWithinElement } from "@/types/elements";

export function getPositionWithinElement(
    x: number,
    y: number,
    element: ElementDto
): PositionWithinElement | null {
    const { type, position } = element;
    const { x1, y1, x2, y2 } = position;

    switch (type) {
        case 'POINTER':
            // For lines, check endpoints and middle
            const onLine = onLineHelper(x1, y1, x2, y2, x, y, 3);
            const start = nearPointHelper(x, y, x1, y1, "start", 20);
            const end = nearPointHelper(x, y, x2, y2, "end", 20);
            const middle = nearPointHelper(x, y, x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2, "line_middle", 20);
            return start || end || middle || onLine;
        case 'PERSON':
        case "LOCATION":
        case "NOTE":
            // For rectangles, check corners, edges, and inside
            const middleX = (x1 + x2) / 2;
            const middleY = (y1 + y2) / 2;
            const topLeft = nearPointHelper(x, y, x1, y1, "tl");
            const topRight = nearPointHelper(x, y, x2, y1, "tr");
            const bottomLeft = nearPointHelper(x, y, x1, y2, "bl");
            const bottomRight = nearPointHelper(x, y, x2, y2, "br");
            const topMiddle = nearPointHelper(x, y, middleX, y1, "tm");
            const bottomMiddle = nearPointHelper(x, y, middleX, y2, "bm");
            const leftMiddle = nearPointHelper(x, y, x1, middleY, "ml");
            const rightMiddle = nearPointHelper(x, y, x2, middleY, "mr");
            const inside =
                x >= Math.min(x1, x2) &&
                    x <= Math.max(x1, x2) &&
                    y >= Math.min(y1, y2) &&
                    y <= Math.max(y1, y2)
                    ? "inside"
                    : null;
            return (
                topLeft ||
                topRight ||
                bottomLeft ||
                bottomRight ||
                topMiddle ||
                bottomMiddle ||
                leftMiddle ||
                rightMiddle ||
                inside
            );
        default:
            throw new Error(`Type not recognised: ${type}`);
    }
}

// Helper functions (copy from your main file or import if already available)
function nearPointHelper(
    x: number,
    y: number,
    x1: number,
    y1: number,
    name: PositionWithinElement,
    pointBuffer = 10
) {
    return Math.abs(x - x1) < pointBuffer && Math.abs(y - y1) < pointBuffer ? name : null;
}

function distanceHelper(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function onLineHelper(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number,
    maxDistance = 1
) {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distanceHelper(a, b) - (distanceHelper(a, c) + distanceHelper(b, c));
    return Math.abs(offset) < maxDistance ? "inside" : null;
}