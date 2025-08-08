// PrintJobComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { PrintJob, PrintJobFields } from "./PrintJobStore";

export const PrintJobComponents = MyGenericComponents(
  PrintJob,
  PrintJobFields,
  getPathParts(import.meta.url, "Components")
);
