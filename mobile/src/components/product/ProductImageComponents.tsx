// ProductImageComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { ProductImage, ProductImageFields } from "./ProductImageStore";

export const ProductImageComponents = MyGenericComponents(
  ProductImage,
  ProductImageFields,
  getPathParts("product", "ProductImage")
);
