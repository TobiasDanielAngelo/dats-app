// EmployeeComponents.tsx
import { MyGenericComponents } from "../../blueprints/MyGenericComponents/MyGenericComponents";
import { getPathParts } from "../../constants/helpers";
import { Employee, EmployeeFields } from "./EmployeeStore";

export const EmployeeComponents = MyGenericComponents(
  Employee,
  EmployeeFields,
  getPathParts("people", "Employee")
);
