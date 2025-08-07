import { observer } from "mobx-react-lite";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { COLORS, type MyTrendChartProps, useTrendChart } from ".";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";
import { MyCustomTooltip } from "./MyCustomToolTip";

/**
 * RadarChart Component
 *
 * Compares multiple dimensions (e.g., KPI scores).
 *
 * Data shape:
 * [
 *   { subject: string; A: number },
 *   ...
 * ]
 *
 * Props:
 * - data: metric set per subject
 * - dataKey: metric field
 *
 * Best for:
 * - Performance profiles
 * - Category scoring
 */

export const MyRadarChart = observer(
  <T extends Record<string, any>>({
    data,
    width = "100%",
    height = "80%",
    colors = COLORS,
    traceKey,
    xKey,
    yKey,
    itemMap,
    related,
    formatter,
    excludedFromTotal,
    selectionLabel,
    title,
  }: MyTrendChartProps<T>) => {
    const { allTraceKeys, transformedData, shownFields, setShownFields } =
      useTrendChart(
        data,
        traceKey ?? "",
        xKey,
        yKey,
        itemMap,
        related,
        excludedFromTotal
      );

    return (
      <div className="w-full h-full rounded-xl shadow-xl">
        <h5 className="text-xl font-bold m-2">{title}</h5>
        <MyMultiDropdownSelector
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as string[])}
          options={allTraceKeys.map((s) => ({ id: s, name: s }))}
          label={selectionLabel ?? "Items"}
          isAll
        />
        <ResponsiveContainer width={width} height={height}>
          <RadarChart data={transformedData}>
            <PolarGrid strokeDasharray={"5 10"} />
            <PolarRadiusAxis />
            <PolarAngleAxis dataKey={xKey as string} />
            <Legend />
            <Tooltip
              content={(props) => <MyCustomTooltip {...props} />}
              formatter={formatter}
            />
            {allTraceKeys
              .filter((s) => shownFields.includes(s))
              .map((key, i) => (
                <Radar
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                />
              ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
