import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { MyTable } from "../../blueprints/MyTable";
import { useKeyPress, useVisible } from "../../constants/hooks";
import { ActionModalDef, KeyboardCodes } from "../../constants/interfaces";
import { useStore } from "../core/Store";
import { Product } from "./_AllComponents";
import { Category } from "./CategoryStore";
import { UnitIdMap } from "./UnitStore";
import { MyDropdownSelector } from "../../blueprints";
import { toOptions } from "../../constants/helpers";

function codeToInt(code: string): number {
  const mapping: Record<string, string> = {
    L: "1",
    U: "2",
    C: "3",
    K: "4",
    Y: "5",
    S: "6",
    T: "7",
    O: "8",
    R: "9",
    E: "0",
  };

  let digits = "";
  for (const ch of code.toUpperCase()) {
    if (mapping[ch]) digits += mapping[ch];
  }

  return digits ? parseInt(digits, 10) : NaN;
}

function parseNumberAndCode(input: string): [number, number] | null {
  const match = input.match(/^([\d.]+)\s*\((\w+)\)$/);
  if (!match) return null;

  const num = parseFloat(match[1]);
  const code = codeToInt(match[2]);

  return [num, code];
}

const PriceMatrixItem = observer(
  ({
    item,
    rowHeader,
    colHeader,
  }: {
    item: string;
    rowHeader: string;
    colHeader?: string;
  }) => {
    const { isVisible1, setVisible1 } = useVisible();
    const { productStore } = useStore();

    const [selling, purchasing] = parseNumberAndCode(item) ?? [];

    return (
      <div className="items-center justify-center flex-1 flex">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Product.Article.Form
            item={{
              unit: UnitIdMap["pcs"],
              genericProduct:
                (productStore.genericProductStore.items.find((s) =>
                  s.displayName.includes(rowHeader)
                )?.id as number) ?? -1,
              brand: colHeader,
              sellingPrice: selling,
              purchasePrice: purchasing,
              quantityPerUnit: 1,
            }}
            hiddenFields={[
              "isOrig",
              "parentArticle",
              "quantityPerUnit",
              "unit",
            ]}
            title="Add Entry"
            setVisible={setVisible1}
            fetchFcn={productStore.categoryStore.fetchAll}
          />
        </MyModal>
        <div onClick={() => setVisible1(true)}>
          {item === "+" ? (
            <MyIcon icon="Add" onClick={() => setVisible1(true)} />
          ) : (
            item
          )}
        </div>
      </div>
    );
  }
);

const PriceMatrixTable = observer(({ category }: { category: Category }) => {
  const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();

  const { productStore } = useStore();
  useEffect(() => {
    productStore.genericProductStore.fetchAll(
      `page=all&category=${category.id}`
    );
  }, []);
  const matrix = [
    ...category.priceMatrix.map((row, rowIndex) => [
      ...row.map((cell, colIndex) =>
        rowIndex === 0 || colIndex === 0 ? (
          cell
        ) : (
          <PriceMatrixItem
            item={cell === "" ? "+" : cell}
            rowHeader={row[0]}
            colHeader={category.priceMatrix[0][colIndex]}
          />
        )
      ),
      rowIndex === 0 ? (
        "New"
      ) : (
        <PriceMatrixItem item={"+"} rowHeader={row[0]} />
      ),
    ]),
    [<MyIcon icon="Add" onClick={() => setVisible2(true)} />],
  ];

  return (
    <div>
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <Product.Article.Form
          item={{
            unit: UnitIdMap["pcs"],
            quantityPerUnit: 1,
          }}
          hiddenFields={["isOrig", "parentArticle", "quantityPerUnit", "unit"]}
          title="Add Entry"
          setVisible={setVisible1}
          fetchFcn={productStore.categoryStore.fetchAll}
        />
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2}>
        <Product.GenericProduct.Form
          item={{
            category: category.id as number,
            reorderLevel: 1,
          }}
          title={`Add New ${category.name}`}
          setVisible={setVisible2}
          fetchFcn={productStore.categoryStore.fetchAll}
        />
      </MyModal>
      <div className="text-2xl text-center pt-10 flex flex-row flex-1 items-center justify-center gap-5">
        {category.displayName} Price List{" "}
        <MyIcon
          icon="Print"
          onClick={() =>
            productStore.categoryStore.updateItem(category.id, {
              toPrintPrice: true,
            })
          }
        />
      </div>
      <MyTable matrix={matrix} />
    </div>
  );
});

export const PriceView = observer(() => {
  const { isVisible, setVisible, setVisible1 } = useVisible();
  const { productStore } = useStore();
  const [value, setValue] = useState(-1);
  const currentCategory = productStore.categoryStore.allItems.get(value);
  const actionModalDefs = [
    {
      icon: "AddCard",
      name: "Add a Price",
      label: "Add",
      modal: () => (
        <Product.Article.Form
          item={{
            unit: UnitIdMap["pcs"],
            quantityPerUnit: 1,
          }}
          hiddenFields={["isOrig", "parentArticle", "quantityPerUnit", "unit"]}
          title="Add Entry"
          setVisible={setVisible1}
          fetchFcn={productStore.categoryStore.fetchAll}
        />
      ),
    },
    {
      icon: "Star",
      name: "Select a Prdouct",
      label: "SELECT",
      modal: () => (
        <MyDropdownSelector
          value={value}
          onChangeValue={setValue}
          options={toOptions(productStore.categoryStore.items, "displayName")}
        />
      ),
    },
  ] satisfies ActionModalDef[];

  const actions = useMemo(
    () =>
      actionModalDefs.map((def, i) => ({
        icon: <MyIcon icon={def.icon} fontSize="large" label={def.label} />,
        name: def.name,
        onClick: () => setVisible(i + 1, true),
      })),
    [setVisible, actionModalDefs]
  );

  const Modals = actionModalDefs.map((s) => s.modal);

  actions.forEach((s, ind) =>
    useKeyPress(["Alt", `Digit${ind + 1}` as KeyboardCodes], s.onClick)
  );

  useEffect(() => {
    productStore.categoryStore.fetchAll("page=1");
  }, []);
  return (
    <>
      {Modals.map((S, ind) => (
        <MyModal
          key={ind}
          isVisible={!!S && isVisible[ind + 1]}
          setVisible={(v: boolean) =>
            setVisible(
              ind + 1,
              typeof v === "function" ? (v as any)(isVisible[ind + 1]) : v
            )
          }
          disableClose
        >
          {S ? <S /> : <></>}
        </MyModal>
      ))}
      {/* {productStore.categoryStore.items
        .filter((s) => s.priceMatrix.length > 1)
        .map((s, ind) => (
          <PriceMatrixTable category={s} key={ind} />
        ))} */}
      {currentCategory ? (
        <PriceMatrixTable category={currentCategory} />
      ) : (
        <></>
      )}

      <MySpeedDial actions={actions} />
    </>
  );
});
