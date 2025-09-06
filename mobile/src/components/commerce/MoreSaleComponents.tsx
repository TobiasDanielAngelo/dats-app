import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MyTable } from "../../blueprints/MyTable";
import { winHeight, winWidth } from "../../constants/constants";
import { useVisible } from "../../constants/hooks";
import { useStore } from "../core/Store";
import { Commerce } from "./_AllComponents";
import { Sale } from "./SaleStore";
import { TemporarySale } from "./TemporarySaleStore";
import { saveImageToDownloads } from "./SaveImage";
import { MyButton, MyCheckBox } from "../../blueprints";
import AvatarSelector from "../../blueprints/AvatarSelector";
import { getKeyByValue, sortByKey, toOptions } from "../../constants/helpers";
import { UnitIdMap } from "../product/UnitStore";
import { StateSetter } from "../../constants/interfaces";

const TempSaleRow = ({
  item,
  uneditable,
}: {
  item: TemporarySale;
  uneditable?: boolean;
}) => {
  const { isVisible2, setVisible2 } = useVisible();

  return (
    <View>
      <MyModal
        isVisible={isVisible2}
        setVisible={setVisible2}
        title={`Set Details`}
      >
        <Commerce.TemporarySale.Form
          item={item.$ as any}
          setVisible={setVisible2}
          hiddenFields={["sale"]}
        />
      </MyModal>
      <Text
        style={
          uneditable ? {} : { color: "blue", textDecorationLine: "underline" }
        }
        onPress={() => !uneditable && setVisible2(true)}
      >
        {splitEveryNWords(item.displayName, 2).toUpperCase()}
      </Text>
    </View>
  );
};

function splitEveryNWords(text: string, n = 5): string {
  const words = text.trim().split(/\s+/);
  const result: string[] = [];

  for (let i = 0; i < words.length; i += n) {
    result.push(words.slice(i, i + n).join(" "));
  }

  return result.join("\n");
}

const SaleTable = observer(
  ({
    tempSaleItems,
    item,
    uneditable,
  }: {
    tempSaleItems: TemporarySale[];
    item?: Sale;
    uneditable?: boolean;
  }) => {
    const { isVisible1, setVisible1 } = useVisible();

    const matrix = [
      ["#", "Unit", "Item Description", "U/P", "Tot."],
      ...tempSaleItems.map((s) => [
        s.quantity,
        getKeyByValue(UnitIdMap, s.unit ?? -1),
        <TempSaleRow item={s} />,
        s.unitAmount,
        s.quantity * s.unitAmount,
      ]),
      [
        "",
        "",
        !uneditable && (
          <MyIcon
            icon="plus"
            onPress={() => setVisible1(true)}
            size={15}
            color="blue"
          />
        ),
        "",
        "",
        "",
      ],
    ];

    return (
      <View>
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Commerce.TemporarySale.Form
            item={{
              sale: item?.id as number,
              quantity: 1,
              unitAmount: 0,
              unit: UnitIdMap["pcs"],
            }}
            setVisible={setVisible1}
            hiddenFields={["sale"]}
          />
        </MyModal>
        <View style={{ flex: 1 }}>
          <MyTable
            matrix={matrix}
            widths={[0.1, 0.13, 0.4, 0.15, 0.15].map((s) => winWidth * s)}
          />
        </View>
      </View>
    );
  }
);

