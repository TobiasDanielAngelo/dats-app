import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";

const { slug } = getPathParts("src/components/people/EmployeeStore.tsx", "Store");

export const EmployeeFields = {
  id: { field: "ID" },
  firstName: { field: "ShortCharField" },
  lastName: { field: "ShortCharField" },
  title: { field: "ShortCharField" },
  description: { field: "MediumCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(EmployeeFields);

export class Employee extends MyModel(slug, props) {}
export class EmployeeStore extends MyStore(Employee, BASE_URL, slug) {}
export type EmployeeInterface = PropsToInterface<typeof props>;
