import React from "react";

type PrivilegeWrapperProps = {
  requiredLevel: number;
  userLevel: number;
  mode?: "hidden" | "disabled";
  children: React.ReactNode;
};

export const PrivilegeWrapper: React.FC<PrivilegeWrapperProps> = ({
  requiredLevel,
  userLevel,
  mode = "disabled",
  children,
}) => {
  const allowed = userLevel >= requiredLevel;

  if (!allowed) {
    if (mode === "hidden") return null;
    return (
      <div style={{ pointerEvents: "none", opacity: 0.5 }}>{children}</div>
    );
  }

  return <>{children}</>;
};
