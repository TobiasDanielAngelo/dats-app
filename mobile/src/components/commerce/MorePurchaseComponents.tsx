import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MyTable } from "../../blueprints/MyTable";
import { winHeight, winWidth } from "../../constants/constants";
import { useVisible } from "../../constants/hooks";
import { useStore } from "../core/Store";
import { Commerce } from "./_AllComponents";
import { Purchase } from "./PurchaseStore";
import { TemporaryPurchase } from "./TemporaryPurchaseStore";
import { saveImageToDownloads } from "./SaveImage";
import { MyButton } from "../../blueprints";

const TempPurchaseRow = ({
  item,
  uneditable,
}: {
  item: TemporaryPurchase;
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
        <Commerce.TemporaryPurchase.Form
          item={item.$ as any}
          setVisible={setVisible2}
          hiddenFields={["purchase", "unit", "unitAmount"]}
        />
      </MyModal>
      <Text
        style={
          uneditable ? {} : { color: "blue", textDecorationLine: "underline" }
        }
        onPress={() => !uneditable && setVisible2(true)}
        numberOfLines={10}
      >
        {item.quantity}
      </Text>
    </View>
  );
};

function splitEveryFiveWords(text: string): string {
  const words = text.trim().split(/\s+/);
  const result: string[] = [];

  for (let i = 0; i < words.length; i += 5) {
    result.push(words.slice(i, i + 5).join(" "));
  }

  return result.join("\n");
}

const PurchaseTable = observer(
  ({
    tempPurchaseItems,
    item,
    uneditable,
  }: {
    tempPurchaseItems: TemporaryPurchase[];
    item?: Purchase;
    uneditable?: boolean;
  }) => {
    const { isVisible1, setVisible1 } = useVisible();

    const matrix = [
      ["Qty", "Item Description"],
      ...tempPurchaseItems.map((s) => [
        <TempPurchaseRow item={s} />,
        splitEveryFiveWords(s.displayName),
      ]),
      [
        "",
        !uneditable && (
          <MyIcon
            icon="plus"
            onPress={() => setVisible1(true)}
            size={15}
            color="blue"
          />
        ),
      ],
    ];

    return (
      <View>
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Commerce.TemporaryPurchase.Form
            item={{
              purchase: item?.id as number,
              quantity: 1,
              unitAmount: 0,
            }}
            setVisible={setVisible1}
            hiddenFields={["purchase", "unit", "unitAmount"]}
          />
        </MyModal>
        <View style={{ flex: 1 }}>
          <MyTable
            matrix={matrix}
            widths={[0.13, 0.77].map((s) => winWidth * s)}
          />
        </View>
      </View>
    );
  }
);

export const PurchaseQuickView = observer(() => {
  const { commerceStore, peopleStore } = useStore();
  const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
  const [purchase, setPurchase] = useState<number | null>(-1);
  const [isSaved, setSaved] = useState<boolean | null>(null);
  const currentPurchase = commerceStore.purchaseStore.allItems.get(
    purchase ?? -1
  );

  const currentImage = commerceStore.printJobStore.items.find(
    (s) => s.purchase === purchase
  )?.image;

  const tempPurchaseItems = commerceStore.temporaryPurchaseStore.items.filter(
    (t) => t.purchase === purchase
  );

  const onPressLeft = () => {
    if (purchase) {
      const prevPurchaseIds =
        commerceStore.purchaseStore.pageDetails.ids.filter((s) => s < purchase);
      setPurchase(Math.max(...prevPurchaseIds));
    }
  };

  const onPressRight = () => {
    if (purchase) {
      const nextPurchaseIds =
        commerceStore.purchaseStore.pageDetails.ids.filter((s) => s > purchase);
      setPurchase(Math.min(...nextPurchaseIds));
    }
  };

  const onPressPrint = async () => {
    await commerceStore.printJobStore.resetItems();
    if (purchase && purchase > 0) {
      await commerceStore.printJobStore.addItem({ purchase: purchase });
    }
    setVisible2(true);
  };

  const onPressDownload = async () => {
    const resp = await saveImageToDownloads(currentImage as string);
    setSaved(resp);
  };

  useEffect(() => {
    setPurchase(Math.max(...commerceStore.purchaseStore.pageDetails.ids));
  }, [commerceStore.purchaseStore.pageDetails.ids.length]);

  useEffect(() => {
    commerceStore.purchaseStore.fetchAll("page=1&order_by=-created_at");
    peopleStore.supplierStore.fetchAll("page=all");
  }, []);

  useEffect(() => {
    if (purchase && purchase > 0) {
      commerceStore.temporaryPurchaseStore.fetchAll(
        "page=all&purchase=" + purchase
      );
      commerceStore.printJobStore.fetchAll("purchase=" + purchase);
    }
  }, [purchase]);

  useEffect(() => {
    setSaved(null);
  }, [isVisible2]);

  return (
    <>
      <View style={{ margin: 10, flex: 1 }}>
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Commerce.Purchase.Form
            setVisible={setVisible1}
            hiddenFields={["status"]}
          />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2}>
          {currentImage && (
            <View>
              <MyButton label="Download" onPress={onPressDownload} />
              <Text style={{ color: isSaved ? "green" : "red" }}>
                {isSaved === null
                  ? ""
                  : isSaved
                  ? "Saved to DCIM"
                  : "Not Saved."}
              </Text>
              <Image
                source={{ uri: currentImage as string }}
                height={1.2 * winHeight}
                resizeMode="contain"
              />
            </View>
          )}
        </MyModal>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 15 }}>Purchase Order</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <MyIcon
              icon="chevron-left"
              size={20}
              color="blue"
              onPress={onPressLeft}
              hidden={
                !purchase ||
                commerceStore.purchaseStore.pageDetails.ids.filter(
                  (s) => s < purchase
                ).length === 0
              }
            />
            <Text
              onPress={() => setVisible1(true)}
              style={{
                fontSize: 15,
                color: "blue",
                textDecorationLine: "underline",
                fontWeight: "bold",
                display: purchase ? "contents" : "none",
              }}
            >
              {moment(currentPurchase?.createdAt).format("MMM D, hA")}{" "}
              {
                peopleStore.supplierStore.allItems.get(
                  currentPurchase?.supplier as number
                )?.displayName
              }
            </Text>
            <MyIcon
              icon="chevron-right"
              size={20}
              color="blue"
              onPress={onPressRight}
              hidden={
                !purchase ||
                commerceStore.purchaseStore.pageDetails.ids.filter(
                  (s) => s > purchase
                ).length === 0
              }
            />
            <MyIcon
              icon="plus"
              size={20}
              color="blue"
              onPress={() => setVisible1(true)}
              hidden={
                commerceStore.purchaseStore.pageDetails.ids.filter(
                  (s) => s > (purchase ?? -1)
                ).length !== 0
              }
            />
          </View>
        </View>
        <ScrollView>
          <Text>{currentPurchase?.displayName}</Text>
          {purchase && purchase > 0 && (
            <PurchaseTable
              item={currentPurchase}
              tempPurchaseItems={tempPurchaseItems}
              //   uneditable={
              //     commerceStore.purchaseStore.pageDetails.ids.filter(
              //       (s) => s > purchase
              //     ).length > 0
              //   }
            />
          )}
        </ScrollView>
        <View
          style={{
            position: "absolute",
            padding: 10,
            backgroundColor: "teal",
            bottom: 10,
            right: 10,
            borderRadius: 99999999,
          }}
        >
          <MyIcon icon="print" onPress={onPressPrint} color="white" />
        </View>
      </View>
    </>
  );
});
