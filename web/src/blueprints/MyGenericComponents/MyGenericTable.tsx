import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import {
  camelToSnakeCase,
  getStoreSignature,
  toRomanWithExponents,
  toTitleCase,
} from "../../constants/helpers";
import type { KV, StateSetter } from "../../constants/interfaces";
import { formatValue } from "../../constants/JSXHelpers";
import { MyTable } from "../MyTable";
import type { Related } from "../../constants/interfaces";
import _ from "lodash";

type MyGenericTableProps<T extends object> = {
  items: T[];
  itemMap?: KV<any>[];
  related?: Related[];
  shownFields: string[];
  sortFields: string[];
  setSortFields: StateSetter<string[]>;
  priceFields?: string[];
  pageIds?: number[];
  setParams: (updater: (params: URLSearchParams) => URLSearchParams) => void;
  params: URLSearchParams;
  PageBar: React.FC;
  renderActions: (item: T) => React.ReactNode;
};

export const MyGenericTable = observer(
  <T extends Record<string, any>>({
    items,
    itemMap,
    related,
    shownFields,
    sortFields,
    setSortFields,
    priceFields,
    pageIds,
    setParams,
    params,
    PageBar,
    renderActions,
  }: MyGenericTableProps<T>) => {
    const allKeys = shownFields;
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
        <div
          className="items-center justify-center flex flex-row gap-2 cursor-pointer"
          onClick={handleSortClick}
        >
          {toTitleCase(k)}
          {isActive && <div>{isDescending ? "▾" : "▴"}</div>}
        </div>
      );
    };

    const matrix = useMemo(() => {
      if (!items.length) return [];
      const header = [
        ...allKeys
          .filter((s) => Object.keys(items[0].$view).includes(s))
          .map((k) => <HeaderWithSort k={k} key={k} />),
        "Actions",
      ];

      const rows = items
        .filter((item) => (pageIds ? pageIds.includes(item.id) : true))
        .sort((a, b) => {
          return pageIds
            ? (pageIds.indexOf(a.id) ?? 0) - (pageIds.indexOf(b.id) ?? 0)
            : 1;
        })
        .map((item) => [
          ...allKeys
            .filter((s) => Object.keys(items[0].$view).includes(s))
            .map((key) => {
              const relatedName = Array.isArray(item[key])
                ? item[key].map(
                    (t: number) =>
                      related?.find((s) => s.field === key && s.id === t)?.name
                  )
                : related?.find((s) => s.field === key && s.id === item[key])
                    ?.name;

              return key === "id"
                ? toRomanWithExponents(item[key])
                : formatValue(relatedName ?? item[key], key, priceFields);
            }),
          renderActions(item),
        ]);

      return [header, ...rows];
    }, [
      params,
      items.length,
      JSON.stringify(related),
      getStoreSignature(items.map((s) => s.$)),
      shownFields.length,
      Number(pageIds?.map(String).join("")),
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
      <div className="flex flex-1 flex-col  max-h-[85vh] w-[90%] justify-center m-auto">
        <div className="sticky top-0">
          <PageBar />
        </div>
        <div
          className="flex-1 overflow-scroll"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <MyTable matrix={matrix} hidden={!shownFields.length} />
        </div>
      </div>
    );
  }
);
