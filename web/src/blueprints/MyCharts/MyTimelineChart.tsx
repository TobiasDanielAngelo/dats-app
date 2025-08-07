import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const rawData = [
  { date: "2025-06-01", events: 2 },
  { date: "2025-06-02", events: 4 },
  { date: "2025-06-04", events: 1 },
];

type TimelinePoint = { date: string; events: number };

export function fillMissingDatesWithNulls(
  data: TimelinePoint[],
  startDate: string,
  endDate: string
) {
  const result: { date: string; events: number | null }[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  const map: Record<string, number> = Object.fromEntries(
    data.map(({ date, events }) => [date, events])
  );

  while (current <= end) {
    const key = current.toISOString().slice(0, 10);
    result.push({
      date: key,
      events: key in map ? map[key] : null,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

const timelineData = fillMissingDatesWithNulls(
  rawData,
  "2025-06-01",
  "2025-06-05"
);

export default function MyTimelineChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={timelineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="events"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
