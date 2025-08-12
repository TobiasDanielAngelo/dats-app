import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts(import.meta.url, "Store");

export const LaborFields = {
  id: { field: "ID" },
  sale: { field: "CascadeRequiredForeignKey", fk: "Sale" },
  employees: {
    field: "OptionalManyToManyField",
    fk: "Employee",
    appFK: "People",
  },
  laborLype: {
    field: "SetNullOptionalForeignKey",
    fk: "LaborType",
  },
  description: { field: "MediumCharField" },
  cost: { field: "AmountField" },
  compensationAmount: { field: "AmountField" },
  isPaid: { field: "DefaultBooleanField" },
  paidAt: { field: "OptionalDateTimeField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(LaborFields);

export class Labor extends MyModel(slug, props) {}
export class LaborStore extends MyStore(Labor, BASE_URL, slug) {}
export type LaborInterface = PropsToInterface<typeof props>;