export const SaleQuickView = observer(() => {
  const { commerceStore, peopleStore } = useStore();
  const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
  const [sale, setSale] = useState<number | null>(-1);
  const currentSale = commerceStore.saleStore.allItems.get(sale ?? -1);
  const currentSaleImages = currentSale
    ? sortByKey(commerceStore.saleReceiptStore.items, "id").filter(
        (s) => s.sale === currentSale.id
      )
    : [];

  // const currentPrintJob = commerceStore.printJobStore.items.find(
  //   (s) => s.sale === sale
  // );

  // const currentImage = currentPrintJob?.image;

  const tempSaleItems = commerceStore.temporarySaleStore.items.filter(
    (t) => t.sale === sale
  );

  const onPressPrint = async () => {
    if (!currentSale) return;
    await commerceStore.saleReceiptStore.resetItems();
    await commerceStore.saleStore.updateItem(currentSale.id, { toPrint: true });
    await commerceStore.saleReceiptStore.fetchAll(`sale=${currentSale.id}`);
    setVisible2(true);
  };

  useEffect(() => {
    setSale(Math.max(...commerceStore.saleStore.pageDetails.ids));
  }, [commerceStore.saleStore.pageDetails.ids.length]);

  useEffect(() => {
    commerceStore.saleStore.fetchAll(
      `created_at__date=${new Date().toISOString().split("T")[0]}`
    );
    commerceStore.saleStore.fetchAll(`status=0`);
    peopleStore.supplierStore.fetchAll("page=all");
  }, []);

  useEffect(() => {
    if (sale && sale > 0) {
      commerceStore.temporarySaleStore.fetchAll("sale=" + sale);
    }
  }, [sale]);

  return (
    <>
      <View style={{ margin: 10, flex: 1 }}>
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Commerce.Sale.Form
            setVisible={setVisible1}
            hiddenFields={["status"]}
          />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2}>
          <FlatList
            data={currentSaleImages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item: s }) => (
              <>
                <Image
                  source={{ uri: s.image ?? "" }}
                  height={0.6 * winHeight}
                  resizeMode="contain"
                />
                <MyButton
                  label="Print"
                  onPress={async () =>
                    commerceStore.saleReceiptStore.updateItem(s.id, {
                      toPrint: true,
                    })
                  }
                />
              </>
            )}
          />

          {/* {currentPrintJob && (
            <View>
              <Text>
                {currentPrintJob.toPrint ? "To Print" : "Not Printing"}
              </Text>
              <MyButton
                label="Print"
                onPress={() =>
                  commerceStore.printJobStore.updateItem(currentPrintJob.id, {
                    toPrint: !currentPrintJob.toPrint,
                  })
                }
              />
              <Image
                source={{ uri: currentImage as string }}
                height={0.7 * winHeight}
                resizeMode="contain"
              />
            </View>
          )} */}
        </MyModal>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 15 }}>Sale Order</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <Text
              onPress={() => setVisible1(true)}
              style={{
                fontSize: 15,
                color: "blue",
                textDecorationLine: "underline",
                fontWeight: "bold",
              }}
            >
              {moment(currentSale?.createdAt).format("MMM D, hA")}{" "}
              {currentSale?.customer}
            </Text>
            <MyIcon
              icon="plus"
              size={20}
              color="blue"
              onPress={() => setVisible1(true)}
            />
          </View>
        </View>
        <AvatarSelector
          options={commerceStore.saleStore.items.map((s) => ({
            id: s.id,
            name: s.displayName,
            icon: "user",
            color:
              sale === s.id
                ? "white"
                : s.status === 2
                ? "rgba(200,200,0,0.4)"
                : "transparent",
          }))}
          value={sale}
          onChangeValue={setSale as StateSetter<string | number | null>}
        />
        <ScrollView>
          <Text>{currentSale?.displayName}</Text>
          {sale && sale > 0 && (
            <SaleTable item={currentSale} tempSaleItems={tempSaleItems} />
          )}
        </ScrollView>
        <View
          style={{
            position: "absolute",
            padding: 10,
            bottom: 1,
            right: 1,
          }}
        >
          {currentSale ? (
            <MyCheckBox
              value={currentSale.status === 2}
              onChangeValue={(t) =>
                commerceStore.saleStore.updateItem(currentSale.id, {
                  status: t ? 2 : 0,
                })
              }
            />
          ) : (
            <></>
          )}
        </View>
        <View
          style={{
            position: "absolute",
            padding: 10,
            backgroundColor: "teal",
            bottom: 10,
            left: 10,
            borderRadius: 99999999,
          }}
        >
          <MyIcon icon="print" onPress={onPressPrint} color="white" />
        </View>
      </View>
    </>
  );
});
