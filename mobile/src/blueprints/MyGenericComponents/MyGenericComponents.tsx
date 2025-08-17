import { observer } from "mobx-react-lite";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-native";
import { Store, useStore } from "../../components/core/Store";
import {
  DjangoModelField,
  fieldToFormField,
  toDefaultItem,
} from "../../constants/djangoHelpers";
import { PathParts } from "../../constants/helpers";
import { useLoadingAlert, useVisible } from "../../constants/hooks";
import { ActionModalDef, KV } from "../../constants/interfaces";
import { FieldToRelatedModals } from "../../constants/JSXHelpers";
import { MyModal } from "../MyModal";
import { MyPageBar } from "../MyPageBar";
import { SideBySideView } from "../SideBySideView";
import { MyGenericCard } from "./MyGenericCard";
import { MyGenericCollection } from "./MyGenericCollection";
import { MyGenericFilter } from "./MyGenericFilter";
import { MyGenericForm } from "./MyGenericForm";
import { createGenericViewContext } from "./MyGenericProps";
import { MyGenericRow } from "./MyGenericRow";
import { IStore, KeystoneModel } from "./MyGenericStore";
import { MyGenericTable } from "./MyGenericTable";
import { MyGenericView, useViewValues } from "./MyGenericView";

export const MyGenericComponents = <
  T extends KeystoneModel<{ id: number | string | null }>,
  V extends object
