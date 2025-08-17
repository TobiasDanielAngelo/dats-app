// LocationComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Location, LocationFields } from "./LocationStore";

export const LocationComponents = MyGenericComponents(
  Location,
  LocationFields,
  getPathParts("product", "Location")
);
