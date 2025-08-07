import { type PropsWithChildren, useRef } from "react";
import { MyToolTip } from "./MyToolTip";

export const GuidedDiv = (
  props: PropsWithChildren<{
    title: React.ReactNode;
    className?: string;
    hidden?: boolean;
    onClick?: () => void;
  }>
) => {
  const { children, title, className, hidden, onClick } = props;
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={className ?? "text-blue-500 cursor-pointer"}
      onClick={onClick}
    >
      <MyToolTip parentRef={ref} hidden={hidden}>
        {title}
      </MyToolTip>
      {children}
    </div>
  );
};
