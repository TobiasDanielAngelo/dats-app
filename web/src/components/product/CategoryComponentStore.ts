import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const CategoryComponentFields = {
  id: { field: "ID" },
  kit: { field: "CascadeRequiredForeignKey", fk: "Category" },
  percentCost: { field: "LimitedDecimalField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(CategoryComponentFields);

export class CategoryComponent extends MyModel(slug, props) {}
export class CategoryComponentStore extends MyStore(
  CategoryComponent,
  BASE_URL,
  slug
) {}
export type CategoryComponentInterface = PropsToInterface<typeof props>;
