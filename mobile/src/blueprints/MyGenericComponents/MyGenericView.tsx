import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import { SetURLSearchParams, useSearchParams } from "react-router-native";
import { SettingStore } from "../../components/core/SettingStore";
import { useStore } from "../../components/core/Store";
import { useSettings, VisibleMap } from "../../constants/hooks";
import {
  ActionModalDef,
  GraphType,
  KV,
  PaginatedDetails,
  Related,
  StateSetter,
} from "../../constants/interfaces";
import { MyModal } from "../MyModal";
import { MyPageBar } from "../MyPageBar";
import { MySpeedDial } from "../MySpeedDial";
import { GenericViewProps } from "./MyGenericProps";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";
import { toTitleCase } from "../../constants/helpers";

export const useViewValues = <
  U extends Object & { id?: number | string | null },
  T extends { $view: Record<string, any> }
>(
  settingStore: SettingStore,
  name: string,
  obj: T,
  graphs: GraphType[] = ["pie", "line"]
) => {
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const availableGraphs = graphs as GraphType[];
  const objWithFields = obj.$view;
  const [graph, setGraph] = useSettings<GraphType>(
    settingStore,
    "pie",
    `graph${name}`
  );
  const [shownFields, setShownFields] = useSettings(
    settingStore,
    Object.keys(objWithFields) as string[],
    `shownFields${name}`
  );
  const [sortFields, setSortFields] = useSettings(
    settingStore,
    [] as string[],
    `sortFields${name}`
  );

  return {
    pageDetails,
    setPageDetails,
    params,
    setParams,
    availableGraphs,
    graph,
    setGraph,
    shownFields,
    setShownFields,
    sortFields,
    setSortFields,
    objWithFields,
  };
};

