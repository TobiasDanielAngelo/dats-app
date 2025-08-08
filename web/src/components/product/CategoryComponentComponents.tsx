import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import {
  CategoryComponent,
  CategoryComponentFields,
} from "./CategoryComponentStore";

export const CategoryComponentComponents = MyGenericComponents(
  CategoryComponent,
  CategoryComponentFields,
  getPathParts(import.meta.url, "Components")
);
