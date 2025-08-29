import { model, Model } from "mobx-keystone";
import { storesToProps } from "../../blueprints/MyGenericComponents/MyGenericStore";
import { AddressStore } from "./AddressStore";
import { ArticleStore } from "./ArticleStore";
import { BarcodeStore } from "./BarcodeStore";
import { CategoryStore } from "./CategoryStore";
import { GenericProductStore } from "./GenericProductStore";
import { LocationStore } from "./LocationStore";
import { MakerStore } from "./MakerStore";
import { MotorStore } from "./MotorStore";
import { PrintJobStore } from "./PrintJobStore";
import { ProductImageStore } from "./ProductImageStore";
import { UnitStore } from "./UnitStore";
import { PrintDimensionStore } from "./PrintDimensionStore";

@model("myApp/ProductStore")
export class ProductStore extends Model(
  storesToProps({
    BarcodeStore,
    CategoryStore,
    GenericProductStore,
    LocationStore,
    MakerStore,
    MotorStore,
    PrintJobStore,
    ArticleStore,
    AddressStore,
    ProductImageStore,
    UnitStore,
    PrintDimensionStore,
  })
) {}
