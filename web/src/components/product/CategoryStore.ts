import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts("product", "Category");

export const CategoryFields = {
  id: { field: "ID" },
  name: { field: "ShortCharField" },
  isKit: { field: "DefaultBooleanField" },
  isUniversal: { field: "DefaultBooleanField" },
  parentCategory: { field: "SetNullOptionalForeignKey", fk: "Category" },
  notes: { field: "MediumCharField" },
  priceMatrix: { field: "TwoDimArrayField", readOnly: true },
  compatibilityMatrix: { field: "TwoDimArrayField", readOnly: true },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(CategoryFields);

export class Category extends MyModel(slug, props) {}
export class CategoryStore extends MyStore(Category, BASE_URL, slug) {}
export type CategoryInterface = PropsToInterface<typeof props>;
