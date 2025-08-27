import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";

const { slug } = getPathParts("product", "Motor");

export const MotorFields = {
  id: { field: "ID" },
  maker: { field: "SetNullOptionalForeignKey", fk: "Maker" },
  model: { field: "ShortCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(MotorFields);

export class Motor extends MyModel(slug, props) {}
export class MotorStore extends MyStore(Motor, BASE_URL, slug) {}
export type MotorInterface = PropsToInterface<typeof props>;
