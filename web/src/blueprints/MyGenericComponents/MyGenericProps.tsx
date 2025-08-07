import { createContext, useContext } from "react";
import { type SetURLSearchParams } from "react-router-dom";
import type {
  GraphType,
  KV,
  PaginatedDetails,
  StateSetter,
} from "../../constants/interfaces";
import type { Related } from "../../components/core/_GenericStore";

export interface GenericViewProps {
  shownFields: string[];
  setShownFields: StateSetter<string[]>;
  sortFields: string[];
  setSortFields: StateSetter<string[]>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  setPageDetails: StateSetter<PaginatedDetails | undefined>;
  PageBar: React.FC;
  fetchFcn: () => void;
  itemMap: KV<any>[];
  related: Related[];
  graph?: GraphType;
}

export const defaultViewValues: GenericViewProps = {
  shownFields: [],
  setShownFields: () => {},
  sortFields: [],
  setSortFields: () => {},
  params: new URLSearchParams(),
  setParams: () => {},
  setPageDetails: () => {},
  fetchFcn: () => {},
  itemMap: [],
  related: [],
  graph: "line",
  pageDetails: undefined,
  PageBar: () => <></>,
};

export function createGenericViewContext() {
  const Context = createContext<GenericViewProps | null>(null);

  const useGenericView = () => {
    const ctx = useContext(Context);
    if (!ctx) return defaultViewValues;
    return ctx;
  };

  return { Context, useGenericView };
}

export function createGenericContext<T>() {
  const Context = createContext<T | null>(null);

  const useGeneric = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useGeneric must be used within its provider");
    return ctx;
  };

  return { Context, useGeneric };
}
