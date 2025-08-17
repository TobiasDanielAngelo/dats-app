import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useVisible } from "../../constants/hooks";
import {
  ActionModalDef,
  type ItemDetailsProps,
  type KV,
  type Page,
} from "../../constants/interfaces";
import { ItemDetails } from "../ItemDetails";
import { MyConfirmModal } from "../MyConfirmModal";
import { MyDropdownMenu } from "../MyDropdownMenu";
import { type IconName, MyIcon } from "../MyIcon";
import { MyModal } from "../MyModal";
import { type Related } from "../../constants/interfaces";

export interface IAction {
  onClick: () => void;
  icon: IconName;
  color?:
    | "inherit"
    | "action"
    | "disabled"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
}

interface MyGenericCardProps<T> extends ItemDetailsProps<T> {
  FormComponent: React.ComponentType<{
    item: T;
    setVisible: (v: boolean) => void;
    fetchFcn: () => void;
  }>;
  deleteItem: (
    id: number | string
  ) => Promise<{ ok: boolean; details?: string }>;
  fetchFcn: () => void;
  moreActions?: ActionModalDef[];
  dropdownActions?: Page[];
  itemMap?: KV<any>[];
  related: Related[];
}

export const MyGenericCard = observer(
  <T extends object & { id: number | string | null; $view: any }>({
    item,
    shownFields,
    header,
    important,
    prices,
    FormComponent,
    deleteItem,
    fetchFcn,
    moreActions,
    dropdownActions,
    itemMap,
    related,
  }: MyGenericCardProps<T>) => {
    const {
      isVisible1,
      setVisible1,
      isVisible2,
      setVisible2,
      isVisible3,
      setVisible3,
      setVisible,
      isVisible,
    } = useVisible();
    const [showMore, setShowMore] = useState(false);
    const [msg, setMsg] = useState("");

    const onDelete = async () => {
      const resp = await deleteItem(item.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details ?? "Error");
        return;
      }
      fetchFcn();
      setVisible2(false);
    };

    const setVisibleForIndex = (index: number) => {
      return (value: boolean) => {
        setVisible(index, value); // Use setVisible with the given index
      };
    };

    const actions = [
      { onClick: () => setVisible1(true), title: "Edit" },
      { onClick: () => setVisible2(true), title: "Delete" },
      ...(dropdownActions ?? []),
    ] satisfies Page[];

    return (
      <div className="m-3 dark:border-gray-700 border-teal-300  rounded-lg pt-3 px-2 border">
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
            <ItemDetails<T>
              item={item.$view}
              shownFields={shownFields}
              header={header}
              important={important}
              prices={prices}
              showMore={showMore}
              setShowMore={setShowMore}
              itemMap={itemMap}
              related={related}
            />

            <div className="flex justify-between mt-2 flex-row-reverse">
              <div className="relative">
                <MyIcon
                  icon="Settings"
                  onClick={() => setVisible3(true)}
                  fontSize="small"
                />
                <MyDropdownMenu
                  setOpen={setVisible3}
                  open={isVisible3}
                  actions={actions}
                  margin={9}
                />
              </div>
              {moreActions?.map((s, ind) => (
                <div key={ind}>
                  <MyIcon
                    icon={s.icon}
                    onClick={
                      s.onClick ??
                      (() => {
                        setVisible(ind + 4, true);
                      })
                    }
                    hidden={s.hidden}
                    fontSize="small"
                  />
                  <MyModal
                    isVisible={!!s.modal && isVisible[ind + 4]}
                    setVisible={setVisibleForIndex(ind + 4)}
                    title={s.label}
                  >
                    {s.modal ? (
                      <s.modal
                        setVisible={setVisibleForIndex(ind + 4)}
                        item={item}
                      />
                    ) : (
                      <></>
                    )}
                  </MyModal>
                </div>
              ))}
              <MyIcon
                icon={showMore ? "ExpandLess" : "ExpandMore"}
                onClick={() => setShowMore((t) => !t)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
