import { AddressComponents } from "./AddressComponents";
import { ArticleComponents } from "./ArticleComponents";
import { BarcodeComponents } from "./BarcodeComponents";
import { CategoryComponents } from "./CategoryComponents";
import { GenericProductComponents } from "./GenericProductComponents";
import { LocationComponents } from "./LocationComponents";
import { MakerComponents } from "./MakerComponents";
import { MotorComponents } from "./MotorComponents";
import { PrintJobComponents } from "./PrintJobComponents";
import { ProductImageComponents } from "./ProductImageComponents";
import { UnitComponents } from "./UnitComponents";

export const Product = {
  Category: CategoryComponents,
  GenericProduct: GenericProductComponents,
  Article: ArticleComponents,
  Barcode: BarcodeComponents,
  Address: AddressComponents,
  Location: LocationComponents,
  Maker: MakerComponents,
  Motor: MotorComponents,
  PrintJob: PrintJobComponents,
  ProductImage: ProductImageComponents,
  Unit: UnitComponents,
};