export const MyGenericView = observer(
  (props: {
    fetchFcn: () => void;
    Context: React.Context<GenericViewProps | null>;
    CollectionComponent: React.FC;
    TableComponent: React.FC;
    FormComponent: React.ComponentType<{
      setVisible: (v: boolean) => void;
      fetchFcn: () => void;
    }>;
    FilterComponent: React.FC;
    shownFields: string[];
    setShownFields: StateSetter<string[]>;
    objWithFields: Record<string, any>;
    sortFields: string[];
    related: Related[];
    setSortFields: StateSetter<string[]>;
    graph: GraphType;
    setGraph: StateSetter<GraphType>;
    availableGraphs: GraphType[];
    actionModalDefs?: readonly ActionModalDef[];
    pageDetails: PaginatedDetails | undefined;
    setPageDetails: StateSetter<PaginatedDetails | undefined>;
    isVisible: VisibleMap;
    setVisible: (index: number, visible: boolean) => void;
    params: URLSearchParams;
    setParams: SetURLSearchParams;
    itemMap: KV<any>[];
    title: string;
  }) => {
    const {
      objWithFields,
      fetchFcn,
      Context,
      CollectionComponent,
      TableComponent,
      FormComponent,
      FilterComponent,
      actionModalDefs,
      isVisible,
      setVisible,
      shownFields,
      setShownFields,
      availableGraphs,
      pageDetails,
      setPageDetails,
      params,
      setParams,
      itemMap,
      sortFields,
      setSortFields,
      graph,
      setGraph,
      title,
    } = props;
    const { width, height } = useWindowDimensions();
    const isPortrait = height >= width;
    const { settingStore } = useStore();
    const setVisibleForIndex = (index: number) => {
      return (value: boolean) => {
        setVisible(index, value); // Use setVisible with the given index
      };
    };

    const defaultActionModalDefs = [
      {
        icon: "wpforms",
        label: "NEW",
        name: `Add ${title}`,
        modal: () => (
          <FormComponent
            fetchFcn={fetchFcn}
            setVisible={setVisibleForIndex(1)}
          />
        ),
      },
      {
        icon: "tasks",
        label: "FIELDS",
        name: "Show Fields",
        modal: () => (
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields as string[]}
            onChangeValue={(t) => setShownFields(t as string[])}
            options={Object.keys(objWithFields).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        ),
      },
      {
        icon: "filter",
        label: "FILTERS",
        name: "Filters",
        modal: () => <FilterComponent />,
      },
    ] satisfies ActionModalDef[];

    const graphIconMap: Record<GraphType, { icon: string; label: string }> =
      availableGraphs.reduce((acc, type) => {
        const iconMap: Record<GraphType, { icon: string; label: string }> = {
          pie: { icon: "chart-pie", label: "PIE" },
          line: { icon: "chart-line", label: "LINE" },
          bar: { icon: "chart-bar", label: "BAR" },
          area: { icon: "chart-area", label: "AREA" },
        };
        acc[type] = iconMap[type];
        return acc;
      }, {} as Record<GraphType, { icon: string; label: string }>);

    const [view, setView] = useState("table");

    const toggleGraph = () => {
      setGraph((prev) => {
        const currentIndex = availableGraphs.indexOf(prev);
        const nextIndex = (currentIndex + 1) % availableGraphs.length;
        return availableGraphs[nextIndex];
      });
    };

    const updatePage = (updateFn: (curr: number) => number) => {
      setParams((t: any) => {
        const p = new URLSearchParams(t);
        const curr = Number(p.get("page")) || 1;
        p.set("page", String(updateFn(curr)));
        return p;
      });
    };

    const PageBar = () => (
      <MyPageBar
        pageDetails={pageDetails}
        onPressPrev={() => updatePage((curr) => Math.max(curr - 1, 1))}
        onPressNext={() =>
          updatePage((curr) =>
            Math.min(curr + 1, pageDetails?.totalPages ?? curr)
          )
        }
        onPressPage={(n: number) => updatePage(() => n)}
        title={title}
      />
    );

    const toggleView = () => {
      setView((prev) => (prev === "card" ? "table" : "card"));
    };

    const Modals = [...defaultActionModalDefs, ...(actionModalDefs ?? [])].map(
      (s) => s.modal
    );

    const views = useMemo(
      () => [
        {
          icon: view === "card" ? "id-card" : "table",
          name: "Toggle View",
          onPress: toggleView,
        },
        {
          icon: {
            ...(graphIconMap[graph] ?? { icon: "question", label: "N/A" }),
          }.icon,
          name: "Toggle Graphs",
          onPress: toggleGraph,
        },
      ],
      [view, graph]
    );

    const actions = useMemo(
      () =>
        [...defaultActionModalDefs, ...(actionModalDefs ?? [])].map(
          (def, i) => ({
            icon: def.icon,
            name: def.name,
            onPress: () => setVisible(i + 1, true),
          })
        ),
      [setVisible, actionModalDefs, defaultActionModalDefs]
    );

    const value = {
      shownFields,
      setShownFields,
      params,
      setParams,
      pageDetails,
      setPageDetails,
      PageBar,
      fetchFcn,
      itemMap,
      graph,
      sortFields,
      setSortFields,
    };

    return (
      <Context.Provider value={value}>
        {view === "card" ? <CollectionComponent /> : <TableComponent />}
        {Modals.map((S, ind) => (
          <MyModal
            key={ind}
            isVisible={!!S && isVisible[ind + 1]}
            setVisible={
              ((v: boolean) =>
                setVisible(
                  ind + 1,
                  typeof v === "function" ? (v as any)(isVisible[ind + 1]) : v
                )) as any
            }
            disableClose
          >
            {S ? <S /> : <></>}
          </MyModal>
        ))}
        {isPortrait ? (
          <MySpeedDial actions={[...actions, ...views]} />
        ) : (
          <>
            <MySpeedDial actions={actions} />
            <MySpeedDial actions={views} leftSide />
          </>
        )}
      </Context.Provider>
    );
  }
);
