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
  pistonPinSize: { field: "LimitedDecimalField", readOnly: true },
  pistonBore00: { field: "LimitedDecimalField", readOnly: true },
  pistonBore25: { field: "LimitedDecimalField", readOnly: true },
  pistonBore50: { field: "LimitedDecimalField", readOnly: true },
  pistonBore75: { field: "LimitedDecimalField", readOnly: true },
  pistonBore100: { field: "LimitedDecimalField", readOnly: true },
  pistonBore150: { field: "LimitedDecimalField", readOnly: true },
  pistonBore200: { field: "LimitedDecimalField", readOnly: true },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(MotorFields);

export class Motor extends MyModel(slug, props) {}
export class MotorStore extends MyStore(Motor, BASE_URL, slug) {}
export type MotorInterface = PropsToInterface<typeof props>;
