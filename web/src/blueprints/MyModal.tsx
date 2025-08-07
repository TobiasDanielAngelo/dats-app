import { Dialog } from "@mui/material";
import { useClickAway } from "@uidotdev/usehooks";
import type { PropsWithChildren } from "react";
import { useKeyPress } from "../constants/hooks";
import type { StateSetter } from "../constants/interfaces";
import { MyIcon } from "./MyIcon";

export const MyModal = (
  props: PropsWithChildren<{
    isVisible: boolean;
    setVisible: StateSetter<boolean>;
    fullWidth?: boolean;
    title?: string;
    subTitle?: string;
    disableClose?: boolean;
  }>
) => {
  const {
    isVisible,
    setVisible,
    children,
    fullWidth,
    title,
    subTitle,
    disableClose,
  } = props;

  const ref = useClickAway<HTMLDivElement>(() => setVisible(false));

  useKeyPress(["Escape"], () => setVisible(false));

  return (
    <Dialog
      onClose={
        disableClose
          ? (_, reason) =>
              reason !== "backdropClick" ? setVisible(false) : setVisible(true)
          : () => setVisible(false)
      }
      maxWidth={fullWidth ? false : undefined}
      open={isVisible}
      className="overscroll-contain overflow-hidden"
    >
      <div
        ref={ref}
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
          <MyIcon icon="Close" onClick={() => setVisible(false)} />
        </div>
        <div className="min-w-[300px] max-w-[80vw] min-h-[100px] p-3">
          {children}
        </div>
      </div>
    </Dialog>
  );
};
