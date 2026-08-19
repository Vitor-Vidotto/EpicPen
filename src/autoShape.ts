import { Point, ShapeType } from './canvas';

export interface RecognizedShape {
  shapeType: ShapeType;
  start: Point;
  end: Point;
}

export class AutoShapeDetector {
  /**
   * Reconhece se um traço manual de pontos corresponde a Linha Reta, Círculo ou Retângulo/Quadrado.
   */
  public static detect(points: Point[]): RecognizedShape | null {
    if (points.length < 5) return null;

    const start = points[0];
    const end = points[points.length - 1];

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let totalPathLength = 0;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;

      if (i > 0) {
        totalPathLength += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y);
      }
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const maxDim = Math.max(width, height);

    if (maxDim < 15) return null; // Ignorar traços muito pequenos

    const startEndDist = Math.hypot(end.x - start.x, end.y - start.y);

    // 1. TESTE DE LINHA RETA (Aberto ou Fechado)
    if (startEndDist > 20 && startEndDist > totalPathLength * 0.45) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const lineLen = Math.hypot(dx, dy);

      let maxDev = 0;
      let devSum = 0;

      for (let i = 1; i < points.length - 1; i++) {
        const p = points[i];
        const perpDist = Math.abs(dy * p.x - dx * p.y + end.x * start.y - end.y * start.x) / lineLen;
        devSum += perpDist;
        if (perpDist > maxDev) maxDev = perpDist;
      }

      const avgDev = devSum / points.length;
      const devRatio = avgDev / lineLen;

      if (devRatio < 0.12 && maxDev < Math.max(30, lineLen * 0.22)) {
        // Verificar se é uma seta (gancho V no final)
        const lastSegmentsLen = Math.min(8, Math.floor(points.length * 0.3));
        if (lastSegmentsLen > 1) {
          const nearEndPt = points[points.length - 1 - lastSegmentsLen];
          const vAngle = Math.abs(Math.atan2(end.y - nearEndPt.y, end.x - nearEndPt.x) - Math.atan2(dy, dx));

          if (vAngle > 0.5 && vAngle < 2.6 && totalPathLength > lineLen * 1.15) {
            return { shapeType: 'arrow', start, end };
          }
        }

        return { shapeType: 'line', start, end };
      }
    }

    // 2. FORMAS FECHADAS (Círculo ou Retângulo / Quadrado)
    const isClosed = startEndDist < Math.max(50, maxDim * 0.5);

    if (isClosed && points.length >= 6) {
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rx = width / 2;
      const ry = height / 2;

      // A. TESTE DE CÍRCULO / ELIPSE (Testado Primeiro!)
      // Num círculo, o raio em relação ao centro tem erro/variância baixo (< 0.12)
      if (rx > 5 && ry > 5) {
        let sumRadiusErr = 0;
        for (const p of points) {
          const normDist = Math.hypot((p.x - cx) / rx, (p.y - cy) / ry);
          sumRadiusErr += Math.abs(normDist - 1.0);
        }
        const avgRadiusErr = sumRadiusErr / points.length;

        if (avgRadiusErr < 0.13) {
          return {
            shapeType: 'circle',
            start: { x: minX, y: minY },
            end: { x: maxX, y: maxY }
          };
        }
      }

      // B. TESTE DE RETÂNGULO / QUADRADO
      // Um retângulo exige que existam pontos cobrindo os 4 lados (topo, base, esquerda, direita)
      const edgeThresholdX = width * 0.25;
      const edgeThresholdY = height * 0.25;

      const hasTopEdge = points.some(p => Math.abs(p.y - minY) < edgeThresholdY);
      const hasBottomEdge = points.some(p => Math.abs(p.y - maxY) < edgeThresholdY);
      const hasLeftEdge = points.some(p => Math.abs(p.x - minX) < edgeThresholdX);
      const hasRightEdge = points.some(p => Math.abs(p.x - maxX) < edgeThresholdX);

      // Verificar se os pontos correm próximos do perímetro do retângulo
      let edgeDistSum = 0;
      for (const p of points) {
        const distLeft = Math.abs(p.x - minX);
        const distRight = Math.abs(p.x - maxX);
        const distTop = Math.abs(p.y - minY);
        const distBottom = Math.abs(p.y - maxY);
        const minDistToEdge = Math.min(distLeft, distRight, distTop, distBottom);
        edgeDistSum += minDistToEdge;
      }
      const avgEdgeDist = edgeDistSum / points.length;

      if (hasTopEdge && hasBottomEdge && hasLeftEdge && hasRightEdge && (avgEdgeDist / maxDim < 0.18)) {
        return {
          shapeType: 'rect',
          start: { x: minX, y: minY },
          end: { x: maxX, y: maxY }
        };
      }
    }

    return null;
  }
}
