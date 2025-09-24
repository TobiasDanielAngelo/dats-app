import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import {
  MyButton,
  MyConfirmModal,
  MyDropdownSelector,
  MyInput,
  MyMultiDropdownSelector,
} from "../../blueprints";
import AvatarSelector from "../../blueprints/AvatarSelector";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MyTable } from "../../blueprints/MyTable";
import { winWidth } from "../../constants/constants";
import {
  getStoreSignature,
  mySum,
  stringToFontSize,
  toOptions,
} from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { useStore } from "../core/Store";
import { PrintDimensionIdMap } from "./PrintDimensionStore";
import { PrintJob } from "./PrintJobStore";
import { Product } from "./_AllComponents";

const PistonItem = ({ item }: { item: PrintJob }) => {
  const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
  const { productStore } = useStore();
  const [qty, setQty] = useState(item.quantity.toString());

  const onPressUpdate = () => {
    productStore.printJobStore.updateItem(item.id, {
      quantity: parseInt(qty),
    });
    setVisible1(false);
  };

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <MyInput type="number" value={qty} onChangeValue={setQty} />
        <MyButton label="Update" onPress={onPressUpdate} />
      </MyModal>
      <MyConfirmModal
        isVisible={isVisible2}
        setVisible={setVisible2}
        statement="Delete this item?"
        onPressCheck={() => {
          productStore.printJobStore.deleteItem(item.id);
          setVisible2(false);
        }}
      />
      <MyIcon
        icon={item.isCompleted ? "check" : "square"}
        onPress={() =>
          productStore.printJobStore.updateItem(item.id, {
            isCompleted: !item.isCompleted,
          })
        }
      />
      <MyIcon icon="edit" onPress={() => setVisible1(true)} />
      <MyIcon icon="times" onPress={() => setVisible2(true)} />
    </View>
  );
};

