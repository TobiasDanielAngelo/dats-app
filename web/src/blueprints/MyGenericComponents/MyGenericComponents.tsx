import _ from "lodash";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { IStore, KeystoneModel } from "./MyGenericStore";
import { useStore } from "../../components/core/Store";
import {
  DjangoModelField,
  fieldToFormField,
  toDefaultItem,
} from "../../constants/djangoHelpers";
import { PathParts } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef, KV } from "../../constants/interfaces";
import { SideBySideView } from "../SideBySideView";
import { MyGenericCard } from "./MyGenericCard";
import { MyGenericCollection } from "./MyGenericCollection";
import { MyGenericFilter } from "./MyGenericFilter";
import { MyGenericForm } from "./MyGenericForm";
import { createGenericViewContext } from "./MyGenericProps";
import { MyGenericRow } from "./MyGenericRow";
import { MyGenericTable } from "./MyGenericTable";
import { MyGenericView, useViewValues } from "./MyGenericView";
import { MyPageBar } from "../MyPageBar";
import { useSearchParams } from "react-router-dom";

export const MyGenericComponents = <
  T extends KeystoneModel<{ id: number | string | null }>
>(
  ModelClass: {
    new (...args: any[]): T;
  },
  fields: Record<string, DjangoModelField>,
  modelNameParts: PathParts
) => {
  type ExtractModelArg<U> = U extends KeystoneModel<infer X> ? X : never;

  type NonNullableFields<T> = {
    [K in keyof T]: Exclude<T[K], null>;
  };

  // ✅ Correct: use instance type, not constructor type
  type ModelInstance = InstanceType<typeof ModelClass>;
  type ModelData = ExtractModelArg<ModelInstance>;
  type NonNullableModelData = NonNullableFields<ModelData>;

  const selectedStore1 = `${modelNameParts.folder}Store`;
  const selectedStore2 = `${modelNameParts.camelCase}Store`;

  const { Context, useGenericView } = createGenericViewContext();

  const FormComponent = (props: MyGenericForm<NonNullableModelData>) => {
    const { item, setVisible } = props;
    const store = useStore();
    const allFields = fieldToFormField(
      fields,
      modelNameParts.folder,
      [],
      store
    );
    const defaultItem = toDefaultItem(allFields);

    return (
      <MyGenericForm
        item={item ?? defaultItem}
        fields={allFields}
        objectName={modelNameParts.titleCase}
        store={(store as any)[selectedStore1][selectedStore2]}
        setVisible={setVisible}
      />
    );
  };

  const FilterComponent = () => {
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2];

    return (
      <MyGenericFilter
        view={new ModelClass({}).$view}
        title={modelNameParts.titleCase}
        dateFields={[
          ...theStore.dateFields,
          ...theStore.datetimeFields,
          ...theStore.timeFields,
        ]}
        relatedFields={theStore.relatedFields}
        optionFields={theStore.optionFields}
      />
    );
  };

  const RowComponent = (props: { item: NonNullableModelData }) => {
    const { item } = props;
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2];

    return (
      <MyGenericRow
        item={item}
        FormComponent={Form}
        deleteItem={theStore.deleteItem}
        fetchFcn={theStore.fetchAll}
      />
    );
  };

  const TableComponent = () => {
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2];
    const values = useGenericView();

    return (
      <MyGenericTable
        items={theStore.items}
        pageIds={theStore.pageDetails.ids}
        priceFields={theStore.priceFields}
        renderActions={(i: any) => <Row item={i} />}
        {...values}
        PageBar={PageBar}
      />
    );
  };

  const CardComponent = (props: {
    item: NonNullableModelData & { $view: Required<ModelData> };
  }) => {
    const { item } = props;
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2];

    const shownFields = Array.from(
      new Set(
        (theStore.items.length > 0
          ? Object.keys(theStore.items[0].$view)
          : []
        ).map((s) => _.camelCase(s))
      )
    );

    return (
      <MyGenericCard
        item={item}
        shownFields={shownFields}
        header={["id"]}
        prices={theStore.priceFields}
        FormComponent={Form}
        deleteItem={theStore.deleteItem}
        fetchFcn={theStore.fetchAll}
        itemMap={[]}
        related={theStore.related}
      />
    );
  };

  const PageBar = observer(() => {
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2] as IStore;
    const [params, setParams] = useSearchParams();

    const updatePage = (updateFn: (curr: number) => number) => {
      setParams((t) => {
        const p = new URLSearchParams(t);
        const curr = Number(p.get("page")) || 1;
        p.set("page", String(updateFn(curr)));
        return p;
      });
    };

    useEffect(() => {
      theStore.fetchAll(params.size ? params.toString() : "page=1");
    }, [params]);

    return (
      <MyPageBar
        pageDetails={theStore.pageDetails}
        onClickPrev={() => updatePage((curr) => Math.max(curr - 1, 1))}
        onClickNext={() =>
          updatePage((curr) =>
            Math.min(curr + 1, theStore.pageDetails.totalPages ?? curr)
          )
        }
        onClickPage={(n: number) => updatePage(() => n)}
        title={modelNameParts.titleCase}
      />
    );
  });

  const CollectionComponent = () => {
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2] as IStore;
    return (
      <SideBySideView
        SideA={
          <MyGenericCollection
            CardComponent={Card}
            title={modelNameParts.titleCase}
            pageDetails={theStore.pageDetails}
            PageBar={PageBar}
            items={theStore.items}
            updates={theStore.countToUpdate}
          />
        }
        SideB=""
        ratio={0.7}
      />
    );
  };

  const ViewComponent = () => {
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2] as IStore;
    const { isVisible, setVisible } = useVisible();
    const values = useViewValues(
      store.settingStore,
      modelNameParts.rawName,
      new ModelClass({})
    );

    const itemMap = useMemo(() => [] satisfies KV<any>[], []);

    const actionModalDefs = [] satisfies ActionModalDef[];

    return (
      <MyGenericView
        title={modelNameParts.titleCase}
        Context={Context}
        CollectionComponent={Collection}
        FormComponent={Form}
        FilterComponent={Filter}
        actionModalDefs={actionModalDefs}
        TableComponent={Table}
        related={theStore.related}
        fetchFcn={theStore.fetchAll}
        isVisible={isVisible}
        setVisible={setVisible}
        itemMap={itemMap}
        {...values}
        pageDetails={theStore.pageDetails}
      />
    );
  };

  const Form = observer(FormComponent);
  const Filter = observer(FilterComponent);
  const Row = observer(RowComponent);
  const Table = observer(TableComponent);
  const Card = observer(CardComponent);
  const Collection = observer(CollectionComponent);
  const View = observer(ViewComponent);

  return {
    Form,
    Filter,
    Row,
    Table,
    Card,
    Collection,
    View,
  };
};
