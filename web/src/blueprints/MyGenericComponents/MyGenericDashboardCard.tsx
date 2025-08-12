import { type PropsWithChildren } from "react";

export const DashboardCard = (
  props: PropsWithChildren<{
    stats: number;
    title: string;
    change?: number;
  }>
) => {
  const { stats, title, change, children } = props;

  return (
    <div
      className="flex flex-row rounded-xl shadow-md h-[100px] p-2 shrink-0 border border-teal-800 dark:bg-gray-900"
      style={{
        boxShadow: "6px 6px 12px black",
      }}
    >
      <div className="rounded-lg border-2 items-center my-auto p-5 mx-5 bg-gradient-to-br from-blue-900 via-blue-500 to-blue-700">
        {children}
      </div>
      <div>
        <div className="text-sm text-gray-500 font-bold">{title}</div>
        <div className="text-lg">
          <span className="font-bold">{stats.toFixed(2)}</span>
          <span className="text-md text-gray-500">
            {change ? ` (+${change?.toFixed(1)})` : ""}
          </span>
        </div>
      </div>
    </div>
  );
};
