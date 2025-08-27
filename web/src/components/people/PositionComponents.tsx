// PositionComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Position, PositionFields } from "./PositionStore";

export const PositionComponents = MyGenericComponents(
  Position,
  PositionFields,
  getPathParts("people", "Position")
);
