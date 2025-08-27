// MotorComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Motor, MotorFields } from "./MotorStore";

export const MotorComponents = MyGenericComponents(
  Motor,
  MotorFields,
  getPathParts("product", "Motor")
);