>(
  ModelClass: {
    new (...args: any[]): T;
  },
  fields: Record<string, DjangoModelField>,
  modelNameParts: PathParts,
  SideB?: React.ReactNode,
  MainModals?: ActionModalDef[],
  MoreModals?: (
    item: any,
    context: {
      value: V;
      setValue: (t: V) => void;
    },
    store?: Store
  ) => ActionModalDef[]
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
  const morePriceFields = Object.entries(fields)
    .filter(([_, value]) => value.field === "AmountField")
    .map(([key]) => key);

  const { Context, useGenericView } = createGenericViewContext();

  const RelatedFieldModals = () =>
    FieldToRelatedModals(fields, modelNameParts.folder);

  const FormComponent = (props: MyGenericForm<NonNullableModelData>) => {
    const { item, setVisible, hiddenFields, fetchFcn } = props;
    const store = useStore();
    const [key, setKey] = useState("");
    const allFields = fieldToFormField(
      fields,
      modelNameParts.folder,
      modelNameParts.rawName,
      hiddenFields as string[],
      store,
      setKey
    );
    const defaultItem = toDefaultItem(allFields);

    const setVisibleViaKey = () => {
      setKey("");
    };

    const Modals = RelatedFieldModals?.();
    const ModalComponent = Modals?.[key];

    return (
      <>
        <MyModal
          isVisible={key !== "" && !!ModalComponent}
          setVisible={setVisibleViaKey}
        >
          {ModalComponent ? (
            <ModalComponent setVisible={setVisibleViaKey} />
          ) : null}
        </MyModal>
        <MyGenericForm
          item={item ?? defaultItem}
          fields={allFields}
          objectName={modelNameParts.titleCase}
          store={(store as any)[selectedStore1][selectedStore2]}
          setVisible={setVisible}
          fetchFcn={fetchFcn}
        />
      </>
    );
  };

  const FilterComponent = () => {
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2];

    return (
      <MyGenericFilter
        fields={fields}
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
    const context = useContext(SomeContext);

    return (
      <MyGenericRow
        item={item}
        FormComponent={Form}
        deleteItem={theStore.deleteItem}
        fetchFcn={theStore.fetchAll}
        moreActions={MoreModals?.(item, context, store)}
      />
    );
  };

  const TableComponent = (props: {
    shownFields?: (keyof T)[];
    items?: ModelInstance[];
    renderActions?: (item: ModelInstance) => React.ReactNode;
  }) => {
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2] as IStore;
    const values = useGenericView();

    return (
      <MyGenericTable
        items={props.items ?? theStore.items}
        pageIds={props.items ? undefined : theStore.pageDetails.ids}
        priceFields={[...theStore.priceFields, ...morePriceFields]}
        renderActions={props.renderActions ?? ((i: any) => <Row item={i} />)}
        {...values}
        related={theStore.related}
        shownFields={[
          ...((props.shownFields ?? values.shownFields) as string[]),
        ]}
        sortFields={
          values.sortFields.length ? values.sortFields : ["-created_at"]
        }
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
    const values = useGenericView();
    const context = useContext(SomeContext);

    return (
      <MyGenericCard
        item={item}
        {...values}
        header={["id", "createdAt"]}
        important={["displayName"]}
        prices={[...theStore.priceFields, ...morePriceFields]}
        FormComponent={Form}
        deleteItem={theStore.deleteItem}
        fetchFcn={theStore.fetchAll}
        related={theStore.related}
        moreActions={MoreModals?.(item, context, store)}
      />
    );
  };

  const PageBar = observer(() => {
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2] as IStore;
    const [params, setParams] = useSearchParams();
    useLoadingAlert(theStore.countToUpdate ?? 0, theStore.fetchUpdated);

    const updatePage = (updateFn: (curr: number) => number) => {
      setParams((t: URLSearchParams) => {
        const p = new URLSearchParams(t);
        const curr = Number(p.get("page")) || 1;
        p.set("page", String(updateFn(curr)));
        return p;
      });
    };

    useEffect(() => {
      if (params.toString()) {
        theStore.fetchAll(params.toString());
      }
    }, [params.toString()]);

    return (
      <MyPageBar
        pageDetails={theStore.pageDetails}
        onPressPrev={() => updatePage((curr) => Math.max(curr - 1, 1))}
        onPressNext={() =>
          updatePage((curr) =>
            Math.min(curr + 1, theStore.pageDetails.totalPages ?? curr)
          )
        }
        onPressPage={(n: number) => updatePage(() => n)}
        title={modelNameParts.titleCasePlural}
      />
    );
  });

  const SomeContext = createContext<{ value: V; setValue: (t: V) => void }>({
    value: {} as V,
    setValue: () => {},
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
          />
        }
        SideB={SideB}
        ratio={0.7}
      />
    );
  };

  const ViewComponent = (props: { routePath: string }) => {
    const store = useStore();
    const theStore = (store as any)[selectedStore1][selectedStore2] as IStore;
    const { isVisible, setVisible } = useVisible();
    const values = useViewValues(
      store.settingStore,
      modelNameParts.rawName,
      new ModelClass({})
    );

    const location = useLocation();
    const match =
      props.routePath.replaceAll("/", "") ===
      location.pathname.replaceAll("/", "");

    const itemMap = useMemo(() => [] satisfies KV<any>[], []);

    useEffect(() => {
      if (!match) return;
      let count = 0;
      let timeoutId: NodeJS.Timeout;

      const run = () => {
        count++;
        if (count < 20) {
          const lastUpdated =
            theStore.lastUpdated === ""
              ? new Date().toISOString()
              : theStore.lastUpdated;
          theStore.checkUpdated(lastUpdated);
          timeoutId = setTimeout(run, 5000);
        } else {
          theStore.fetchUpdated();
        }
      };

      run();

      return () => clearTimeout(timeoutId);
    }, [match, theStore.lastUpdated]);

    const actionModalDefs = (MainModals ?? []) satisfies ActionModalDef[];

    const [value, setValue] = useState<V>({} as V);

    const val = {
      value,
      setValue,
    };

    return (
      <SomeContext.Provider value={val}>
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
      </SomeContext.Provider>
    );
  };

  const Form = observer(FormComponent);
  const Filter = observer(FilterComponent);
  const Row = observer(RowComponent);
  const Table = observer(TableComponent);
  const Card = observer(CardComponent);
  const Collection = observer(CollectionComponent);
  const TheView = observer(ViewComponent);
  const MoreContext = SomeContext;

  return {
    Form,
    Filter,
    Row,
    Table,
    Card,
    Collection,
    TheView,
    MoreContext,
  };
};
