import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";

const { slug } = getPathParts("people", "Position");

export const PositionFields = {
  id: { field: "ID" },
  title: { field: "ShortCharField" },
  description: { field: "MediumCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(PositionFields);

export class Position extends MyModel(slug, props) {}
export class PositionStore extends MyStore(Position, BASE_URL, slug) {}
export type PositionInterface = PropsToInterface<typeof props>;
