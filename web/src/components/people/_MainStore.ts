import { model, Model } from "mobx-keystone";
import { storesToProps } from "../../blueprints/MyGenericComponents/MyGenericStore";
import { CustomerStore } from "./CustomerStore";
import { PositionStore } from "./PositionStore";
import { SupplierStore } from "./SupplierStore";
import { EmployeeStore } from "./EmployeeStore";

@model("myApp/PeopleStore")
export class PeopleStore extends Model(
  storesToProps({
    CustomerStore,
    PositionStore,
    SupplierStore,
    EmployeeStore,
  })
) {}
