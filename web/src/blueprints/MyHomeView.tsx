import type { PropsWithChildren } from "react";

export const HomeView = (props: PropsWithChildren<{}>) => {
  const { children } = props;

  return (
    <div className="relative min-h-[calc(88vh)] bg-blue-50 dark:bg-black">
      {children}
    </div>
  );
};
