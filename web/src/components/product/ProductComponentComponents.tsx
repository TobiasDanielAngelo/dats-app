// ProductComponentComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { ProductComponent, ProductComponentFields } from "./ProductComponentStore";

export const ProductComponentComponents = MyGenericComponents(
  ProductComponent,
  ProductComponentFields,
  getPathParts(import.meta.url, "Components")
);
