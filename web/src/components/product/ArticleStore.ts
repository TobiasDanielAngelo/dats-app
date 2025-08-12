import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const ArticleFields = {
  id: { field: "ID" },
  generic_product: {
    field: "CascadeRequiredForeignKey",
    fk: "GenericProduct",
  },
  brand: { field: "ShortCharField" },
  isOrig: { field: "DefaultBooleanField" },
  unit: { field: "SetNullOptionalForeignKey", fk: "Unit" },
  quantityPerUnit: { field: "LimitedIntegerField" },
  purchasePrice: { field: "LimitedDecimalField" },
  sellingPrice: { field: "LimitedDecimalField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(ArticleFields);

export class Article extends MyModel(slug, props) {}
export class ArticleStore extends MyStore(Article, BASE_URL, slug) {}
export type ArticleInterface = PropsToInterface<typeof props>;
