import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef } from "../../constants/interfaces";
import { MyConfirmModal } from "../MyConfirmModal";
import { MyIcon } from "../MyIcon";
import { MyModal } from "../MyModal";
import { MyGenericForm } from "./MyGenericForm";

interface MyGenericRowProps<T extends { id: number | string }> {
  item: T;
  FormComponent: React.ComponentType<MyGenericForm<T>>;
  deleteItem: (
    id: number | string
  ) => Promise<{ ok: boolean; details?: string }>;
  fetchFcn: () => void;
  moreActions?: ActionModalDef[];
}

export const MyGenericRow = observer(
  <T extends { id: number | string }>({
    item,
    FormComponent,
    deleteItem,
    fetchFcn,
    moreActions,
  }: MyGenericRowProps<T>) => {
    const {
      isVisible1,
      setVisible1,
      isVisible2,
      setVisible2,
      setVisible,
      isVisible,
    } = useVisible();
    const [msg, setMsg] = useState("");

    const setVisibleForIndex = (index: number) => {
      return (value: boolean) => {
        setVisible(index, value); // Use setVisible with the given index
      };
    };

    const onDelete = async () => {
      const resp = await deleteItem(item.id);
      if (!resp.ok) {
        setMsg(resp.details ?? "Error");
        return;
      }
      fetchFcn();
      setVisible2(false);
    };

    return (
      <div className="flex justify-evenly">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <FormComponent item={item} setVisible={setVisible1} />
        </MyModal>
        <MyConfirmModal
          isVisible={isVisible2}
          setVisible={setVisible2}
          onClickCheck={onDelete}
          actionName="Delete"
          msg={msg}
        />
        {moreActions?.map((S, ind) => (
          <div key={ind}>
            <MyModal
              isVisible={!!S.modal && isVisible[ind + 3]}
              setVisible={setVisibleForIndex(ind + 3)}
              title={S.label}
            >
              {!S.modal ? (
                <></>
              ) : (
                <S.modal setVisible={setVisibleForIndex(ind + 3)} item={item} />
              )}
            </MyModal>
            <MyIcon
              icon={S.icon}
              fontSize="small"
              onClick={() => {
                S.onClick?.();
                setVisible(ind + 3, true);
              }}
            />
          </div>
        ))}
        <MyIcon
          icon="Edit"
          onClick={() => setVisible1(true)}
          fontSize="small"
        />
        <MyIcon
          icon="Close"
          onClick={() => setVisible2(true)}
          fontSize="small"
        />
      </div>
    );
  }
);
