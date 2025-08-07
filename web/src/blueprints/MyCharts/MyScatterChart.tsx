import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MyCustomTooltip } from "./MyCustomToolTip";

export const scatterData = [
  { x: 100, y: 200 },
  { x: 120, y: 100 },
  { x: 170, y: 300 },
  { x: 140, y: 250 },
];

/**
 * ScatterChart Component
 *
 * Displays correlation between two numerical values.
 *
 * Data shape:
 * [
 *   { x: number; y: number },
 *   ...
 * ]
 *
 * Props:
 * - data: list of points
 * - x/y: specify axis keys
 *
 * Best for:
 * - Correlation and distribution analysis
 * - Detecting outliers
 */
export const MyScatterChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <ScatterChart>
      <CartesianGrid strokeDasharray={"5 10"} />
      <XAxis dataKey="x" name="X" />
      <YAxis dataKey="y" name="Y" />
      <Tooltip
        content={(props) => <MyCustomTooltip {...props} />}
        cursor={{ strokeDasharray: "3 3" }}
      />
      <Scatter name="A" data={scatterData} fill="#8884d8" />
    </ScatterChart>
  </ResponsiveContainer>
);
