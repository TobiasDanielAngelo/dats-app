import { type PropsWithChildren, useEffect, useState } from "react";
import { usePDF } from "react-to-pdf";
import type { StateSetter } from "../constants/interfaces";
import { MyIcon } from "./MyIcon";
import { MyModal } from "./MyModal";

export const MyPrintModal = (
  props: PropsWithChildren<{
    pageName?: string;
    isVisible: boolean;
    setVisible: StateSetter<boolean>;
  }>
) => {
  const { pageName, children, isVisible, setVisible } = props;
  const [dims, setDims] = useState({
    width: 0,
    height: 0,
  });
  const { toPDF, targetRef } = usePDF({
    filename: pageName
      ? pageName.substring(pageName.length - 4, pageName.length) === ".pdf"
        ? pageName
        : `${pageName}.pdf`
      : "page.pdf",
    page: {
      format: [dims.width / 4, Math.min(200, dims.height / 4)],
      margin: 3,
    },
  });

  useEffect(() => {
    if (targetRef.current) {
      setDims(targetRef.current.getBoundingClientRect());
    }
  }, [targetRef]);

  return (
    <MyModal isVisible={isVisible} setVisible={setVisible}>
      <div ref={targetRef} className="pb-2 flex justify-center">
        {children}
      </div>
      <div className="flex justify-end">
        <MyIcon
          icon="Print"
          onClick={() => toPDF()}
          color="action"
          fontSize="large"
        />
      </div>
    </MyModal>
  );
};
