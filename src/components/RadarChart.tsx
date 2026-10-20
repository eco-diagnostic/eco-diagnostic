import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from "react-native-svg";
import { Pillar } from "../types";
import { PILLAR_COLORS, PILLAR_NAMES } from "../data/questions";

interface RadarChartProps {
  pillarScores: Record<Pillar, number>;
  size?: number;
}

const PILLARS_ORDER: { pillar: Pillar; shortName: string; icon: string }[] = [
  { pillar: Pillar.ENERGIA, shortName: "Energia", icon: "⚡" },
  { pillar: Pillar.AGUA, shortName: "Água", icon: "💧" },
  { pillar: Pillar.RESIDUOS, shortName: "Resíduos", icon: "♻️" },
  { pillar: Pillar.MATERIAIS, shortName: "Materiais", icon: "📦" },
  { pillar: Pillar.GESTAO, shortName: "Governança", icon: "🏛️" },
];

export default function RadarChart({ pillarScores, size = 320 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 48; // margem para rótulos externos
  const levels = [25, 50, 75, 100];
  const count = PILLARS_ORDER.length;

  // Ângulos para cada pilar (começando no topo: -PI/2)
  const angles = PILLARS_ORDER.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / count);

  // Calcula coordenadas cartesianas a partir de ângulo e raio
  const getCoordinates = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  });

  // Polígonos de grade de fundo (25%, 50%, 75%, 100%)
  const gridPolygons = levels.map((lvl) => {
    const lvlRadius = (lvl / 100) * radius;
    const points = angles
      .map((ang) => {
        const { x, y } = getCoordinates(ang, lvlRadius);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return { level: lvl, points };
  });

  // Polígono dos dados do diagnóstico
  const dataPoints = PILLARS_ORDER.map((item, i) => {
    const score = Math.max(0, Math.min(100, pillarScores?.[item.pillar] ?? 0));
    const scoreRadius = (score / 100) * radius;
    return {
      pillar: item.pillar,
      score,
      ...getCoordinates(angles[i], scoreRadius),
    };
  });

  const dataPolygonPoints = dataPoints
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <View style={styles.card}>
      <Text style={styles.chartTitle}>Equilíbrio Multidimensional ESG</Text>
      <Text style={styles.chartSubtitle}>
        Visualização de teia dos 5 eixos de maturidade ambiental
      </Text>

      <View style={styles.svgContainer}>
        <Svg width={size} height={size}>
          {/* Círculos / Polígonos de Grade */}
          {gridPolygons.map((grid) => (
            <Polygon
              key={`grid-${grid.level}`}
              points={grid.points}
              fill={grid.level === 100 ? "#f8fafc" : "transparent"}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Rótulos dos níveis (25, 50, 75, 100) no eixo vertical superior */}
          {levels.map((lvl) => {
            const yPos = center - (lvl / 100) * radius;
            return (
              <SvgText
                key={`lvl-text-${lvl}`}
                x={center + 4}
                y={yPos - 2}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="500"
              >
                {lvl}
              </SvgText>
            );
          })}

          {/* Linhas radiais dos eixos */}
          {angles.map((ang, i) => {
            const { x, y } = getCoordinates(ang, radius);
            return (
              <Line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Polígono de Dados */}
          <Polygon
            points={dataPolygonPoints}
            fill="rgba(22, 163, 74, 0.28)"
            stroke="#16a34a"
            strokeWidth="2.5"
          />

          {/* Marcadores dos vértices */}
          {dataPoints.map((pt) => (
            <G key={`marker-${pt.pillar}`}>
              <Circle
                cx={pt.x}
                cy={pt.y}
                r="6"
                fill={PILLAR_COLORS[pt.pillar]}
                stroke="#ffffff"
                strokeWidth="2"
              />
            </G>
          ))}

          {/* Rótulos externos nos vértices */}
          {PILLARS_ORDER.map((item, i) => {
            const labelDist = radius + 22;
            const { x, y } = getCoordinates(angles[i], labelDist);
            const score = pillarScores?.[item.pillar] ?? 0;

            // Ajuste fino do alinhamento do texto dependendo da posição angular
            let textAnchor: "middle" | "start" | "end" = "middle";
            if (Math.cos(angles[i]) > 0.3) textAnchor = "start";
            else if (Math.cos(angles[i]) < -0.3) textAnchor = "end";

            return (
              <SvgText
                key={`label-${item.pillar}`}
                x={x}
                y={y + (angles[i] < 0 ? -4 : 8)}
                fill="#1e293b"
                fontSize="11"
                fontWeight="bold"
                textAnchor={textAnchor}
              >
                {`${item.icon} ${item.shortName} (${score})`}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Legenda dos Pilares */}
      <View style={styles.legendContainer}>
        {PILLARS_ORDER.map((item) => (
          <View key={`leg-${item.pillar}`} style={styles.legendPill}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: PILLAR_COLORS[item.pillar] },
              ]}
            />
            <Text style={styles.legendText}>
              {item.shortName}:{" "}
              <Text style={styles.legendScore}>{pillarScores?.[item.pillar] ?? 0} pts</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  svgContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  legendPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: "#475569",
  },
  legendScore: {
    fontWeight: "bold",
    color: "#0f172a",
  },
});
