// CategoryComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Category, CategoryFields } from "./CategoryStore";

export const CategoryComponents = MyGenericComponents(
  Category,
  CategoryFields,
  getPathParts("product", "Category")
);
