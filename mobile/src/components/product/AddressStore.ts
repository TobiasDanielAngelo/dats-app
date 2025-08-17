import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

export const AddressIdMap = {
  "Gen Luna": -1,
} as const;

const { slug } = getPathParts("product", "Address");

export const AddressFields = {
  id: { field: "ID" },
  name: { field: "MediumCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(AddressFields);

export class Address extends MyModel(slug, props) {}
export class AddressStore extends MyStore(Address, BASE_URL, slug) {}
export type AddressInterface = PropsToInterface<typeof props>;
