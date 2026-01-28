<script module lang="ts">
    export type Point = { x: number; y: number };

    export type AntennaElement = {
        id: string;
        type: 'wire' | 'loop' | 'boom' | 'curve';
        points: Point[];
        radius?: number;
        startAngle?: number;
        endAngle?: number; 
        label?: string;
        isDriven?: boolean;
        showDimensions?: boolean;
        group?: string;
        color?: string;
    };

    export type AntennaDesign = {
        name: string;
        frequency?: number;
        elements: AntennaElement[];
        feedGap?: number;
    };

    export type RenderOptions = {
        showGrid?: boolean;
        showOrigin?: boolean;
        showLabels?: boolean;
        showDimensions?: boolean;
        showScaleBar?: boolean;
        wireThickness?: number;
        boomThickness?: number;
        gridOpacity?: number;
    };

    type UserMeasurement = {
        p1: Point;
        p2: Point;
    };
</script>

<script lang="ts">
    import { tick, onMount } from 'svelte';

    let {
        design,
        height = '600px',
        backgroundColor = 'bg-slate-950',
        options = {},
        onElementClick = (id: string) => {}
    }: {
        design: AntennaDesign;
        height?: string;
        backgroundColor?: string;
        options?: RenderOptions;
        onElementClick?: (id: string) => void;
    } = $props();

    const config = $derived({
        showGrid: options.showGrid ?? true,
        showOrigin: options.showOrigin ?? true,
        showLabels: options.showLabels ?? false,
        showDimensions: options.showDimensions ?? true,
        showScaleBar: options.showScaleBar ?? true,
        wireThickness: options.wireThickness ?? 1.5,
        boomThickness: options.boomThickness ?? 3,
        gridOpacity: options.gridOpacity ?? 0.15
    });

    const COLORS = {
        wire: '#cbd5e1',
        wireHover: '#ffffff',
        driven: '#fbbf24',
        drivenHover: '#fde68a',
        reflector: '#f87171',
        boom: '#334155',
        grid: '#94a3b8',
        originX: '#ef4444',
        originY: '#22c55e',
        dimLine: '#64748b',
        dimText: '#e2e8f0',
        background: '#020617',
        snapPoint: '#06b6d4',
        userDim: '#22d3ee'
    };

    let container: HTMLDivElement | undefined = $state();
    let canvas: HTMLCanvasElement | undefined = $state();
    let ctx: CanvasRenderingContext2D | null = null;

    let width = $state(0);
    let heightPx = $state(0);
    let dpr = $state(1);

    let viewState = $state({ x: 0, y: 0, k: 1 });
    let isDragging = $state(false);
    let lastPos = { x: 0, y: 0 };
    let hoveredElementId: string | null = $state(null);
    let hasFittedInitial = false;

    let isMeasureMode = $state(false);
    let activeSnapPoint: Point | null = $state(null);
    let measureStartPoint: Point | null = $state(null);
    let userMeasurements: UserMeasurement[] = $state([]);

    let lastTouchDist = 0;
    let touchStartPos = { x: 0, y: 0 };
    let touchStartTime = 0;
    let isPinching = false;

    const CONNECTION_EPSILON = 0.05; 

    function arePointsTouching(p1: Point, p2: Point): boolean {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y) < CONNECTION_EPSILON;
    }

    function isPointOnLoop(p: Point, loopCenter: Point, radius: number): boolean {
        const dist = Math.hypot(p.x - loopCenter.x, p.y - loopCenter.y);
        return Math.abs(dist - radius) < CONNECTION_EPSILON;
    }

    function checkConnection(a: AntennaElement, b: AntennaElement): boolean {
        const getConnectionPoints = (el: AntennaElement): Point[] => {
            if (el.type === 'wire' || el.type === 'boom') return [el.points[0], el.points[1]];
            if (el.type === 'curve') return [el.points[0], el.points[2]];
            return [];
        };

        const pointsA = getConnectionPoints(a);
        const pointsB = getConnectionPoints(b);

        for (const pa of pointsA) {
            for (const pb of pointsB) {
                if (arePointsTouching(pa, pb)) return true;
            }
        }

        const checkLoop = (loop: AntennaElement, otherPoints: Point[]) => {
            if (!loop.radius) return false;
            const center = loop.points[0];
            for (const p of otherPoints) {
                if (isPointOnLoop(p, center, loop.radius)) return true;
            }
            return false;
        };

        if (a.type === 'loop' && checkLoop(a, pointsB)) return true;
        if (b.type === 'loop' && checkLoop(b, pointsA)) return true;

        return false;
    }

    let computedDesign = $derived.by(() => {
        const elements = design.elements.map(e => ({ ...e }));
        const count = elements.length;
        
        const adj: number[][] = Array.from({ length: count }, () => []);
        
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                if (checkConnection(elements[i], elements[j])) {
                    adj[i].push(j);
                    adj[j].push(i);
                }
            }
        }

        const queue: number[] = [];
        const visited = new Set<number>();

        elements.forEach((el, idx) => {
            if (el.isDriven) {
                queue.push(idx);
                visited.add(idx);
            }
        });

        while (queue.length > 0) {
            const currentIdx = queue.shift()!;
            elements[currentIdx].isDriven = true;

            for (const neighborIdx of adj[currentIdx]) {
                if (!visited.has(neighborIdx)) {
                    visited.add(neighborIdx);
                    queue.push(neighborIdx);
                }
            }
        }

        return { ...design, elements };
    });

    function getLength(p1: Point, p2: Point): number {
        return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }

    function distToSegment(p: Point, v: Point, w: Point) {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }

    function getBezierPoint(t: number, p0: Point, p1: Point, p2: Point): Point {
        const mt = 1 - t;
        return {
            x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
            y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
        };
    }

    function getBezierTangent(t: number, p0: Point, p1: Point, p2: Point): Point {
        const mt = 1 - t;
        return {
            x: 2 * mt * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
            y: 2 * mt * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
        };
    }

    function isAngleInArc(angle: number, start: number, end: number): boolean {
        const TWO_PI = Math.PI * 2;
        let a = angle % TWO_PI;
        let s = start % TWO_PI;
        let e = end % TWO_PI;
        if (a < 0) a += TWO_PI;
        if (s < 0) s += TWO_PI;
        if (e < 0) e += TWO_PI;

        if (s <= e) return a >= s && a <= e;
        return a >= s || a <= e;
    }

    function screenToWorld(sx: number, sy: number) {
        return {
            x: (sx - viewState.x) / viewState.k,
            y: (sy - viewState.y) / viewState.k
        };
    }

    function worldToScreen(wx: number, wy: number) {
        return {
            x: wx * viewState.k + viewState.x,
            y: wy * viewState.k + viewState.y
        };
    }

    let bounds = $derived.by(() => {
        if (!computedDesign.elements.length) return null;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        const expand = (x: number, y: number) => {
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        };

        computedDesign.elements.forEach((el) => {
            if (el.type === 'loop' && el.radius) {
                const cx = el.points[0].x, cy = el.points[0].y;
                const r = el.radius;
                expand(cx - r, cy - r);
                expand(cx + r, cy + r);
            } else if (el.type === 'curve' && el.points.length >= 3) {
                 for(let t=0; t<=1; t+=0.1) {
                     const p = getBezierPoint(t, el.points[0], el.points[1], el.points[2]);
                     expand(p.x, p.y);
                 }
            } else {
                el.points.forEach((p) => expand(p.x, p.y));
            }
        });

        if (minX === Infinity) return null;
        if (maxX === minX) { maxX += 1; minX -= 1; }
        if (maxY === minY) { maxY += 1; minY -= 1; }

        const w = maxX - minX;
        const h = maxY - minY;
        return {
            minX: minX - w * 0.1, maxX: maxX + w * 0.1,
            minY: minY - h * 0.1, maxY: maxY + h * 0.1
        };
    });

    let scaleBar = $derived.by(() => {
        if (!config.showScaleBar) return null;
        const targetPx = 100;
        const targetWorld = targetPx / viewState.k;
        const magnitude = Math.pow(10, Math.floor(Math.log10(targetWorld)));
        let step = magnitude;
        if (targetWorld / magnitude >= 5) step = 5 * magnitude;
        else if (targetWorld / magnitude >= 2) step = 2 * magnitude;

        return {
            worldWidth: step,
            pixelWidth: step * viewState.k,
            label: step >= 1 ? `${step}` : step.toFixed(2)
        };
    });

    let hoveredInfo = $derived.by(() => {
        if (!hoveredElementId) return null;
        const el = computedDesign.elements.find((e) => e.id === hoveredElementId);
        if (!el) return null;

        let info = { title: el.label || el.group || el.type, details: [] as string[] };
        
        if (el.isDriven) info.title += " (Driven)";

        if (el.type === 'wire') {
            const len = getLength(el.points[0], el.points[1]);
            info.details.push(`Length: ${len.toFixed(3)}`);
        } else if (el.type === 'loop' && el.radius) {
            info.details.push(`Radius: ${el.radius.toFixed(3)}`);
            if (el.startAngle !== undefined && el.endAngle !== undefined) {
                 const diff = Math.abs(el.endAngle - el.startAngle);
                 info.details.push(`Arc: ${(diff * 180 / Math.PI).toFixed(1)}°`);
            }
        }
        return info;
    });

    onMount(() => {
        if (!container) return;
        const resizeObserver = new ResizeObserver(() => {
            if (!container) return;
            const rect = container.getBoundingClientRect();
            dpr = window.devicePixelRatio || 1;
            width = rect.width;
            heightPx = rect.height;
            tick().then(() => render());
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    });

    $effect(() => {
        if (computedDesign && container && bounds && !hasFittedInitial && width > 0) {
            tick().then(() => { fitToScreen(); hasFittedInitial = true; });
        }
    });

    $effect(() => { if (design.name) hasFittedInitial = false; });
    
    $effect(() => {
        computedDesign; viewState; hoveredElementId; config; width; heightPx;
        activeSnapPoint; measureStartPoint; userMeasurements
        render();
    });

    function render() {
        if (!canvas || !width || !heightPx) return;
        ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        canvas.width = width * dpr;
        canvas.height = heightPx * dpr;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.translate(viewState.x, viewState.y);
        ctx.scale(viewState.k, viewState.k);

        if (config.showGrid) drawGrid(ctx);
        if (config.showOrigin) drawOrigin(ctx);

        computedDesign.elements.filter(e => e.type === 'boom').forEach(el => drawElementGeometry(ctx!, el));
        computedDesign.elements.filter(e => e.type !== 'boom').forEach(el => drawElementGeometry(ctx!, el));

        ctx.restore();

        ctx.save();
        ctx.scale(dpr, dpr);

        if (config.showLabels || config.showDimensions) {
            computedDesign.elements.forEach(el => drawElementOverlays(ctx!, el));
        }

        drawUserMeasurements(ctx);

        if (isMeasureMode) {
            if (activeSnapPoint) {
                const s = worldToScreen(activeSnapPoint.x, activeSnapPoint.y);
                ctx.beginPath();
                ctx.arc(s.x, s.y, 5, 0, Math.PI*2);
                ctx.fillStyle = COLORS.snapPoint;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            if (measureStartPoint && activeSnapPoint) {
                drawDimensionsScreenSpace(ctx, measureStartPoint, activeSnapPoint, true);
            }
        }

        ctx.restore();
    }

    function drawElementGeometry(context: CanvasRenderingContext2D, el: AntennaElement) {
        const isHovered = hoveredElementId === el.id;
        const isFaded = hoveredElementId !== null && !isHovered;

        context.globalAlpha = isFaded ? 0.3 : 1.0;
        let strokeColor = el.color || COLORS.wire;
        if (el.group === 'Reflector') strokeColor = COLORS.reflector;
        
        if (el.isDriven) strokeColor = COLORS.driven; 
        
        if (isHovered) strokeColor = el.isDriven ? COLORS.drivenHover : COLORS.wireHover;
        
        context.strokeStyle = strokeColor;
        context.lineCap = 'round';

        context.lineWidth = el.type === 'boom' 
            ? config.boomThickness / viewState.k 
            : config.wireThickness / viewState.k;

        context.beginPath();

        if (el.type === 'wire' || el.type === 'boom') {
            context.moveTo(el.points[0].x, el.points[0].y);
            context.lineTo(el.points[1].x, el.points[1].y);
            context.stroke();

            if (el.isDriven && el.type === 'wire') {
                const mid = { x: (el.points[0].x+el.points[1].x)/2, y: (el.points[0].y+el.points[1].y)/2 };
                const angle = Math.atan2(el.points[1].y - el.points[0].y, el.points[1].x - el.points[0].x);
                drawFeedpoint(context, mid, angle);
            }

        } else if (el.type === 'loop' && el.radius) {
            const cx = el.points[0].x, cy = el.points[0].y;
            const sAngle = el.startAngle ?? 0;
            const eAngle = el.endAngle ?? Math.PI * 2;
            const isFullCircle = Math.abs(eAngle - sAngle) >= Math.PI * 2 - 0.001;

            context.arc(cx, cy, el.radius, sAngle, eAngle, false);
            context.stroke();

            if (el.isDriven && !isFullCircle) {
                let midAngle = (sAngle + eAngle) / 2;
                if (eAngle < sAngle) midAngle = (sAngle + eAngle + Math.PI*2) / 2; 
                const fX = cx + el.radius * Math.cos(midAngle);
                const fY = cy + el.radius * Math.sin(midAngle);
                drawFeedpoint(context, {x: fX, y: fY}, midAngle + Math.PI/2);
            }

        } else if (el.type === 'curve' && el.points.length >= 3) {
            const p0 = el.points[0], cp = el.points[1], p2 = el.points[2];
            context.moveTo(p0.x, p0.y);
            context.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
            context.stroke();

            if (el.isDriven) {
                const mid = getBezierPoint(0.5, p0, cp, p2);
                const tan = getBezierTangent(0.5, p0, cp, p2);
                const angle = Math.atan2(tan.y, tan.x);
                drawFeedpoint(context, mid, angle);
            }
        }
        
        context.globalAlpha = 1.0;
    }

    function drawElementOverlays(context: CanvasRenderingContext2D, el: AntennaElement) {
        if (config.showLabels && el.label) {
            let wx = 0, wy = 0;
            if (el.type === 'wire') {
                wx = (el.points[0].x + el.points[1].x) / 2;
                wy = (el.points[0].y + el.points[1].y) / 2;
            } else if (el.type === 'loop') {
                wx = el.points[0].x; wy = el.points[0].y;
            } else if (el.type === 'curve') {
                const mid = getBezierPoint(0.5, el.points[0], el.points[1], el.points[2]);
                wx = mid.x; wy = mid.y;
            }

            const screenP = worldToScreen(wx, wy);
            
            context.fillStyle = COLORS.grid;
            context.font = `11px sans-serif`; 
            context.textAlign = 'center';
            context.textBaseline = 'bottom';
            context.fillText(el.label, screenP.x, screenP.y - 8);
        }

        if (config.showDimensions && el.showDimensions && el.type === 'wire') {
            drawDimensionsScreenSpace(context, el.points[0], el.points[1]);
        }
    }

    function drawFeedpoint(ctx: CanvasRenderingContext2D, center: Point, rotationRad: number) {
        if (!design.feedGap) return;
        const gap = design.feedGap / viewState.k;
        
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(rotationRad);

        ctx.fillStyle = COLORS.background; 
        ctx.fillRect(-gap/2, -gap/2, gap, gap);
        
        ctx.strokeStyle = COLORS.driven;
        ctx.lineWidth = 1 / viewState.k;
        ctx.strokeRect(-gap/2, -gap/2, gap, gap);

        ctx.beginPath();
        ctx.arc(0, 0, gap * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.driven;
        ctx.fill();
        
        ctx.restore();
    }

    function drawDimensionsScreenSpace(context: CanvasRenderingContext2D, p1: Point, p2: Point, isUser = false) {
        const s1 = worldToScreen(p1.x, p1.y);
        const s2 = worldToScreen(p2.x, p2.y);
        
        const dx = s2.x - s1.x;
        const dy = s2.y - s1.y;
        const screenLen = Math.hypot(dx, dy);
        
        if (screenLen < 5) return;

        const offsetPx = 20; 
        const nx = -dy / screenLen;
        const ny = dx / screenLen;

        const d1 = { x: s1.x + nx * offsetPx, y: s1.y + ny * offsetPx };
        const d2 = { x: s2.x + nx * offsetPx, y: s2.y + ny * offsetPx };
        const mid = { x: (d1.x + d2.x) / 2, y: (d1.y + d2.y) / 2 };

        const worldLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        context.strokeStyle = isUser ? COLORS.userDim : COLORS.dimLine;
        context.lineWidth = isUser ? 1.5 : 1;

        context.setLineDash([2, 2]);
        context.beginPath();
        context.moveTo(s1.x, s1.y); context.lineTo(d1.x, d1.y);
        context.moveTo(s2.x, s2.y); context.lineTo(d2.x, d2.y);
        context.stroke();
        context.setLineDash([]);

        context.beginPath();
        context.moveTo(d1.x, d1.y); context.lineTo(d2.x, d2.y);
        context.stroke();

        context.save();
        context.translate(mid.x, mid.y);
        const angle = Math.atan2(dy, dx);
        const textRot = (angle > Math.PI/2 || angle < -Math.PI/2) ? angle + Math.PI : angle;
        context.rotate(textRot);

        context.fillStyle = isUser ? COLORS.userDim : COLORS.dimText;
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.font = `bold 11px monospace`;

        context.strokeStyle = COLORS.background;
        context.lineWidth = 3;
        context.lineJoin = 'round';
        const txt = worldLen.toFixed(3);
        
        context.strokeText(txt, 0, -2);
        context.fillText(txt, 0, -2);

        context.restore();
    }

    function drawUserMeasurements(ctx: CanvasRenderingContext2D) {
        for (const m of userMeasurements) {
            drawDimensionsScreenSpace(ctx, m.p1, m.p2, true);
            
            const s1 = worldToScreen(m.p1.x, m.p1.y);
            const s2 = worldToScreen(m.p2.x, m.p2.y);
            ctx.fillStyle = COLORS.userDim;
            ctx.beginPath(); ctx.arc(s1.x, s1.y, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(s2.x, s2.y, 2, 0, Math.PI*2); ctx.fill();
        }
    }

    function drawGrid(context: CanvasRenderingContext2D) {
        const startX = -viewState.x / viewState.k;
        const startY = -viewState.y / viewState.k;
        const endX = (width - viewState.x) / viewState.k;
        const endY = (heightPx - viewState.y) / viewState.k;

        const minPixelSpacing = 40;
        let spacing = 1;
        let safety = 0;
        while (spacing * viewState.k < minPixelSpacing && safety < 100) {
            spacing *= 10;
            if (spacing * viewState.k > minPixelSpacing * 5) spacing /= 2;
            safety++;
        }

        context.beginPath();
        context.strokeStyle = COLORS.grid;
        context.lineWidth = 1 / viewState.k;
        context.globalAlpha = config.gridOpacity || 0.15;

        const firstVt = Math.floor(startX / spacing) * spacing;
        for (let x = firstVt; x < endX + spacing; x += spacing) {
            context.moveTo(x, startY);
            context.lineTo(x, endY);
        }

        const firstHz = Math.floor(startY / spacing) * spacing;
        for (let y = firstHz; y < endY + spacing; y += spacing) {
            context.moveTo(startX, y);
            context.lineTo(endX, y);
        }

        context.stroke();
        context.globalAlpha = 1.0;
    }

    function drawOrigin(context: CanvasRenderingContext2D) {
        context.lineWidth = 1 / viewState.k;
        context.setLineDash([4 / viewState.k, 4 / viewState.k]);
        context.globalAlpha = 0.5;

        context.beginPath();
        context.strokeStyle = COLORS.originX;
        context.moveTo(-10000, 0); context.lineTo(10000, 0);
        context.stroke();

        context.beginPath();
        context.strokeStyle = COLORS.originY;
        context.moveTo(0, -10000); context.lineTo(0, 10000);
        context.stroke();

        context.setLineDash([]);
        context.globalAlpha = 1.0;
    }

    function hitTest(screenX: number, screenY: number): string | null {
        const thresholdPx = 8;
        const thresholdWorld = thresholdPx / viewState.k;
        const wp = screenToWorld(screenX, screenY);

        let closestId = null;
        let minDistance = Infinity;

        for (const el of computedDesign.elements) {
            let dist = Infinity;

            if (el.type === 'wire' || el.type === 'boom') {
                dist = distToSegment(wp, el.points[0], el.points[1]);
            } else if (el.type === 'loop' && el.radius) {
                const distToCenter = Math.hypot(wp.x - el.points[0].x, wp.y - el.points[0].y);
                const rDist = Math.abs(distToCenter - el.radius);
                
                if (el.startAngle !== undefined && el.endAngle !== undefined) {
                    const angle = Math.atan2(wp.y - el.points[0].y, wp.x - el.points[0].x);
                    if (isAngleInArc(angle, el.startAngle, el.endAngle)) {
                         dist = rDist;
                    }
                } else {
                    dist = rDist;
                }
            }

            if (dist < thresholdWorld && dist < minDistance) {
                minDistance = dist;
                closestId = el.id;
            }
        }
        return closestId;
    }

    function snapTest(screenX: number, screenY: number): Point | null {
        const snapThresholdPx = 15;
        const thresholdWorld = snapThresholdPx / viewState.k;
        const wp = screenToWorld(screenX, screenY);

        let closestPoint: Point | null = null;
        let minDistance = thresholdWorld;

        const checkP = (p: Point) => {
            const d = Math.hypot(p.x - wp.x, p.y - wp.y);
            if (d < minDistance) {
                minDistance = d;
                closestPoint = p;
            }
        };

        for (const el of computedDesign.elements) {
            if (el.type === 'wire' || el.type === 'boom') {
                checkP(el.points[0]);
                checkP(el.points[1]);
            } else if (el.type === 'curve') {
                checkP(el.points[0]);
                checkP(el.points[2]);
            } else if (el.type === 'loop') {
                checkP(el.points[0]);
            }
        }
        return closestPoint;
    }

    export function fitToScreen() {
        if (!bounds || !width || !heightPx) return;
        const padding = 40;
        const w = width - padding * 2;
        const h = heightPx - padding * 2;
        if (w <= 0 || h <= 0) return;

        const contentW = bounds.maxX - bounds.minX;
        const contentH = bounds.maxY - bounds.minY;
        const scale = Math.min(
            w / (contentW || 1), 
            h / (contentH || 1)
        ) || 1;

        viewState.k = scale;
        viewState.x = (width - contentW * scale) / 2 - bounds.minX * scale;
        viewState.y = (heightPx - contentH * scale) / 2 - bounds.minY * scale;
    }

    function zoom(factor: number) {
        if (!width) return;
        const cx = width / 2;
        const cy = heightPx / 2;
        applyZoom(cx, cy, factor);
    }

    function toggleMeasureMode() {
        isMeasureMode = !isMeasureMode;
        measureStartPoint = null;
        activeSnapPoint = null;
        if (!isMeasureMode) {
            userMeasurements = [];
        }
    }

    function handleWheel(e: WheelEvent) {
        e.preventDefault();
        const rect = container?.getBoundingClientRect();
        if (!rect) return;
        
        const zoomIntensity = 0.1;
        const direction = e.deltaY > 0 ? -1 : 1;
        const factor = 1 + zoomIntensity * direction;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        applyZoom(mouseX, mouseY, factor);
        
        if (isMeasureMode) {
             activeSnapPoint = snapTest(mouseX, mouseY);
        } else {
             const hit = hitTest(mouseX, mouseY);
             if (hit !== hoveredElementId) hoveredElementId = hit;
        }
    }

    function applyZoom(cx: number, cy: number, factor: number) {
        const newK = Math.max(0.1, Math.min(5000, viewState.k * factor));
        const safeFactor = newK / viewState.k;

        viewState.x = cx - (cx - viewState.x) * safeFactor;
        viewState.y = cy - (cy - viewState.y) * safeFactor;
        viewState.k = newK;
    }

    function handleMouseDown(e: MouseEvent) {
        if (e.button !== 0) return;
        if (!isMeasureMode) {
            isDragging = true;
            lastPos = { x: e.clientX, y: e.clientY };
        }
    }

    function handleMouseMove(e: MouseEvent) {
        const rect = container?.getBoundingClientRect();
        if (!rect) return;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isDragging) {
            const dx = e.clientX - lastPos.x;
            const dy = e.clientY - lastPos.y;
            viewState.x += dx;
            viewState.y += dy;
            lastPos = { x: e.clientX, y: e.clientY };
        } else {
            if (isMeasureMode) {
                const snapped = snapTest(mouseX, mouseY);
                if (snapped) {
                    activeSnapPoint = snapped;
                    container!.style.cursor = 'crosshair';
                } else {
                    activeSnapPoint = screenToWorld(mouseX, mouseY);
                    container!.style.cursor = 'crosshair';
                }
            } else {
                const hit = hitTest(mouseX, mouseY);
                if (hit !== hoveredElementId) hoveredElementId = hit;
                container!.style.cursor = hit ? 'pointer' : 'grab';
            }
        }
    }

    function handleMouseUp() { isDragging = false; }

    function handleClick(e: MouseEvent) {
        processClickOrTap(e.clientX, e.clientY);
    }

    function processClickOrTap(clientX: number, clientY: number) {
        if (isDragging) return;
        
        const rect = container?.getBoundingClientRect();
        if (!rect) return;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (isMeasureMode) {
            if (!activeSnapPoint) {
                 const snapped = snapTest(x, y);
                 activeSnapPoint = snapped || screenToWorld(x, y);
            }

            if (!measureStartPoint) {
                measureStartPoint = activeSnapPoint;
            } else {
                userMeasurements = [...userMeasurements, {
                    p1: measureStartPoint,
                    p2: activeSnapPoint!
                }];
                measureStartPoint = null;
            }
            return;
        }

        const hit = hitTest(x, y);
        if (hit) onElementClick(hit);
    }

    // --- Touch Handlers (Mobile) ---

    function getTouchDist(e: TouchEvent) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }

    function getTouchCenter(e: TouchEvent, rect: DOMRect) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        return {
            x: ((t1.clientX + t2.clientX) / 2) - rect.left,
            y: ((t1.clientY + t2.clientY) / 2) - rect.top
        };
    }

    function handleTouchStart(e: TouchEvent) {
        if (e.cancelable) e.preventDefault();
        
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            lastPos = { x: touch.clientX, y: touch.clientY };
            touchStartTime = Date.now();
            isDragging = true;
            isPinching = false;

            const rect = container?.getBoundingClientRect();
            if(rect) {
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                if(isMeasureMode) activeSnapPoint = snapTest(x, y) || screenToWorld(x, y);
            }

        } else if (e.touches.length === 2) {
            isPinching = true;
            isDragging = false;
            lastTouchDist = getTouchDist(e);
        }
    }

    function handleTouchMove(e: TouchEvent) {
        if (e.cancelable) e.preventDefault();
        const rect = container?.getBoundingClientRect();
        if (!rect) return;

        if (isPinching && e.touches.length === 2) {
            const newDist = getTouchDist(e);
            const center = getTouchCenter(e, rect);
            
            if (lastTouchDist > 0) {
                const factor = newDist / lastTouchDist;
                applyZoom(center.x, center.y, factor);
            }
            lastTouchDist = newDist;
        } else if (e.touches.length === 1 && !isPinching) {
            const touch = e.touches[0];
            const dx = touch.clientX - lastPos.x;
            const dy = touch.clientY - lastPos.y;
            
            viewState.x += dx;
            viewState.y += dy;
            lastPos = { x: touch.clientX, y: touch.clientY };

            if(isMeasureMode) {
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                activeSnapPoint = snapTest(x, y) || screenToWorld(x, y);
            }
        }
    }

    function handleTouchEnd(e: TouchEvent) {
        if (e.cancelable) e.preventDefault();
        
        if (!isPinching && e.changedTouches.length === 1 && e.touches.length === 0) {
             const touch = e.changedTouches[0];
             const dx = touch.clientX - touchStartPos.x;
             const dy = touch.clientY - touchStartPos.y;
             const moveDist = Math.hypot(dx, dy);
             const timeDiff = Date.now() - touchStartTime;

             if (moveDist < 10 && timeDiff < 300) {
                 processClickOrTap(touch.clientX, touch.clientY);
             }
        }

        if (e.touches.length === 0) {
            isDragging = false;
            isPinching = false;
        }
    }
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div
    bind:this={container}
    class="group relative w-full overflow-hidden rounded-xl border border-slate-700 select-none {backgroundColor} touch-none"
    style="height: {height}; touch-action: none;"
    onwheel={handleWheel}
    onmousedown={handleMouseDown}
    onclick={handleClick}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    role="application"
    aria-label="Antenna Viewer"
>
    <div class="pointer-events-none absolute top-4 left-4 z-20 space-y-2">
        <div class="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-slate-200 shadow-xl backdrop-blur">
            <div class="text-sm font-bold">{design.name}</div>
            {#if design.frequency}
                <div class="font-mono text-xs text-blue-400">{design.frequency} MHz</div>
            {/if}
            <div class="mt-1 font-mono text-[10px] text-slate-500">Zoom: {viewState.k.toFixed(2)}x</div>
            {#if isMeasureMode}
                <div class="mt-1 font-bold text-cyan-400 animate-pulse">
                    {measureStartPoint ? 'Select 2nd Point' : 'Select 1st Point'}
                </div>
            {/if}
        </div>
        {#if hoveredInfo && !isMeasureMode}
            <div class="rounded border border-slate-600 bg-slate-800/90 p-2 text-xs text-white shadow-lg backdrop-blur">
                <div class="mb-1 font-bold text-amber-400">{hoveredInfo.title}</div>
                {#each hoveredInfo.details as detail}
                    <div class="text-slate-300">{detail}</div>
                {/each}
            </div>
        {/if}
    </div>

    <div class="absolute bottom-4 left-4 z-20 flex flex-col gap-1 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
        <button onclick={() => zoom(1.2)} class="border-b border-slate-700 p-2 text-slate-300 hover:bg-slate-700 active:bg-slate-600" title="Zoom In">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button onclick={() => fitToScreen()} class="border-b border-slate-700 p-2 text-slate-300 hover:bg-slate-700 active:bg-slate-600" title="Fit All">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
        <button onclick={() => zoom(0.8)} class="border-b border-slate-700 p-2 text-slate-300 hover:bg-slate-700 active:bg-slate-600" title="Zoom Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button 
            onclick={toggleMeasureMode} 
            class="p-2 transition-colors {isMeasureMode ? 'bg-cyan-900 text-cyan-400' : 'text-slate-300 hover:bg-slate-700 active:bg-slate-600'}" 
            title={isMeasureMode ? "Clear Measurement" : "Measure Distance"}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12h20M2 12v6M22 12v6M6 12v4M10 12v4M14 12v4M18 12v4" />
            </svg>
        </button>
    </div>

    {#if scaleBar}
        <div class="pointer-events-none absolute right-4 bottom-4 z-20 flex flex-col items-end">
            <div class="mb-1 h-2 border-r-2 border-b-2 border-l-2 border-slate-400" style="width: {scaleBar.pixelWidth}px"></div>
            <span class="rounded bg-slate-900/50 px-1 font-mono text-[10px] text-slate-400">{scaleBar.label}</span>
        </div>
    {/if}

    <canvas
        bind:this={canvas}
        class="absolute top-0 left-0 h-full w-full"
    ></canvas>
</div>