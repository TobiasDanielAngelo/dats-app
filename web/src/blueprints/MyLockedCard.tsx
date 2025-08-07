import type { PropsWithChildren } from "react";

export const MyLockedCard = (
  props: PropsWithChildren<{ isUnlocked?: boolean }>
) => {
  const { children, isUnlocked } = props;
  return isUnlocked ? (
    <div>{children}</div>
  ) : (
    <div
      className="pointer-events-none select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <div className="absolute inset-0 bg-transparent z-10"></div>
    </div>
  );
};
