import { Image, Pressable } from "react-native";

const imageMap = {
  back: require("../../assets/images/back.png"),
  commerce: require("../../assets/images/commerce.png"),
  commerceInventoryLog: require("../../assets/images/commerce_inventory-log.png"),
  commerceLaborType: require("../../assets/images/commerce_labor-type.png"),
  commerceLabor: require("../../assets/images/commerce_labor.png"),
  commercePrintJob: require("../../assets/images/commerce_print-job.png"),
  commercePurchase: require("../../assets/images/commerce_purchase.png"),
  commerceSale: require("../../assets/images/commerce_sale.png"),
  finance: require("../../assets/images/finance.png"),
  financePayable: require("../../assets/images/finance_payable.png"),
  financeCategory: require("../../assets/images/finance_category.png"),
  financeReceivable: require("../../assets/images/finance_receivable.png"),
  financeAccount: require("../../assets/images/finance_account.png"),
  financeTransaction: require("../../assets/images/finance_transaction.png"),
  peopleCustomer: require("../../assets/images/people_customer.png"),
  peoplePosition: require("../../assets/images/people_position.png"),
  peopleSupplier: require("../../assets/images/people_supplier.png"),
  people: require("../../assets/images/people.png"),
  productBarcode: require("../../assets/images/product_barcode.png"),
  product: require("../../assets/images/product.png"),
  productArticle: require("../../assets/images/product_article.png"),
  productAddress: require("../../assets/images/product_address.png"),
  productCategoryComponent: require("../../assets/images/product_category-component.png"),
  productCategory: require("../../assets/images/product_category.png"),
  productGenericProduct: require("../../assets/images/product_generic-product.png"),
  productLocation: require("../../assets/images/product_location.png"),
  productMaker: require("../../assets/images/product_maker.png"),
  productMotor: require("../../assets/images/product_motor.png"),
  productPrintJob: require("../../assets/images/product_print-job.png"),
  productProductComponent: require("../../assets/images/product_product-component.png"),
  productProductImage: require("../../assets/images/product_product-image.png"),
  productUnit: require("../../assets/images/product_unit.png"),
  setting: require("../../assets/images/setting.png"),
  logout: require("../../assets/images/logout.png"),
};

export type ImageNameType = keyof typeof imageMap;

export type MyImageProps = {
  image?: ImageNameType;
  width?: number;
  height?: number;
  onPress?: () => void;
};

export const MyImage = ({
  image = "productMotor",
  width = 50,
  height = 50,
  onPress,
}: MyImageProps) => {
  const source = Object.keys(imageMap).includes(image)
    ? imageMap[image]
    : imageMap["productMotor"];

  return (
    <Pressable onPress={onPress}>
      <Image
        source={source}
        style={{ width: width, height: height }}
        resizeMode="contain"
      />
    </Pressable>
  );
};
