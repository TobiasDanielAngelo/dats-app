import { Dialog } from "@mui/material";
import type { PropsWithChildren } from "react";
import { Index, useKeyPress, useVisible } from "../constants/hooks";
import type { ActionModalDef, StateSetter } from "../constants/interfaces";
import { MyIcon } from "./MyIcon";

export const MyModal = (
  props: PropsWithChildren<{
    isVisible: boolean;
    setVisible: StateSetter<boolean> | ((t: boolean) => void);
    fullWidth?: boolean;
    title?: string;
    subTitle?: string;
    disableClose?: boolean;
    moreActions?: ActionModalDef[];
  }>
) => {
  const {
    isVisible: isVisibleX,
    setVisible: setVisibleX,
    children,
    fullWidth,
    title,
    subTitle,
    disableClose,
    moreActions,
  } = props;

  const { setVisibleForIndex, isVisible } = useVisible();
  // const ref = useClickAway<HTMLDivElement>(() => setVisible(false));

  useKeyPress(["Escape"], () => setVisibleX(false));

  return (
    <Dialog
      onClose={
        disableClose
          ? (_, reason) =>
              reason !== "backdropClick"
                ? setVisibleX(false)
                : setVisibleX(true)
          : () => setVisibleX(false)
      }
      maxWidth={fullWidth ? false : undefined}
      open={isVisibleX}
      className="overscroll-contain overflow-hidden"
    >
      <div
        // ref={ref}
        className="dark:bg-gray-900 bg-teal-100 overflow-y-scroll scrollbar scrollbar-thin scrollbar-thumb-gray-300 scrollbar-rounded-[12px] scrollbar-mx-10 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-900"
      >
        <div className="flex justify-between items-center m-2">
          <div>
            <div className="font-bold leading-tight text-left tracking-tight text-gray-900 dark:text-white">
              {title}
            </div>
            <div className="text-sm text-left tracking-tight text-gray-500 italic">
              {subTitle}
            </div>
          </div>
          <MyIcon icon="Close" onClick={() => setVisibleX(false)} />
        </div>
        <div className="min-w-[500px] max-w-[80vw] min-h-[100px] p-3">
          {children}
        </div>
        {moreActions?.map((s, ind) => (
          <div key={ind}>
            <MyIcon icon={s.icon} onClick={s.onClick} fontSize="small" />
            <MyModal
              isVisible={!!s.modal && isVisible[ind + 1]}
              setVisible={setVisibleForIndex((ind + 1) as Index)}
              title={s.label}
            >
              {s.modal ? (
                <s.modal setVisible={setVisibleForIndex((ind + 1) as Index)} />
              ) : (
                <></>
              )}
            </MyModal>
          </div>
        ))}
      </div>
    </Dialog>
  );
};
