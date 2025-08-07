import { observer } from "mobx-react-lite";
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MyCircleChartProps, useCircleChart } from ".";
import { MyCustomTooltip } from "./MyCustomToolTip";

/**
 * RadialBarChart Component
 *
 * Visualizes values in a radial format (circular bars).
 *
 * Data shape:
 * [
 *   { name: string; value: number; fill?: string },
 *   ...
 * ]
 *
 * Props:
 * - data: circular bar segments
 * - dataKey: value to display
 *
 * Best for:
 * - Ranked comparisons (like pie but with bars)
 * - Dashboard KPIs
 */
export const MyRadialBarChart = observer(
  <T extends Record<string, any>>({
    data,
    dataKey,
    nameKey,
    traceKey,
    itemMap,
  }: MyCircleChartProps<T>) => {
    const { resolvedData } = useCircleChart(
      data,
      nameKey,
      dataKey,
      traceKey,
      itemMap
    );
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="20%"
          outerRadius="90%"
          data={resolvedData}
          startAngle={180}
          endAngle={-180}
        >
          <RadialBar
            dataKey={dataKey as string}
            cornerRadius={10}
            fill="#8884d8"
            background
          />
          <Tooltip content={(props) => <MyCustomTooltip {...props} />} />
        </RadialBarChart>
      </ResponsiveContainer>
    );
  }
);
