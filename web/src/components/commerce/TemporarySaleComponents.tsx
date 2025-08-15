// TemporarySaleComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { TemporarySale, TemporarySaleFields } from "./TemporarySaleStore";

export const TemporarySaleComponents = MyGenericComponents(
  TemporarySale,
  TemporarySaleFields,
  getPathParts(import.meta.url, "Components")
);
