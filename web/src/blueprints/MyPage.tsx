import { PropsWithChildren } from "react";

export const MyPage = (props: PropsWithChildren<{}>) => {
  const { children } = props;
  return (
    <div className="py-5 px-5">
      <div className="bg-white min-h-[calc(80vh)] dark:bg-gray-900 px-8 py-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-full sm:rounded-lg sm:px-10">
        {children}
      </div>
    </div>
  );
};
