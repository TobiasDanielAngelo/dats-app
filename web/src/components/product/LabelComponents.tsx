import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { MyForm } from "../../blueprints/MyForm";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MySlider } from "../../blueprints/MySlider";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions } from "../../constants/helpers";
import { useKeyPress, useVisible } from "../../constants/hooks";
import { Field, StateSetter } from "../../constants/interfaces";
import { useStore } from "../core/Store";
import { Product } from "./_AllComponents";
import { codeToInt } from "./MatrixPriceComponents";
import { PrintJob, PrintJobInterface } from "./PrintJobStore";
import { GuidedDiv } from "../../blueprints/MyGuidedDiv";
import LabelsInPage from "../../blueprints/LabelsInPage";
import { useReactToPrint } from "react-to-print";
import { MyDropdownSelector, MyInput } from "../../blueprints";

function intToCode(num: number): string {
  const mapping: Record<string, string> = {
    "1": "L",
    "2": "U",
    "3": "C",
    "4": "K",
    "5": "Y",
    "6": "S",
    "7": "T",
    "8": "O",
    "9": "R",
    "0": "E",
  };

  return String(num)
    .split("")
    .map((d) => mapping[d] ?? "")
    .join("");
}

const LayoutView = ({
  printItems,
  labelSize,
  pageRef,
}: {
  printItems: React.ReactNode[];
  labelSize: [number, number];
  pageRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [bestCount, setBestCount] = useState(0);

  return (
    <div ref={pageRef}>
      {Array.from(
        Array(
          bestCount === 0 ? 1 : Math.ceil(printItems.length / bestCount)
        ).keys()
      ).map((s) => (
        <LabelsInPage
          labelSize={labelSize}
          pageSize={[210, 297]}
          allLabels={printItems.slice(bestCount * s, bestCount * (s + 1))}
          setBestCount={setBestCount}
          key={s}
          footNote={"Print Settings: Size = A4, Margin = None, Scale = 100%"}
        />
      ))}
    </div>
  );
};

const LayoutCard = ({ item }: { item: PrintJobInterface }) => {
  return (
    <div
      className="border-2 rounded-md relative bg-white p-1 text-black"
      style={{
        width: `${item.widthMm}mm`,
        height: `${item.heightMm}mm`,
        fontFamily: "LoraBold",
      }}
    >
      {item.description?.split("\n").map((s, ind) => (
        <div
          key={ind}
          style={{
            fontSize: `${item.fontSizes ? item.fontSizes[ind + 1] : 10}mm`,
          }}
          className="leading-none"
        >
          {s.toUpperCase()}
        </div>
      ))}
      <div className="bottom-1 right-1 absolute text-right justify-center font-semibold p-1 leading-none">
        <div
          style={{
            fontSize: `${item.fontSizes ? 0.6 * item.fontSizes[0] : 10}mm`,
            fontFamily: "Lora",
            display: item.purchaseCode ? "block" : "none",
          }}
        >
          ({item.purchaseCode})
        </div>
        <div
          style={{
            fontSize: `${item.fontSizes ? item.fontSizes[0] : 10}mm`,
            fontFamily: "Lora",
          }}
        >
          {item.sellingCode ?? ""}
        </div>
      </div>
    </div>
  );
};

const LabelCard = observer(({ item }: { item: PrintJob }) => {
  const { isVisible1, setVisible1 } = useVisible();
  const { productStore } = useStore();

  return (
    <div className="m-3 dark:border-gray-700 border-teal-300  rounded-lg py-3 px-2 border">
      <MyModal isVisible={isVisible1} setVisible={setVisible1} fullWidth>
        <LabelForm item={item} setVisible={setVisible1} />
      </MyModal>
      <div>{item.description.toUpperCase()}</div>
      <div>Number of Prints: {item.quantity}</div>
      <div className="flex flex-row justify-between">
        <GuidedDiv title={<LayoutCard item={item} />}>
          <MyIcon icon="RemoveRedEye" />
        </GuidedDiv>
        <MyIcon
          icon={item.isCompleted ? "CheckBox" : "CheckBoxOutlineBlank"}
          onClick={() =>
            productStore.printJobStore.updateItem(item.id, {
              isCompleted: !item.isCompleted,
            })
          }
        />
        <MyIcon icon="Edit" onClick={() => setVisible1(true)} />
      </div>
    </div>
  );
});

const StagingView = observer(({ items }: { items: PrintJob[] }) => {
  const [value, setValue] = useState("");

  const { productStore } = useStore();

  return (
    <div className="relative">
      <div className="px-2">
        <MyInput
          value={value}
          onChangeValue={setValue}
          searchFcn={productStore.printJobStore.fetchTemp}
          label="Description"
        />
      </div>
      <MyGenericCollection
        items={
          value
            ? items.filter((s) =>
                s.description.toLowerCase().includes(value.toLowerCase())
              )
            : items.filter((s) => !s.isCompleted)
        }
        CardComponent={LabelCard}
        title="Labels"
      />
    </div>
  );
});

const defaultDetails = {
  description: "",
  purchasePrice: 0,
  sellingPrice: 0,
  quantity: 1,
  unit: "",
  fontSizes: Array.from(Array(10)).fill(5),
  dimension: -1,
};

type LabelInterface = typeof defaultDetails;

function parseSellingCode(
  code: string
): { sellingPrice: number; unit?: string } | null {
  const match = code.match(/^\u20b1(\d+(?:\.\d+)?)(?:\/(\w+))?$/);
  if (!match) return null;

  return {
    sellingPrice: parseFloat(match[1]),
    unit: match[2] || undefined,
  };
}

export const transformLabelToPrint = (details: LabelInterface) => {
  return {
    ...details,
    purchaseCode:
      details.purchasePrice > 0 ? intToCode(details.purchasePrice) : "",
    sellingCode:
      details.sellingPrice > 0
        ? `\u20b1${details.sellingPrice}${
            details.unit ? "/" + details.unit : ""
          }`
        : "",
  };
};

export const transformPrintToLabel = (details?: PrintJob): LabelInterface => {
  if (!details) return defaultDetails;
  const { sellingPrice, unit } = parseSellingCode(
    details.sellingCode ?? ""
  ) ?? { sellingPrice: 0, unit: "" };
  return {
    ...details,
    description: details.description ?? "",
    quantity: details.quantity ?? 0,
    fontSizes: details.fontSizes ?? [],
    dimension: details.dimension ?? -1,
    purchasePrice: codeToInt(
      details.purchaseCode.replaceAll("(", "").replaceAll(")", "") ?? ""
    ),
    sellingPrice: sellingPrice,
    unit: unit ?? "",
  };
};

export const LabelForm = ({
  item,
  setVisible,
}: {
  item?: PrintJob;
  setVisible: StateSetter<boolean>;
}) => {
  const { productStore } = useStore();
  const { isVisible2, setVisible2 } = useVisible();

  const [details, setDetails] = useState(transformPrintToLabel(item));

  const { widthMm, heightMm } = productStore.printDimensionStore.allItems.get(
    details.dimension
  ) ?? { widthMm: 76, heightMm: 38 };

  const layoutDetails = {
    ...transformLabelToPrint(details),
    widthMm,
    heightMm,
  };

  const onClickSubmit = async () => {
    let resp;
    if (!item) {
      resp = await productStore.printJobStore.addItem(layoutDetails);
    } else {
      resp = await productStore.printJobStore.updateItem(
        item.id,
        layoutDetails
      );
    }
    if (resp.ok) setDetails(defaultDetails);
    setVisible(false);
  };

  const fields = [
    [{ name: "description", label: "Label", type: "textarea" }],
    [
      { name: "quantity", label: "# of Prints", type: "number" },
      { name: "purchasePrice", label: "Purchase Price", type: "number" },
      { name: "sellingPrice", label: "Selling Price", type: "number" },
      { name: "unit", label: "Unit", type: "text" },
    ],
    [
      {
        name: "dimension",
        label: "Dimension",
        type: "select",
        options: toOptions(
          productStore.printDimensionStore.items,
          "displayName"
        ),
        onClickAdd: () => setVisible2(true),
      },
    ],
  ] satisfies Field[][];

  useKeyPress(["Shift", "Enter"], onClickSubmit);

  const numSliders = details.description.split("\n").length + 1;
  return (
    <>
      <MyModal isVisible={isVisible2} setVisible={setVisible2}>
        <Product.PrintDimension.Form setVisible={setVisible2} />
      </MyModal>
      <div className="flex md:flex-row flex-col gap-2">
        <div className="md:w-[50vw] w-[100vw] items-center justify-center">
          <MyForm
            fields={fields}
            title={item ? "Edit Label" : "Make New Label"}
            details={details}
            setDetails={setDetails}
            onClickSubmit={onClickSubmit}
          />
        </div>
        <div className="md:w-[15%] md:mr-8">
          {Array.from(Array(numSliders).keys()).map((s) => (
            <div key={s}>
              <div className="text-sm p-2 leading-none">
                {s === 0
                  ? "\u20b1-"
                  : details.description.split("\n")[s - 1].toUpperCase()}
              </div>
              <MySlider
                value={details.fontSizes[s]}
                setValue={(t) =>
                  setDetails((prev) => ({
                    ...prev,
                    fontSizes: prev.fontSizes.map((val, i) =>
                      i === s ? t : val
                    ),
                  }))
                }
                title={""}
                min={3}
                max={50}
                step={0.1}
              />
            </div>
          ))}
        </div>
        <LayoutCard item={layoutDetails} />
      </div>
    </>
  );
};

export const LabelView = observer(() => {
  const { productStore } = useStore();
  const { isVisible1, setVisible1 } = useVisible();
  const { items } = productStore.printJobStore;
  const pageRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(-1);

  const onClickPrint = useReactToPrint({
    contentRef: pageRef,
  });

  const fetchDim = async () => {
    await productStore.printJobStore.fetchAll("page=all&is_completed=False");
    await productStore.printDimensionStore.fetchAll("page=all");
  };
  const { widthMm, heightMm } = productStore.printDimensionStore.allItems.get(
    value
  ) ?? { widthMm: 76, heightMm: 38 };

  useEffect(() => {
    fetchDim();
  });
  return (
    <div className="relative">
      <MyModal isVisible={isVisible1} setVisible={setVisible1} fullWidth>
        <LabelForm setVisible={setVisible1} />
      </MyModal>

      <SideBySideView
        SideA={
          <>
            <MyDropdownSelector
              options={toOptions(
                productStore.printDimensionStore.items,
                "displayName"
              )}
              value={value}
              onChangeValue={setValue}
            />
            <StagingView items={items.filter((s) => s.dimension === value)} />
          </>
        }
        SideB={
          items.length > 0 ? (
            <LayoutView
              printItems={items
                .filter((s) => s.dimension === value && !s.isCompleted)
                .flatMap((s) =>
                  Array.from({ length: s.quantity }, (_, i) => (
                    <LayoutCard key={`${s.id}-${i}`} item={s} />
                  ))
                )}
              labelSize={[widthMm, heightMm]}
              pageRef={pageRef}
            />
          ) : (
            <></>
          )
        }
        ratio={0.4}
      />
      <div className="absolute top-5 left-5 p-2 rounded-full border-1 border-teal-600 bg-white">
        <MyIcon icon="Add" fontSize="large" onClick={() => setVisible1(true)} />
      </div>
      <div className="absolute top-20 left-5 p-2 rounded-full border-1 border-teal-600 bg-white">
        <MyIcon icon="Print" fontSize="large" onClick={onClickPrint} />
      </div>
    </div>
  );
});
