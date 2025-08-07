import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MyCustomTooltip } from "./MyCustomToolTip";

export const composedData = [
  { name: "Jan", uv: 400, pv: 240, amt: 2400 },
  { name: "Feb", uv: 300, pv: 456, amt: 2210 },
  { name: "Mar", uv: 200, pv: 139, amt: 2290 },
];

/**
 * ComposedChart Component
 *
 * Combines multiple chart types (e.g., line + bar + area).
 *
 * Data shape:
 * [
 *   { name: string; barVal: number; lineVal: number; areaVal: number },
 *   ...
 * ]
 *
 * Props:
 * - data: array of mixed metric items
 * - dataKeys: multiple keys (one per chart type)
 *
 * Best for:
 * - Showing relationships between multiple metrics
 * - Layered analytics
 */
export const MyComposedChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <ComposedChart data={composedData}>
      <CartesianGrid strokeDasharray={"5 10"} />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip content={(props) => <MyCustomTooltip {...props} />} />
      <Legend />
      <Area dataKey="amt" fill="#8884d8" stroke="#8884d8" />
      <Bar dataKey="pv" barSize={20} fill="#413ea0" />
      <Line type="monotone" dataKey="uv" stroke="#ff7300" />
    </ComposedChart>
  </ResponsiveContainer>
);
