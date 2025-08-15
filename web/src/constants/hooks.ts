import moment from "moment";
import { useEffect, useState } from "react";
import { handleKeyDown } from "./helpers";
import type { CalendarView, KeyboardCodes, StateSetter } from "./interfaces";
import { Setting, SettingStore } from "../components/core/SettingStore";
import Swal from "sweetalert2";

export const useKeyPress = (keys: KeyboardCodes[], callbackFcn: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const held = new Set<string>();

      if (e.ctrlKey) held.add("Control");
      if (e.metaKey) held.add("Meta");
      if (e.shiftKey) held.add("Shift");
      if (e.altKey) held.add("Alt");

      held.add(e.code); // e.g., KeyC, Digit1, etc.
      const allPressed = keys.every((k) => held.has(k));
      if (allPressed) callbackFcn();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [keys, callbackFcn]);
};

export const useFilterParams = (keys: string[], callbackFcn: () => void) => {
  return useEffect(() => {
    document.addEventListener("keydown", (e) =>
      handleKeyDown(e, keys, callbackFcn)
    );

    return () => {
      document.removeEventListener("keydown", (e) =>
        handleKeyDown(e, keys, () => callbackFcn)
      );
    };
  }, []);
};

export const useWindowWidth = () => {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

export function useSettings<T>(
  settingStore: SettingStore,
  defaultValue: T,
  key: string
) {
  const setting = settingStore.items.find((s: any) => s.key === key);
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored
        ? (JSON.parse(stored) as T)
        : (JSON.parse(setting?.value ?? JSON.stringify(defaultValue)) as T) ??
            defaultValue;
    } catch {
      return (
        (JSON.parse(setting?.value ?? JSON.stringify(defaultValue)) as T) ??
        defaultValue
      );
    }
  });

  useEffect(() => {
    if (settingStore.items.length === 0) {
      return;
    }
    const setting = settingStore.items.find((s: Setting) => s.key === key);
    const settingId = setting?.id;
    settingId
      ? settingStore.updateItem(settingId, { value: JSON.stringify(state) })
      : settingStore.addItem({ key, value: JSON.stringify(state) });
    localStorage.setItem(key, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}

export type VisibleMap = Record<number, boolean>;
export type Index = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type UseVisibleMapReturn = {
  isVisible: VisibleMap;
  toggleVisible: (key: number) => void;
  setVisible: (key: number, value: boolean) => void;
  setVisibleForIndex: (index: Index) => (value: boolean) => void;
} & {
  [K in Index as `setVisible${K}`]: StateSetter<boolean>;
} & {
  [K in Index as `isVisible${K}`]: boolean;
};

/**
 * useVisibleMap - Custom hook to manage multiple visibility states (1 to count).
 *
 * @param count - Positive integer. The hook creates keys 1 to `count`, each mapped to a boolean.
 *
 * @returns An object containing:
 * - `visible`: Record<number, boolean> — the visibility state of each key.
 * - `setVisible(key, value)`: Set a specific key's visibility.
 * - `toggleVisible(key)`: Toggle a specific key's visibility.
 * - `setVisible1`, `setVisible2`, ..., `setVisibleN`: Direct setters for each key for cleaner usage.
 *
 * Example:
 * const { visible, setVisible1, toggleVisible } = useVisibleMap(4);
 * setVisible1?.(true);       // Sets visible[1] = true
 * toggleVisible(2);          // Toggles visible[2]
 *
 * console.log(visible[1]);   // true
 */
export function useVisible(): UseVisibleMapReturn {
  const indices = Array.from({ length: 10 }, (_, i) => (i + 1) as Index);

  const initialMap = Object.fromEntries(
    indices.map((i) => [i, false])
  ) as VisibleMap;
  const [isVisible, setVisibleState] = useState<VisibleMap>(initialMap);

  const toggleVisible = (key: Index) =>
    setVisibleState((prev) => ({ ...prev, [key]: !prev[key] }));

  const setVisible = (key: Index, value: boolean) =>
    setVisibleState((prev) => ({ ...prev, [key]: value }));

  const individualSetters = Object.fromEntries(
    indices.map((i) => {
      const setter: StateSetter<boolean> = (value) => {
        setVisibleState((prev) => ({
          ...prev,
          [i]: typeof value === "function" ? (value as any)(prev[i]) : value,
        }));
      };
      return [`setVisible${i}`, setter];
    })
  );

  const setVisibleForIndex = (index: Index) => {
    return (value: boolean) => {
      setVisible(index, value); // Use setVisible with the given index
    };
  };

  const isVisibleMap = Object.fromEntries(
    indices.map((i) => [`isVisible${i}`, isVisible[i]])
  );

  return {
    isVisible,
    toggleVisible,
    setVisible,
    setVisibleForIndex,
    ...individualSetters,
    ...isVisibleMap,
  } as UseVisibleMapReturn;
}

export const useIsUnhoverable = () => {
  const [isUnhoverable, setIsUnhoverable] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    const handler = (e: MediaQueryListEvent) => setIsUnhoverable(e.matches);

    setIsUnhoverable(query.matches); // initial check
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return isUnhoverable;
};

export function useLocalStorageState<T>(defaultValue: T, key: string) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

export const useCalendarProps = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const range =
    view === "week"
      ? moment(date).format("YYYY-MM-DD")
      : view === "month"
      ? moment(date).format("YYYY-MM")
      : view === "year"
      ? moment(date).format("YYYY")
      : "month";

  const start = moment(date).startOf("day");
  const end = moment(date).endOf("day");

  return { date, setDate, view, setView, range, start, end };
};

export type CalendarProps = ReturnType<typeof useCalendarProps>;

export function useLoadingAlert(
  countToUpdate: number,
  callbackFcn: () => Promise<any>
) {
  useEffect(() => {
    if (countToUpdate > 0) {
      Swal.fire({
        title: "Updating...",
        text: "Please wait while data updates.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      (async () => {
        await callbackFcn();
      })();
    } else {
      Swal.close();
    }
  }, [countToUpdate, callbackFcn]);
}
