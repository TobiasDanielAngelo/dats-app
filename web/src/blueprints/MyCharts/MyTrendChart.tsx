import { observer } from "mobx-react-lite";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COLORS, type MyTrendChartProps, useTrendChart } from ".";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";
import { MyCustomTooltip } from "./MyCustomToolTip";

export const MyAreaChart = observer(
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
          <AreaChart data={transformedData}>
            <CartesianGrid strokeDasharray={"5 10"} />
            <Legend />
            <XAxis dataKey={xKey as string} />
            <YAxis />
            <Tooltip
              content={(props) => <MyCustomTooltip {...props} />}
              formatter={formatter}
            />
            {allTraceKeys
              .filter((s) => shownFields.includes(s))
              .map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
