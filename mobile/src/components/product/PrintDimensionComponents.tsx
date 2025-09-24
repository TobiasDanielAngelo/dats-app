// PrintDimensionComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { PrintDimension, PrintDimensionFields } from "./PrintDimensionStore";

export const PrintDimensionComponents = MyGenericComponents(
  PrintDimension,
  PrintDimensionFields,
  getPathParts("product", "PrintDimension")
);
