import { type PropsWithChildren } from "react";

export const MySettingsPage = (props: PropsWithChildren<{}>) => {
  const { children } = props;
  return (
    <div className="min-w-2xl min-h-[70vh] mx-auto bg-gray-50 p-4 rounded-lg dark:bg-gray-800 border-b border-teal-200 dark:border-gray-700">
      <div className="text-gray-500 dark:text-gray-400 text-sm">{children}</div>
    </div>
  );
};
