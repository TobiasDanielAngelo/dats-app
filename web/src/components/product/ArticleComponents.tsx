// ArticleComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Article, ArticleFields } from "./ArticleStore";

export const ArticleComponents = MyGenericComponents(
  Article,
  ArticleFields,
  getPathParts(import.meta.url, "Components")
);
