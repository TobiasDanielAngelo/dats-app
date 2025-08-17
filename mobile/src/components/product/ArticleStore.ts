import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts("product", "Article");

export const ArticleFields = {
  id: { field: "ID" },
  genericProduct: {
    field: "CascadeRequiredForeignKey",
    fk: "GenericProduct",
  },
  brand: { field: "ShortCharField" },
  isOrig: { field: "DefaultBooleanField" },
  unit: { field: "SetNullOptionalForeignKey", fk: "Unit" },
  quantityPerUnit: { field: "LimitedIntegerField" },
  purchasePrice: { field: "LimitedDecimalField" },
  sellingPrice: { field: "LimitedDecimalField" },
  parentArticle: { field: "SetNullOptionalForeignKey", fk: "Article" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(ArticleFields);

export class Article extends MyModel(slug, props) {}
export class ArticleStore extends MyStore(Article, BASE_URL, slug) {}
export type ArticleInterface = PropsToInterface<typeof props>;
