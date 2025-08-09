import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const ProductComponentFields = {
  id: { field: "ID" },
  kit: { field: "CascadeRequiredForeignKey", fk: "Article" },
  component: {
    field: "CascadeRequiredForeignKey",
    fk: "Article",
  },
  percent_cost: { field: "LimitedDecimalField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(ProductComponentFields);

export class ProductComponent extends MyModel(slug, props) {}
export class ProductComponentStore extends MyStore(
  ProductComponent,
  BASE_URL,
  slug
) {}
export type ProductComponentInterface = PropsToInterface<typeof props>;
