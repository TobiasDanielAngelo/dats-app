import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ItemDetails } from "../../blueprints/ItemDetails";
import { useVisible } from "../../constants/hooks";
import { MyConfirmModal } from "../MyConfirmModal";
import { MyIcon } from "../MyIcon";
import { MyModal } from "../MyModal";
import type { ItemDetailsProps, KV } from "../../constants/interfaces";
import type { Related } from "../../constants/interfaces";

interface MyGenericRecursiveCardProps<T> extends ItemDetailsProps<T> {
  FormComponent: React.ComponentType<{
    item: T;
    setVisible: (v: boolean) => void;
    fetchFcn: () => void;
  }>;
  deleteItem: (
    id: number | string
  ) => Promise<{ ok: boolean; details?: string }>;
  fetchFcn: () => void;
  items: T[];
  itemMap?: KV<any>[];
  related: Related[];
  parentKey: keyof T;
  border?: boolean;
}

export const MyGenericRecursiveCard = observer(
  <T extends object & { id: number | string }>({
    item,
    header,
    important,
    prices,
    shownFields,
    FormComponent,
    deleteItem,
    fetchFcn,
    items,
    parentKey,
    border,
    itemMap = [],
    related = [],
  }: MyGenericRecursiveCardProps<T>) => {
    const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
    const [msg, setMsg] = useState("");

    const subItems = items.filter((g) => g[parentKey] === item.id);
    const [showChildren, setShowChildren] = useState(true);

    const onDelete = async () => {
      const resp = await deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details ?? "Error");
        return;
      }
      setVisible2(false);
    };

    return (
      <div
        className="m-1 dark:border-gray-700 border-teal-300 rounded-lg p-1"
        style={{ borderWidth: border ? 1 : 0 }}
      >
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <FormComponent
            item={item}
            setVisible={setVisible1}
            fetchFcn={fetchFcn}
          />
        </MyModal>
        <MyConfirmModal
          isVisible={isVisible2}
          setVisible={setVisible2}
          onClickCheck={onDelete}
          actionName="Delete"
          msg={msg}
        />

        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex flex-row">
              <div className="text-lg cursor-pointer mx-2 font-mono text-gray-500 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <MyIcon
                    icon="Close"
                    onClick={() => setVisible2(true)}
                    fontSize="small"
                  />
                  <MyIcon
                    icon="Edit"
                    onClick={() => setVisible1(true)}
                    fontSize="small"
                  />
                  <MyIcon
                    icon={showChildren ? "ExpandLess" : "ExpandMore"}
                    hidden={subItems.length <= 0}
                    onClick={() => setShowChildren((prev) => !prev)}
                  />
                </div>
              </div>
              <div className="flex-col w-full">
                <ItemDetails
                  item={item}
                  shownFields={shownFields}
                  header={header}
                  important={important}
                  prices={prices}
                  itemMap={itemMap}
                  related={related}
                />
              </div>
            </div>
          </div>
        </div>
        {showChildren && subItems.length > 0 && (
          <div className="ml-4 mt-2 space-y-2 border-l-2 border-teal-500 dark:border-gray-600 pl-2">
            {subItems.map((s) => (
              <MyGenericRecursiveCard
                key={s.id}
                item={s}
                header={header}
                important={important}
                prices={prices}
                shownFields={shownFields}
                FormComponent={FormComponent}
                deleteItem={deleteItem}
                fetchFcn={fetchFcn}
                items={items}
                parentKey={parentKey}
                related={related}
                itemMap={itemMap}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
