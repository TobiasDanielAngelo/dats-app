import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";

const { slug } = getPathParts(import.meta.url, "Store");

export const GenericProductFields = {
  id: { field: "ID" },
  category: { field: "SetNullOptionalForeignKey", fk: "Category" },
  compatibility: { field: "OptionalManyToManyField", fk: "Motor" },
  reorder_level: { field: "LimitedIntegerField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(GenericProductFields);

export class GenericProduct extends MyModel(slug, props) {}
export class GenericProductStore extends MyStore(
  GenericProduct,
  BASE_URL,
  slug
) {}
export type GenericProductInterface = PropsToInterface<typeof props>;
