// GenericProductComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { GenericProduct, GenericProductFields } from "./GenericProductStore";

export const GenericProductComponents = MyGenericComponents(
  GenericProduct,
  GenericProductFields,
  getPathParts("product", "GenericProduct")
);
