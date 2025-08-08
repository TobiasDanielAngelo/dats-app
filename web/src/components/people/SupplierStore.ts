import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";

const { slug } = getPathParts(import.meta.url, "Store");

export const SupplierFields = {
  id: { field: "ID" },
  name: { field: "ShortCharField" },
  contact_person: { field: "ShortCharField" },
  email: { field: "ShortCharField" },
  phone: { field: "ShortCharField" },
  address: { field: "MediumCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(SupplierFields);

export class Supplier extends MyModel(slug, props) {}
export class SupplierStore extends MyStore(Supplier, BASE_URL, slug) {}
export type SupplierInterface = PropsToInterface<typeof props>;
