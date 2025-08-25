import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import AvatarSelector from "../../blueprints/AvatarSelector";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { winHeight, winWidth } from "../../constants/constants";
import { useVisible } from "../../constants/hooks";
import { StateSetter } from "../../constants/interfaces";
import { useStore } from "../core/Store";
import { MyButton } from "../../blueprints";
import AsyncStorage from "@react-native-async-storage/async-storage";

const listBH = Array.from(Array(19).keys()).map((s) => 5 * (s + 2));
const listBH6 = [...listBH, 12].sort((a, b) => (a > b ? 1 : -1));

const bhList = [
  ...listBH.map((t) => `Bolt BH5x${t}`),
  ...listBH6.map((s) => `Bolt BH6x${s}`),
  ...[8, 10, 12, 14].map((s) => listBH.map((t) => `Bolt BH${s}x${t}`)).flat(2),
];
const jpList = [4, 5, 6]
  .map((s) => listBH.map((t) => `Bolt JP${s}x${t}`))
  .flat(2);
const bhStainlessList = listBH6.map((s) => `Sts Bolt BH6x${s}`);

const roughDiamList = [
  "(3/16)",
  "(1/4)",
  "(5/16)",
  "(3/8)",
  "(7/16)",
  "(1/2)",
  "(5/8)",
];
const roughLenList = [
  "(1/4)",
  "(1/2)",
  "(3/4)",
  "1",
  "(1&1/4)",
  "(1&1/2)",
  "2",
  "(2&1/2)",
  "3",
  "4",
  "5",
  "6",
];
const roughList = ["Ord", "Sts"]
  .map((q) =>
    roughDiamList
      .map((s) => roughLenList.map((t) => `${q} Bolt ${s}x${t}`))
      .flat(1)
  )
  .flat(1);

const roughNutList = [
  ...["Ord", "Sts"]
    .map((q) => roughDiamList.map((s) => `${q} Nut ${s}`))
    .flat(1),
  "Ord Nut 6205",
];

const fineList = [4, 5, 6, 8, 10, 12, 14];

const fineNutList = ["Ord", "Flange", "Sts"]
  .map((q) => fineList.map((s) => `${q} Nut ${s}mm`))
  .flat(1);

const washerList = [
  ...["Flat", "Big Flat", "Lock"]
    .map((q) => fineList.map((s) => `${q} Washer ${s}mm`))
    .flat(1),
  "Washer 6205 Thick",
  "Washer 6205 Thin",
];

const allenBoltList = [
  "Red",
  "Orange",
  "Gold",
  "Green",
  "Blue",
  "Violet",
  "White",
  "Black",
].map((s) => `Allen Bolt ${s}`);

const Fraction = ({ num, den }: { num: string; den: string }) => (
  <View style={{ alignItems: "center" }}>
    <Text style={{ fontWeight: "bold", fontSize: 15 }}>{num}</Text>
    <View
      style={{
        height: 2,
        backgroundColor: "black",
        alignSelf: "stretch",
        marginVertical: 1,
      }}
    />
    <Text style={{ fontWeight: "bold", fontSize: 15 }}>{den}</Text>
  </View>
);

const tokenize = (expr: string) => {
  return expr.match(/\d+\+\d+\/\d+|\d+\/\d+|\d+|[()x+\-*/]|\w+/g) || [];
};

const renderItem = (item: string) => {
  const tokens = tokenize(item);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        flex: 1,
      }}
    >
      {tokens.map((t, i) => {
        // remove surrounding parentheses if any
        const clean = t.replace(/[()]/g, "");

        // mixed fraction like 2+1/2
        if (/^\d+\+\d+\/\d+$/.test(clean)) {
          const [whole, rest] = clean.split("&");
          const [num, den] = rest.split("/");
          return (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 12 }}>{whole}</Text>
              <Fraction num={num} den={den} />
            </View>
          );
        }

        // simple fraction like 5/8
        if (/^\d+\/\d+$/.test(clean)) {
          const [num, den] = clean.split("/");
          return <Fraction key={i} num={num} den={den} />;
        }

        // operators, whole numbers, etc.
        return (
          <Text
            key={i}
            style={{
              marginHorizontal: 2,
              fontWeight: "bold",
              fontSize: 17,
              textAlign: "center",
            }}
          >
            {clean}
          </Text>
        );
      })}
    </View>
  );
};

