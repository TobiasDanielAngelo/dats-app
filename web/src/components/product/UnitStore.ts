import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

const { slug } = getPathParts("product", "Unit");

export const UnitIdMap = {
  pcs: -1,
  set: -2,
  ft: -3,
  m: -4,
};

export const UnitFields = {
  id: { field: "ID" },
  name: { field: "ShortCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(UnitFields);

export class Unit extends MyModel(slug, props) {}
export class UnitStore extends MyStore(Unit, BASE_URL, slug) {}
export type UnitInterface = PropsToInterface<typeof props>;
