import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";
import { Index, useVisible } from "../../constants/hooks";
import { MyConfirmModal } from "../MyConfirmModal";
import { MyIcon } from "../MyIcon";
import { MyModal } from "../MyModal";
import { ActionModalDef } from "../../constants/interfaces";
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
  <T extends object & { id: number | string }>({
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
      setVisibleForIndex,
    } = useVisible();
    const [msg, setMsg] = useState("");

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
      <View>
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
          onPressCheck={onDelete}
          actionName="Delete"
          msg={msg}
        />
        <View style={{ flexDirection: "row", gap: 5, paddingHorizontal: 25 }}>
          {moreActions?.map((S, ind) => (
            <div key={ind}>
              <MyModal
                isVisible={!!S.modal && isVisible[ind + 3]}
                setVisible={setVisibleForIndex((ind + 3) as Index)}
                title={S.label}
              >
                {!S.modal ? (
                  <></>
                ) : (
                  <S.modal
                    setVisible={setVisibleForIndex((ind + 3) as Index)}
                    item={item}
                  />
                )}
              </MyModal>
              <MyIcon
                icon={S.icon}
                size={20}
                onPress={() => {
                  S.onPress?.();
                  setVisible(ind + 3, true);
                }}
                hidden={S.hidden}
              />
            </div>
          ))}
          <MyIcon icon="edit" onPress={() => setVisible1(true)} size={20} />
          <MyIcon icon="times" onPress={() => setVisible2(true)} size={20} />
        </View>
      </View>
    );
  }
);
