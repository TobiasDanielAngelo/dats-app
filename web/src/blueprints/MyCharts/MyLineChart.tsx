import { observer } from "mobx-react-lite";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COLORS, type MyTrendChartProps, useTrendChart } from ".";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";
import { MyCustomTooltip } from "./MyCustomToolTip";

/**
 * LineChart Component
 *
 * Displays trends over time (e.g., sales per month).
 *
 * Data shape:
 * [
 *   { name: string; value: number },
 *   ...
 * ]
 *
 * Props:
 * - data: list of time series points
 * - dataKey: key to extract value (e.g., "value")
 *
 * Best for:
 * - Time series data
 * - Performance monitoring
 */

export const MyLineChart = observer(
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
    noTotal,
    title = "",
  }: MyTrendChartProps<T>) => {
    const { allTraceKeys, transformedData, shownFields, setShownFields } =
      useTrendChart(
        data,
        traceKey ?? "",
        xKey,
        yKey,
        itemMap,
        related,
        excludedFromTotal,
        noTotal
      );

    return (
      <div className="w-full h-full p-2 rounded-xl shadow-xl">
        <h5 className="text-xl font-bold m-2">{title}</h5>
        <MyMultiDropdownSelector
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as string[])}
          options={allTraceKeys.map((s) => ({ id: s, name: s }))}
          label={selectionLabel ?? "Items"}
          isAll
        />
        <ResponsiveContainer width={width} height={height}>
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray={"5 10"} />
            <Legend />
            <XAxis dataKey={xKey as string} />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip
              content={(props) => <MyCustomTooltip {...props} />}
              formatter={formatter}
            />
            {allTraceKeys
              .filter((s) => shownFields.includes(s))
              .map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  connectNulls={true}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