const BoltItem = ({
  item,
  qty,
  inc,
  unit,
  setQty,
}: {
  item: string;
  qty: number;
  inc: number;
  unit: string;
  setQty: StateSetter<number>;
}) => {
  return (
    <View style={{ flexDirection: "row" }}>
      <View
        style={{
          alignItems: "center",
          padding: 5,
          margin: 5,
          backgroundColor: "white",
          borderWidth: 1,
          flexDirection: "row",
          flex: 1,
          justifyContent: "center",
          borderRadius: 50,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            alignItems: "center",
            marginLeft: 10,
            marginRight: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <MyIcon
              icon="minus"
              onPress={() => setQty((t: number) => Math.max(0, t - inc))}
              size={17}
            />
            {renderItem(item)}
          </View>
          <MyIcon
            icon="plus"
            onPress={() => setQty((t: number) => Math.min(inc * 20, t + inc))}
            size={17}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          backgroundColor: "white",
          borderRadius: 100,
          padding: 5,
          margin: 5,
          width: 100,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 15 }}>
          {qty ? qty + ` ${unit}` : "-"}
        </Text>
      </View>
    </View>
  );
};

const types = [
  "Select",
  "Ord Nut",
  "Sts Nut",
  "Flange Nut",
  "Ord Bolt",
  "Sts Bolt",
  "Bolt BH",
  "Bolt JP",
  "Allen Bolt",
  "Washer",
];
export const FastenerView = observer(() => {
  const { isVisible1, setVisible1 } = useVisible();
  const [token, setToken] = useState("");
  const { commerceStore } = useStore();
  const defaultList = [
    ...[
      ...roughNutList,
      ...fineNutList,
      ...roughList,
      ...bhList,
      ...jpList,
      ...bhStainlessList,
      ...allenBoltList,
    ].map((s) => ({
      id: s,
      qty: 0,
      item: s,
      inc: 50,
      unit: "pcs.",
    })),
    ...washerList.map((s) => ({
      id: s,
      qty: 0,
      item: s,
      inc: 1,
      unit: "kg.",
    })),
  ];
  const [list, setList] = useState(defaultList);
  const [print, setPrint] = useState("");
  const [value, setValue] = useState<number | string | null>(null);

  const setQty = (id: string, updater: React.SetStateAction<number>) => {
    setList((prev) =>
      prev.map((s) =>
        id === s.id
          ? {
              ...s,
              qty: typeof updater === "function" ? updater(s.qty) : updater,
            }
          : s
      )
    );
  };

  const onPressPrint = async () => {
    setPrint("");
    setVisible1(true);
    const resp0 = await commerceStore.purchaseStore.fetchAll(
      `page=all&supplier=2`
    );
    if (resp0.data && resp0.ok) {
      resp0.data
        .map((s) => s.id)
        .forEach(async (s) => {
          commerceStore.purchaseStore.deleteItem(s as number);
        });
    }
    const resp = await commerceStore.purchaseStore.addItem({
      supplier: 2,
    });
    if (!resp.ok) return;
    list
      .filter((s) => s.qty > 0)
      .forEach((s) =>
        commerceStore.temporaryPurchaseStore.addItem({
          purchase: resp.data?.id as number,
          product: `(${s.unit}) ${s.item
            .replaceAll("(", "")
            .replaceAll(")", "")}`,
          quantity: s.qty,
          unitAmount: 0,
        })
      );
    const resp2 = await commerceStore.printJobStore.addItem({
      purchase: resp.data?.id as number,
    });
    if (resp2.ok) {
      setPrint(resp2.data?.image as string);
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <AvatarSelector
        options={types.map((s) => ({
          id: s,
          name: s,
        }))}
        value={value}
        onChangeValue={setValue}
      />
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        {print === "" ? (
          <Text>Loading...{token}</Text>
        ) : (
          <Image
            source={{
              uri: print,
            }}
            height={1.2 * winHeight}
            resizeMode="contain"
          />
        )}
      </MyModal>
      <View style={{ flex: 1 }}>
        <FlatList
          data={list.filter((s) => s.item.includes(`${value}`))}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item: s, index: ind }) => (
            <BoltItem
              item={s.item}
              key={ind}
              inc={s.inc}
              qty={s.qty}
              unit={s.unit}
              setQty={
                ((qty: number) => setQty(s.id, qty)) as StateSetter<number>
              }
            />
          )}
          initialNumToRender={20}
          windowSize={20}
          removeClippedSubviews
        />
      </View>
      <MyButton label="Print" onPress={onPressPrint} />
    </View>
  );
});
