import { BASE_URL } from "../../constants/constants";
import { DjangoModelField, fieldToProps } from "../../constants/djangoHelpers";
import { getPathParts } from "../../constants/helpers";
import { PropsToInterface } from "../../constants/interfaces";
import {
  MyModel,
  MyStore,
} from "../../blueprints/MyGenericComponents/MyGenericStore";

export const LocationIdMap = {
  "Gen Luna Main": -1,
  "Gen Luna Storage": -2,
} as const;

const { slug } = getPathParts(import.meta.url, "Store");

export const LocationFields = {
  id: { field: "ID" },
  address: { field: "CascadeRequiredForeignKey", fk: "Address" },
  shelf: { field: "ShortCharField" },
} satisfies Record<string, DjangoModelField>;

const props = fieldToProps(LocationFields);

export class Location extends MyModel(slug, props) {}
export class LocationStore extends MyStore(Location, BASE_URL, slug) {}
export type LocationInterface = PropsToInterface<typeof props>;
