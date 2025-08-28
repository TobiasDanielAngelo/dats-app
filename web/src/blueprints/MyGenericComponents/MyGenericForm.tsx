import moment from "moment";
import { useState } from "react";
import { toTitleCase } from "../../constants/helpers";
import { type Field } from "../../constants/interfaces";
import { MyForm } from "../MyForm";
import { IStore } from "./MyGenericStore";

export interface MyGenericFormProps<T extends { id: string | number }> {
  item?: Partial<T & { id?: number | string; $?: any }>;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
  fields: Field[][];
  isLoading?: boolean;
  objectName: string;
  store: IStore;
  title?: string;
}

export interface MyGenericForm<T extends { id: string | number }> {
  item?: Partial<T & { id?: number | string; $?: any }>;
  setVisible?: (t: boolean) => void;
  store?: IStore;
  hiddenFields?: (keyof T)[];
  fetchFcn?: () => void;
  title?: string;
}

function filterByKeys<T extends object>(obj: T, keys: string[]): Partial<T> {
  return Object.entries(obj)
    .filter(([key]) => keys.includes(key))
    .reduce((acc, [key, value]) => {
      (acc as any)[key] = value;
      return acc;
    }, {} as Partial<T>);
}

export function MyGenericForm<T extends { id: string | number }>({
  item,
  setVisible,
  fetchFcn,
  isLoading,
  fields,
  objectName,
  store,
  title,
}: MyGenericFormProps<T>) {
  const theTitle =
    title ??
    (item?.id
      ? `Edit ${toTitleCase(objectName)}`
      : `${toTitleCase(objectName)} Creation Form`);

  const {
    dateFields,
    datetimeFields,
    timeFields,
    addItem,
    updateItem,
    deleteItem,
    fetchAll,
  } = store;

  const transformFrom = (raw: T): T => {
    const copy = { ...raw };
    dateFields.forEach((k) => {
      if (copy[k as keyof T])
        copy[k as keyof T] = moment(copy[k as keyof T] as any).format(
          "MMM D, YYYY"
        ) as any;
    });
    datetimeFields.forEach((k) => {
      if (copy[k as keyof T])
        copy[k as keyof T] = moment(copy[k as keyof T] as any).format(
          "MMM D YYYY h:mm A"
        ) as any;
    });
    timeFields.forEach((k) => {
      if (copy[k as keyof T])
        copy[k as keyof T] = moment(
          copy[k as keyof T] as any,
          "HH:mm:ss"
        ).format("h:mm A") as any;
    });

    return copy;
  };

  const transformTo = (raw: T): T => {
    const copy = { ...raw };

    dateFields.forEach((k) => {
      const val = copy[k as keyof T];
      if (val === "") {
        copy[k as keyof T] = null as any;
      } else if (val) {
        copy[k as keyof T] = moment(val as any, "MMM D, YYYY").format(
          "YYYY-MM-DD"
        ) as any;
      }
    });

    datetimeFields.forEach((k) => {
      const val = copy[k as keyof T];
      if (val === "") {
        copy[k as keyof T] = null as any;
      } else if (val) {
        copy[k as keyof T] = moment(
          val as any,
          "MMM D YYYY h:mm A"
        ).toISOString() as any;
      }
    });

    timeFields.forEach((k) => {
      const val = copy[k as keyof T];
      if (val === "") {
        copy[k as keyof T] = null as any;
      } else if (val) {
        copy[k as keyof T] = moment(val as any, "h:mm A").format(
          "HH:mm:ss"
        ) as any;
      }
    });
    return copy;
    // cleanObject(copy as Record<string, any>) as T;
  };

  const [details, setDetails] = useState<T>(() =>
    item ? transformFrom((item.$ ?? item) as T) : ({} as T)
  );

  const [msg, setMsg] = useState<Object>();

  const onClickCreate = async () => {
    const resp = await addItem(transformTo(details));
    if (!resp.ok) return setMsg(resp.details);
    fetchFcn?.();
    setVisible?.(false);
  };

  const onClickCreateAdd = async () => {
    const resp = await addItem(transformTo(details));
    if (!resp.ok) return setMsg(resp.details);
    fetchAll();
    setDetails(transformFrom({} as T));
    setVisible?.(false);
  };

  const onClickEdit = async () => {
    if (!item?.id) return;
    const resp = await updateItem(
      item.id,
      filterByKeys(
        transformTo(details),
        fields.flat(1).map((s) => s.name)
      )
    );
    if (!resp.ok) return setMsg(resp.details);
    fetchAll();
    setVisible?.(false);
  };

  const onClickDelete = async () => {
    if (!item?.id) return;
    const resp = await deleteItem(item.id);
    if (!resp.ok) return setMsg(resp.details);
    fetchAll();
    setVisible?.(false);
  };

  return (
    <div className="items-center">
      <MyForm
        fields={fields}
        title={theTitle}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item?.id ? onClickEdit : onClickCreate}
        onClickSubmitAdd={onClickCreateAdd}
        hasDelete={!!item?.id}
        onDelete={onClickDelete}
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
}
