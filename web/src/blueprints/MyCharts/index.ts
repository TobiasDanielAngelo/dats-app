import { useEffect, useMemo, useState } from "react";
import { camelCaseToWords, getStoreSignature } from "../../constants/helpers";
import { type KV } from "../../constants/interfaces";
import type { Related } from "../../components/core/_GenericStore";

export type MyTrendChartProps<T extends Record<string, any>> = {
  data: T[];
  traceKey?: keyof T;
  xKey: keyof T;
  yKey: keyof T;
  width?: string | number;
  height?: string | number;
  colors?: string[];
  itemMap?: KV<any>[];
  related: Related[];
  formatter?: (value: number, name: string) => string[];
  excludedFromTotal?: string[];
  selectionLabel?: string;
  noTotal?: boolean;
  title?: string;
};

export type MyCircleChartProps<T extends Record<string, any>> = {
  data: T[];
  traceKey: keyof T;
  nameKey: keyof T;
  dataKey: keyof T;
  width?: string | number;
  height?: string | number;
  colors?: string[];
  itemMap?: KV<any>[];
  related: Related[];
  formatter?: (value: number, name: string) => string[];
  selectionLabel?: string;
  title?: string;
};

export function moveKeysToFront(obj: Record<string, any>, keys: string[]) {
  const reordered: Record<string, any> = {};
  keys.forEach((k) => {
    if (k in obj) reordered[k] = obj[k];
  });
  Object.keys(obj).forEach((k) => {
    if (!keys.includes(k)) reordered[k] = obj[k];
  });
  return reordered;
}

export function transformForTrendChart<T extends Record<string, any>>(
  data: T[],
  traceKey: keyof T,
  xAxis: keyof T,
  yAxis: keyof T,
  totalTitle: string,
  excludedFromTotal?: string[],
  noTotal?: boolean
) {
  const result: Record<string, any> = {};

  data.forEach((item) => {
    const x = item[xAxis];
    const trace = item[traceKey];
    const y = item[yAxis];

    if (!result[x])
      result[x] = noTotal
        ? { [xAxis]: x }
        : { [xAxis]: x, [totalTitle as string]: 0 };
    result[x][trace] = y;
    if (!noTotal)
      result[x][totalTitle] +=
        typeof y === "number" && !excludedFromTotal?.includes(trace) ? y : 0;
  });

  // Sort xAxis and compute cumulative
  const sorted = Object.values(result).sort((a, b) =>
    String(a[xAxis]).localeCompare(String(b[xAxis]))
  );

  const reordered = sorted.map((item) => {
    return moveKeysToFront(item, [totalTitle]);
  });

  return reordered;
  // return Object.values(result);
}

export const COLORS = [
  "#4FC3F7", // soft sky blue
  "#81C784", // soft green
  "#FFB74D", // soft orange
  "#BA68C8", // soft purple
  "#64B5F6", // soft blue
  "#E57373", // soft red
  "#AED581", // soft lime green
  "#FFD54F", // soft yellow
];

export const useTrendChart = <T extends Record<string, any>>(
  data: T[],
  traceKey: keyof T,
  xKey: keyof T,
  yKey: keyof T,
  itemMap?: KV<any>[],
  related?: Related[],
  excludedFromTotal?: string[],
  noTotal?: boolean
) => {
  const [shownFields, setShownFields] = useState<string[]>([]);
  const cleanedData = useMemo(
    () =>
      !data?.length
        ? []
        : (("$" in data[0] ? data.map((s: any) => s.$) : data) as T[]),
    [
      getStoreSignature(
        !data?.length
          ? []
          : (("$" in data[0] ? data.map((s: any) => s.$) : data) as T[])
      ),
    ]
  );

  const kv = itemMap?.find((s) => s.key === traceKey);

  const resolvedData = cleanedData.map((s) => {
    const relatedName = related?.find(
      (t) => t.field === traceKey && t.id === s[traceKey]
    )?.name;
    return {
      ...s,
      [traceKey]:
        kv?.label === ""
          ? kv.values.find((_, i) => i === s[traceKey])
          : kv?.values.find((v) => v.id === s[traceKey])?.[kv.label] ??
            relatedName ??
            camelCaseToWords(yKey as string) ??
            s[traceKey],
    };
  });

  const totalTitle = `Total${
    excludedFromTotal && excludedFromTotal.length > 0
      ? " excl. " + excludedFromTotal.join(", ")
      : ""
  }`;

  const transformedData = transformForTrendChart(
    resolvedData,
    traceKey,
    xKey,
    yKey,
    totalTitle,
    excludedFromTotal,
    noTotal
  );

  const allTraceKeys = Array.from(
    new Set(transformedData.flatMap((item) => Object.keys(item)))
  ).filter((key) => key !== xKey);

  useEffect(() => {
    setShownFields(noTotal ? [...allTraceKeys] : [totalTitle]);
  }, [allTraceKeys.length, noTotal, totalTitle]);

  return { allTraceKeys, transformedData, shownFields, setShownFields };
};

export const useCircleChart = <T extends Record<string, any>>(
  data: T[],
  nameKey: keyof T,
  dataKey: keyof T,
  traceKey: keyof T,
  itemMap?: KV<any>[],
  related?: Related[]
) => {
  const [selectedField, setSelectedField] = useState(-1);

  const cleanedData = useMemo(
    () =>
      !data?.length
        ? []
        : (("$" in data[0] ? data.map((s: any) => s.$) : data) as T[]),
    [
      getStoreSignature(
        !data?.length
          ? []
          : (("$" in data[0] ? data.map((s: any) => s.$) : data) as T[])
      ),
    ]
  );

  const kv = itemMap?.find((s) => s.key === nameKey);
  const resolvedData = cleanedData
    .filter((s) => s[traceKey] === selectedField)
    .map((s) => {
      const relatedName = related?.find(
        (t) => t.field === nameKey && t.id === s[nameKey]
      )?.name;
      return {
        [nameKey]:
          kv?.label === ""
            ? kv.values.find((_, i) => i === s[nameKey])
            : kv?.values.find((v) => v.id === s[nameKey])?.[kv.label] ??
              relatedName ??
              s[nameKey],
        [dataKey]: s[dataKey],
        [traceKey]: s[traceKey],
      };
    });

  useEffect(() => {
    if (cleanedData.length > 0) {
      setSelectedField(cleanedData[0][traceKey]);
    }
  }, [cleanedData]);

  return { resolvedData, selectedField, setSelectedField };
};
