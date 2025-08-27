import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
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

const CompatibilityMatrixItem = observer(
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
    rowHeader;
    colHeader;

    return (
      <div className="items-center justify-center flex-1 flex">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <Product.GenericProduct.Form
            item={{}}
            hiddenFields={[]}
            title="Add Compatibility"
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

const CompatibilityMatrixTable = observer(
  ({ category }: { category: Category }) => {
    const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();

    const { productStore } = useStore();
    useEffect(() => {
      productStore.genericProductStore.fetchAll(
        `page=all&category=${category.id}`
      );
    }, []);
    const matrix = [
      ...category.compatibilityMatrix.map((row, rowIndex) => [
        ...row.map((cell, colIndex) =>
          rowIndex === 0 || colIndex === 0 ? (
            cell
          ) : (
            <CompatibilityMatrixItem
              item={cell === "" ? "+" : cell}
              rowHeader={row[0]}
              colHeader={category.compatibilityMatrix[0][colIndex]}
            />
          )
        ),
        rowIndex === 0 ? (
          "New"
        ) : (
          <CompatibilityMatrixItem item={"+"} rowHeader={row[0]} />
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
        <div className="text-2xl text-center pt-10">
          {category.displayName} Compatibility List
        </div>
        <MyTable matrix={matrix} />
      </div>
    );
  }
);

export const CompatibilityView = observer(() => {
  const { isVisible, setVisible, setVisible1 } = useVisible();
  const { productStore } = useStore();
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
    productStore.categoryStore.fetchAll("page=all");
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
      {productStore.categoryStore.items
        .filter((s) => s.compatibilityMatrix.length > 0)
        .map((s, ind) => (
          <CompatibilityMatrixTable category={s} key={ind} />
        ))}

      <MySpeedDial actions={actions} />
    </>
  );
});
