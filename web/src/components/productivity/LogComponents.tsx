// LogComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Log, LogFields } from "./LogStore";

export const LogComponents = MyGenericComponents(
  Log,
  LogFields,
  getPathParts("productivity", "Log")
);
