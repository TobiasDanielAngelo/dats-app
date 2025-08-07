import { TooltipContentProps } from "recharts";

export const MyCustomTooltip = ({
  active,
  payload,
  label,
  formatter,
}: TooltipContentProps<any, any>) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="p-2 rounded bg-teal-100 dark:bg-gray-700 border border-teal-400 gray-shadow text-sm dark:text-white">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry, index) => {
        const formatted = formatter
          ? formatter?.(entry.value, entry.name, entry, index, payload)
          : entry.value;

        const [valueFormatted, nameFormatted] = Array.isArray(formatted)
          ? formatted
          : [formatted, entry.name];

        return (
          <p key={index} style={{ color: entry.color }}>
            {nameFormatted}: <strong>{valueFormatted}</strong>
          </p>
        );
      })}
    </div>
  );
};
