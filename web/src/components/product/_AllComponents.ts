import { BarcodeComponents } from "./BarcodeComponents";
import { CategoryComponents } from "./CategoryComponents";
import { CategoryComponentComponents } from "./CategoryComponentComponents";
import { GenericProductComponents } from "./GenericProductComponents";
import { LocationComponents } from "./LocationComponents";
import { MakerComponents } from "./MakerComponents";
import { MotorComponents } from "./MotorComponents";
import { PrintJobComponents } from "./PrintJobComponents";
import { ArticleComponents } from "./ArticleComponents";
import { ProductComponentComponents } from "./ProductComponentComponents";
import { ProductImageComponents } from "./ProductImageComponents";
import { UnitComponents } from "./UnitComponents";

export const Product = {
  Article: ArticleComponents,
  Barcode: BarcodeComponents,
  Category: CategoryComponents,
  CategoryComponent: CategoryComponentComponents,
  GenericProduct: GenericProductComponents,
  Location: LocationComponents,
  Maker: MakerComponents,
  Motor: MotorComponents,
  PrintJob: PrintJobComponents,
  ProductComponent: ProductComponentComponents,
  ProductImage: ProductImageComponents,
  Unit: UnitComponents,
};
