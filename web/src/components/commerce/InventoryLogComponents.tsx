import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { InventoryLog, InventoryLogFields } from "./InventoryLogStore";

export const { Form: InventoryLogForm, Filter: InventoryLogFilter } =
  MyGenericComponents(
    InventoryLog,
    InventoryLogFields,
    getPathParts(import.meta.url, "Components")
  );
