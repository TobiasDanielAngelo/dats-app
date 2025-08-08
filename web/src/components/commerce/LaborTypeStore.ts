import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const LaborTypeFields = {
  id: { field: "ID" },
  name: { field: "ShortCharField" },
  description: { field: "MediumCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(LaborTypeFields);

export class LaborType extends MyModel(slug, props) {}
export class LaborTypeStore extends MyStore(LaborType, BASE_URL, slug) {}
export type LaborTypeInterface = PropsToInterface<typeof props>;
