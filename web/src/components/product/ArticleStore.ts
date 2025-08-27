import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { UnitIdMap } from "./UnitStore";

const { slug } = getPathParts("product", "Article");

export const ArticleFields = {
  id: { field: "ID" },
  genericProduct: {
    field: "CascadeRequiredForeignKey",
    fk: "GenericProduct",
  },
  isOrig: { field: "DefaultBooleanField" },
  unit: {
    field: "SetNullOptionalForeignKey",
    fk: "Unit",
    defaultValue: UnitIdMap["pcs"],
  },
  quantityPerUnit: { field: "LimitedIntegerField" },
  purchasePrice: { field: "AmountField" },
  sellingPrice: { field: "AmountField" },
  parentArticle: { field: "SetNullOptionalForeignKey", fk: "Article" },
  brand: { field: "ShortCharField", searchable: true },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(ArticleFields);

export class Article extends MyModel(slug, props) {}
export class ArticleStore extends MyStore(Article, BASE_URL, slug) {}
export type ArticleInterface = PropsToInterface<typeof props>;
