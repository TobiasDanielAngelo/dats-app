import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import {
  camelToSnakeCase,
  getStoreSignature,
  toRomanWithExponents,
  toTitleCase,
} from "../../constants/helpers";
import { KV, Related, StateSetter } from "../../constants/interfaces";
import { formatValue } from "../../constants/JSXHelpers";
import { MyTable } from "../MyTable";

type MyGenericTableProps<T extends object> = {
  items: T[];
  itemMap?: KV<any>[];
  shownFields: string[];
  sortFields: string[];
  setSortFields: StateSetter<string[]>;
  priceFields?: string[];
  pageIds?: number[];
  setParams: (updater: (params: URLSearchParams) => URLSearchParams) => void;
  params: URLSearchParams;
  PageBar: React.FC;
  related: Related[];
  renderActions?: (item: T) => React.ReactNode;
};

export const MyGenericTable = observer(
  <T extends Record<string, any>>({
    items,
    itemMap,
    shownFields,
    sortFields,
    setSortFields,
    priceFields,
    pageIds,
    setParams,
    related,
    params,
    PageBar,
    renderActions,
  }: MyGenericTableProps<T>) => {
    const HeaderWithSort = ({ k }: { k: string }) => {
      const orderByParams = params.getAll("order_by");
      const snakeK = camelToSnakeCase(k);
      const isActive = orderByParams.some((s) => s.replace("-", "") === snakeK);
      const isDescending = orderByParams.includes(`-${snakeK}`);

      const handleSortClick = () => {
        setParams((t) => {
          const newParams = new URLSearchParams(t);
          const existingOrderBy = newParams.getAll("order_by");
          let newOrderBy: string[] = [];

          let currentState: "none" | "asc" | "desc" = "none";
          existingOrderBy.forEach((field) => {
            if (field === snakeK) currentState = "asc";
            if (field === `-${snakeK}`) currentState = "desc";
          });

          if (currentState === "none") {
            newOrderBy = [snakeK, ...existingOrderBy.slice(0, 1)];
          } else if (currentState === "asc") {
            newOrderBy = [
              `-${snakeK}`,
              ...existingOrderBy.filter((f) => f.replace("-", "") !== snakeK),
            ];
          } else {
            newOrderBy = existingOrderBy.filter(
              (f) => f.replace("-", "") !== snakeK
            );
          }

          newParams.delete("order_by");
          newOrderBy.forEach((field) => newParams.append("order_by", field));
          setSortFields(newOrderBy);
          newParams.set("page", "1");
          return newParams;
        });
      };

      return (
        <Text onPress={handleSortClick}>
          {toTitleCase(k)}
          {isActive && (
            <Text style={{ fontSize: 20, marginHorizontal: 10 }}>
              {isDescending ? " ▾ " : " ▴ "}
            </Text>
          )}
        </Text>
      );
    };

    const matrix = useMemo(() => {
      if (!items.length) return [];
      const header = [
        ...shownFields
          .filter((s) => Object.keys(items[0].$view).includes(s))
          .map((k) => <HeaderWithSort k={k} key={k} />),
        ...(renderActions ? ["Actions"] : []),
      ];
      const rows = items
        .filter((item) => (pageIds ? pageIds.includes(item.id) : true))
        .sort((a, b) => {
          return (pageIds?.indexOf(a.id) ?? 0) - (pageIds?.indexOf(b.id) ?? 0);
        })
        .map((item) => [
          ...shownFields
            .filter((s) => Object.keys(items[0].$view).includes(s))
            .map((key) => {
              const relatedName = Array.isArray(item[key])
                ? item[key].map(
                    (t: number) =>
                      related.find((s) => s.field === key && s.id === t)?.name
                  )
                : related.find((s) => s.field === key && s.id === item[key])
                    ?.name;
              const kv = itemMap?.find((s) => s.key === key);
              return key === "id"
                ? toRomanWithExponents(item[key])
                : formatValue(relatedName ?? item[key], key, priceFields, kv);
            }),
          ...(renderActions ? [renderActions(item)] : []),
        ]);

      return [header, ...rows];
    }, [
      params,
      getStoreSignature(items.map((s) => s.$)),
      shownFields.length,
      pageIds?.join(","),
      itemMap,
    ]);

    useEffect(() => {
      setParams((t) => {
        const newParams = new URLSearchParams(t);
        newParams.delete("order_by");
        sortFields.forEach((field) => newParams.append("order_by", field));
        newParams.set("page", "1");
        return newParams;
      });
    }, []);

    return (
      <View style={{ flex: 1 }}>
        <PageBar />
        <MyTable matrix={matrix} hidden={!shownFields.length} />
      </View>
    );
  }
);
