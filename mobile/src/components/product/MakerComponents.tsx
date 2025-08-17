// MakerComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Maker, MakerFields } from "./MakerStore";

export const MakerComponents = MyGenericComponents(
  Maker,
  MakerFields,
  getPathParts("product", "Maker")
);
