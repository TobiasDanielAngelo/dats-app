import { observer } from "mobx-react-lite";
import {
  Cell,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MyCircleChartProps, useCircleChart } from ".";
import { formatValue } from "../../constants/JSXHelpers";
import { MyDropdownSelector } from "../MyDropdownSelector";
import { MyCustomTooltip } from "./MyCustomToolTip";

// Custom label component
const CustomLabel = ({
  percent,
  name,
  value,
  fill,
  x,
  y,
  cx,
  cy,
  data,
  formatter,
}: PieLabelRenderProps) => {
  if (percent && percent > 0.01 && cx && cy) {
    // Splitting the label into multiple lines
    const formattedValue = formatter(value, name)[0];
    const label = `${String(name)}\n${(percent * 100).toFixed(
      1
    )}%\n${formattedValue}`;

    // Calculate the angle to adjust the dy based on the label's position

    const allX = data.map((_: any, i: number) => {
      const angle = (360 / data.length) * i;
      const radian = (angle * Math.PI) / 180;
      const offsetX = (cx as number) + Math.cos(radian) * 150; // Calculate the x position
      return offsetX;
    });

    const allY = data.map((_: any, i: number) => {
      const angle = (360 / data.length) * i;
      const radian = (angle * Math.PI) / 180;
      const offsetY = (cy as number) + Math.sin(radian) * 150; // Calculate the y position
      return offsetY;
    });
    const isAbove = y < Math.min(...allY); // Check if the label is higher than all other labels
    const isLeft = x < Math.min(...allX); // Label is to the left if its x is smaller than all others

    // Adjust dy dynamically: move label up or down based on its position
    const dyAdjustment = isAbove ? -40 : 5; // Negative for upper half, positive for lower half
    const dxAdjustment = isLeft ? -60 : 15;
    return (
      <text
        x={x}
        y={y}
        dx={dxAdjustment}
        dy={dyAdjustment}
        fontSize={15}
        style={{ whiteSpace: "pre-line" }}
        fill={fill}
      >
        {label}
      </text>
    );
  }

  return null; // Return nothing if the condition isn't met
};

/**
 * PieChart Component
 *
 * Shows part-to-whole relationships (e.g., budget allocation).
 *
 * Data shape:
 * [
 *   { name: string; value: number },
 *   ...
 * ]
 *
 * Props:
 * - data: list of segments
 * - dataKey: key to extract slice size, i.e. value
 * - nameKey: label to show, i.e. name
 *
 * Best for:
 * - Distribution breakdowns
 */
export const MyPieChart = observer(
  <T extends Record<string, any>>({
    data,
    width = "100%",
    height = "80%",
    colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"],
    dataKey,
    nameKey,
    traceKey,
    itemMap,
    related,
    formatter,
    selectionLabel,
    title = "",
  }: MyCircleChartProps<T>) => {
    const { selectedField, setSelectedField, resolvedData } = useCircleChart(
      data,
      nameKey,
      dataKey,
      traceKey,
      itemMap,
      related
    );

    return (
      <div className="w-full h-full p-4 rounded-xl shadow-xl">
        <h5 className="text-xl font-bold m-2">{title}</h5>
        <MyDropdownSelector
          value={selectedField}
          onChangeValue={setSelectedField}
          options={Array.from(
            new Set(data.map((s) => s[traceKey as string]))
          ).map((s) => {
            const relatedName = related?.find(
              (t) => t.id === s && t.field === traceKey
            )?.name;

            return {
              id: s,
              name: formatValue(
                relatedName ?? s,
                traceKey as string,
                [],
                itemMap?.find((s) => s.key === traceKey)
              ),
            };
          })}
          label={selectionLabel ?? "Traces"}
        />
        <ResponsiveContainer width={width} height={height}>
          <PieChart>
            <Tooltip
              content={(props) => <MyCustomTooltip {...props} />}
              formatter={formatter}
            />
            <Pie
              data={resolvedData}
              nameKey={nameKey as string}
              dataKey={dataKey as string}
              cx="50%"
              cy="50%"
              outerRadius={"60%"}
              innerRadius={"30%"}
              fill="#8884d8"
              label={(props) => (
                <CustomLabel
                  {...props}
                  data={resolvedData}
                  formatter={formatter}
                />
              )}
              labelLine={() => <></>}
            >
              {resolvedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
