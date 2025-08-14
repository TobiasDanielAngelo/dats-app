import { useState } from "react";
import { MySpinner } from "./MySpinner";
import commerce from "/images/commerce.png";
import commerceInventoryLog from "/images/commerce_inventory-log.png";
import commerceLaborType from "/images/commerce_labor-type.png";
import commerceLabor from "/images/commerce_labor.png";
import commercePrintJob from "/images/commerce_print-job.png";
import commercePurchase from "/images/commerce_purchase.png";
import commerceSale from "/images/commerce_sale.png";
import finance from "/images/finance.png";
import financePayable from "/images/finance_payable.png";
import financeCategory from "/images/finance_category.png";
import financeReceivable from "/images/finance_receivable.png";
import financeAccount from "/images/finance_account.png";
import financeTransaction from "/images/finance_transaction.png";
import peopleCustomer from "/images/people_customer.png";
import peoplePosition from "/images/people_position.png";
import peopleSupplier from "/images/people_supplier.png";
import people from "/images/people.png";
import productBarcode from "/images/product_barcode.png";
import product from "/images/product.png";
import productArticle from "/images/product_article.png";
import productAddress from "/images/product_address.png";
import productCategoryComponent from "/images/product_category-component.png";
import productCategory from "/images/product_category.png";
import productGenericProduct from "/images/product_generic-product.png";
import productLocation from "/images/product_location.png";
import productMaker from "/images/product_maker.png";
import productMotor from "/images/product_motor.png";
import productPrintJob from "/images/product_print-job.png";
import productProductComponent from "/images/product_product-component.png";
import productProductImage from "/images/product_product-image.png";
import productUnit from "/images/product_unit.png";
import setting from "/images/setting.png";
import logout from "/images/logout.png";

const IMAGES: Record<string, string> = {
  commerceInventoryLog,
  commerceLaborType,
  commerceLabor,
  commercePrintJob,
  commercePurchase,
  commerceSale,
  commerce,
  financePayable,
  financeReceivable,
  financeCategory,
  financeTransaction,
  peopleCustomer,
  peoplePosition,
  peopleSupplier,
  productBarcode,
  productArticle,
  productCategoryComponent,
  productAddress,
  finance,
  people,
  financeAccount,
  productCategory,
  productGenericProduct,
  productLocation,
  productMaker,
  productMotor,
  productPrintJob,
  productProductComponent,
  productProductImage,
  productUnit,
  product,
  setting,
  logout,
};

type MyImageProps = {
  image?: keyof typeof IMAGES;
  className?: string;
};

export const MyImage = ({
  image = "productMotor",
  className = "",
}: MyImageProps) => {
  const [loading, setLoading] = useState(true);
  return (
    <>
      <img
        src={IMAGES[image] || productMotor}
        onLoad={() => {
          setLoading(false);
        }}
        onError={() => {
          setLoading(false);
        }}
        className={className ?? "w-full h-full object-contain"}
      />
      {loading ? <MySpinner size={8} /> : <></>}
    </>
  );
};
