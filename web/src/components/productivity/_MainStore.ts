import { model, Model } from "mobx-keystone";
import { storesToProps } from "../../blueprints/MyGenericComponents/MyGenericStore";
import { LogStore } from "./LogStore";
import { TaskStore } from "./TaskStore";

@model("myApp/Productivity")
export class ProductivityStore extends Model(
  storesToProps({
    TaskStore,
    LogStore,
  })
) {}
