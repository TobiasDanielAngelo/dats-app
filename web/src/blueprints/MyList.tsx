import type { PropsWithChildren } from "react";

export const MyList = (props: PropsWithChildren<{ title: string }>) => {
  const { children, title } = props;
  return (
    <div>
      <h1 className="text-xl mt-4 ml-4 text-left font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
        {title}
      </h1>
      <div className="relative my-2 md:ml-6 mr-3 ml-3 overflow-y-scroll scrollbar scrollbar-thin scrollbar-thumb-gray-300 scrollbar-rounded-[12px] scrollbar-mx-10 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-900">
        <div className="h-96 py-2">{children}</div>
      </div>
    </div>
  );
};
