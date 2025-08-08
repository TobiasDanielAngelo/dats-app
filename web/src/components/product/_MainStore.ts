import { model, Model } from "mobx-keystone";
import { storesToProps } from "../../blueprints/MyGenericComponents/MyGenericStore";
import { BarcodeStore } from "./BarcodeStore";
import { CategoryStore } from "./CategoryStore";
import { CategoryComponentStore } from "./CategoryComponentStore";
import { GenericProductStore } from "./GenericProductStore";
import { LocationStore } from "./LocationStore";
import { MakerStore } from "./MakerStore";
import { MotorStore } from "./MotorStore";
import { PrintJobStore } from "./PrintJobStore";
import { ArticleStore } from "./ArticleStore";
import { ProductComponentStore } from "./ProductComponentStore";
import { ProductImageStore } from "./ProductImageStore";
import { UnitStore } from "./UnitStore";

@model("myApp/ProductStore")
export class ProductStore extends Model(
  storesToProps({
    BarcodeStore,
    CategoryStore,
    CategoryComponentStore,
    GenericProductStore,
    LocationStore,
    MakerStore,
    MotorStore,
    PrintJobStore,
    ArticleStore,
    ProductComponentStore,
    ProductImageStore,
    UnitStore,
  })
) {}
