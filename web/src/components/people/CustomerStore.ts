import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";

const { slug } = getPathParts("people", "Customer");

export const CustomerFields = {
  id: { field: "ID" },
  name: { field: "ShortCharField" },
  phone: { field: "ShortCharField" },
  address: { field: "MediumCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(CustomerFields);

export class Customer extends MyModel(slug, props) {}
export class CustomerStore extends MyStore(Customer, BASE_URL, slug) {}
export type CustomerInterface = PropsToInterface<typeof props>;