export const PistonPrintView = observer(() => {
  const { productStore } = useStore();
  const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
  const [job, _] = useState<number | null>(null);
  const [motors, setMotors] = useState<(number | string)[]>([]);

  const onChangeJob = (t: number | null) => {
    if (t)
      productStore.printJobStore.updateItem(t, {
        isCompleted: false,
        quantity: 1,
      });
  };

  const boreOptions = [0, 0.25, 0.5, 0.75, 1, 1.5, 2].map((s) => ({
    id: s,
    name: s === 0 ? "STD" : s.toFixed(2),
    icon: "circle-notch",
  }));

  const pinOptions = [10, 11, 12, 13, 14, 15, 16, 17].map((s) => ({
    id: s,
    name: `P-${s}`,
    icon: "map-marker",
  }));

  const motorNames = motors
    .map((s) => productStore.motorStore.allItems.get(s)?.model)
    .join("\n");

  const targetMotors = Array.from(
    new Set(motors.map((s) => productStore.motorStore.allItems.get(s)))
  ).filter((s) => s !== undefined);

  const targetPinSizes = Array.from(
    new Set(targetMotors.map((s) => s.pistonPinSize))
  );

  const targetPinSize = targetPinSizes.length > 0 ? targetPinSizes[0] : 0;

  const [pinSize, setPinSize] = useState<number | string | null>(targetPinSize);

  const [relativeBore, setRelativeBore] = useState<number | string | null>(0);
  const strBoreOption =
    typeof relativeBore === "number"
      ? (relativeBore * 100).toString().padStart(2, "0")
      : "";

  const targetBoreSizes = Array.from(
    new Set(
      targetMotors.map(
        (s) => (s as any)[`pistonBore${strBoreOption}`] as number
      )
    )
  );

  const targetBoreSize = targetBoreSizes.length > 0 ? targetBoreSizes[0] : 0;

  const [absoluteBore, setAbsoluteBore] = useState(targetBoreSize.toFixed(2));
  const [price, setPrice] = useState("");

  const fontSizes = [
    40,
    28,
    32,
    ...motorNames
      .split("\n")
      .map((s) => stringToFontSize(s, winWidth * 1.9, 1.5, 70)),
  ].map((s) => Math.round((16 / 70) * s * 100) / 100);

  const onPressAdd = async () => {
    motors.forEach(
      async (s) =>
        await productStore.motorStore.updateItem(s, {
          pistonPinSize: typeof pinSize === "number" ? pinSize : 10,
          [`pistonBore${strBoreOption}`]:
            Math.round(parseFloat(absoluteBore) * 100) / 100,
        })
    );
    await productStore.printJobStore.addItem({
      description:
        `PISTON KIT ${boreOptions.find((s) => s.id === relativeBore)?.name}\n` +
        (typeof pinSize === "number" && pinSize > 10 ? `P-${pinSize}` : "") +
        ` | ` +
        `${parseFloat(absoluteBore) > 40 ? `S-${absoluteBore}` : ""}` +
        "\n" +
        motorNames,
      sellingCode: price !== "" ? `\u20b1${price}` : "",
      fontSizes: fontSizes,
      quantity: 1,
      dimension: PrintDimensionIdMap["Piston Kit"],
    });
    setVisible1(false);
  };

  useEffect(() => {
    setPinSize(targetPinSize);
  }, [targetPinSize]);

  useEffect(() => {
    productStore.printJobStore.fetchAll(
      `page=all&dimension=${PrintDimensionIdMap["Piston Kit"]}`
    );
  }, []);

  const matrix = useMemo(
    () => [
      ["Qty", "Label", "Actions"],
      ...productStore.printJobStore.items
        .filter(
          (s) =>
            s.dimension === PrintDimensionIdMap["Piston Kit"] && !s.isCompleted
        )
        .map((s) => [
          s.quantity.toString(),
          s.displayName,
          <PistonItem item={s} />,
        ]),
    ],
    [
      getStoreSignature(productStore.printJobStore.items.map((s) => s.$)),
      mySum(
        productStore.printJobStore.items.map((s) => (s.isCompleted ? 1 : 0))
      ),
      mySum(productStore.printJobStore.items.map((s) => s.quantity)),
    ]
  );

  useEffect(() => {
    setAbsoluteBore(targetBoreSize.toFixed(2));
  }, [targetBoreSize]);

  useEffect(() => {
    if (isVisible1) {
      setMotors([]);
    }
  }, [isVisible1]);

  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <MyMultiDropdownSelector
          value={motors}
          onChangeValue={setMotors}
          options={toOptions(productStore.motorStore.items, "model")}
          searchFcn={productStore.motorStore.fetchAll}
          fetchFcn={productStore.motorStore.fetchTemp}
          label="Motors"
          onPressAdd={() => setVisible2(true)}
        />
        <View style={{ flex: 1, alignItems: "center" }}>
          {/* <MyInput value={val} onChangeValue={setVal} multiline /> */}
          <View
            style={{
              width: 0.7 * winWidth,
              aspectRatio: 1,
              borderWidth: 1,
              backgroundColor: "white",
              padding: 5,
              position: "relative",
            }}
          >
            <Text
              style={{
                fontFamily: "serif",
                fontWeight: "bold",
                fontSize: 28,
                lineHeight: 32,
              }}
            >
              PISTON KIT {boreOptions.find((s) => s.id === relativeBore)?.name}
            </Text>
            <Text
              style={{
                fontFamily: "serif",
                fontWeight: "bold",
                fontSize: 32,
                lineHeight: 32,
              }}
            >
              {typeof pinSize === "number" && pinSize > 10
                ? `P-${pinSize}`
                : ""}{" "}
              | {parseFloat(absoluteBore) > 40 ? `S-${absoluteBore}` : ""}
            </Text>
            {motorNames.split("\n").map((s, ind) => (
              <Text
                style={{
                  fontFamily: "serif",
                  fontWeight: "bold",
                  fontSize: stringToFontSize(s, winWidth * 1.9, 1.5, 70),
                  lineHeight: stringToFontSize(s, winWidth * 1.9, 1.5, 70),
                }}
                key={ind}
              >
                {s.toUpperCase()}
              </Text>
            ))}
          </View>
          {price !== "" ? (
            <Text
              style={{
                fontFamily: "serif",
                fontWeight: "bold",
                fontSize: 32,
                lineHeight: 32,
                position: "absolute",
                bottom: 5,
                right: 35,
              }}
            >
              {`\u20b1${price}`}
            </Text>
          ) : (
            <></>
          )}
        </View>
        <View style={{ padding: 5 }}>
          {motors.length ? (
            <>
              <MyInput
                value={absoluteBore}
                onChangeValue={setAbsoluteBore}
                type="number"
                label="Absolute Bore"
              />
              <AvatarSelector
                value={relativeBore}
                onChangeValue={setRelativeBore}
                options={boreOptions}
              />
              <AvatarSelector
                value={pinSize}
                onChangeValue={setPinSize}
                options={pinOptions}
              />
              <MyInput
                value={price}
                onChangeValue={setPrice}
                type="number"
                label="Price (Optional)"
              />
              <MyButton label="Add" onPress={onPressAdd} />
            </>
          ) : (
            <></>
          )}
        </View>
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2}>
        <Product.Motor.Form setVisible={setVisible2} />
      </MyModal>
      <MyDropdownSelector
        value={job}
        onChangeValue={onChangeJob}
        options={toOptions(
          productStore.printJobStore.items.filter(
            (s) => s.dimension === PrintDimensionIdMap["Piston Kit"]
          ),
          "description"
        )}
        searchFcn={productStore.printJobStore.fetchTemp}
        fetchFcn={productStore.printJobStore.fetchTemp}
        label="Print Jobs"
      />
      <MyTable
        matrix={matrix}
        widths={[0.12, 0.4, 0.3].map((s) => winWidth * s)}
      />
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
        <MyIcon
          icon="plus"
          onPress={() => setVisible1(true)}
          color="white"
          size={30}
        />
      </View>
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
        <MyIcon icon="print" onPress={() => {}} color="white" />
      </View>
    </>
  );
});
