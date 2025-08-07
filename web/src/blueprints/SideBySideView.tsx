import { observer } from "mobx-react-lite";
import { useWindowWidth } from "../constants/hooks";

interface SideBySideViewProps {
  SideA?: React.ReactNode;
  SideB?: React.ReactNode;
  ratio?: number;
  reversed?: boolean;
}

export const SideBySideView = observer(
  ({ SideA, SideB, ratio = 1, reversed = false }: SideBySideViewProps) => {
    const total = ratio + 1;
    const widthA = `${(ratio / total) * 100}%`;
    const widthB = `${(1 / total) * 100}%`;

    const width = useWindowWidth();
    return (
      <div className="lg:flex-grow py-5 flex justify-center max-h-[85vh]">
        <div
          className="w-3/4 gap-2 flex"
          style={{
            flexDirection:
              width >= 1024 ? (reversed ? "row-reverse" : "row") : "column",
          }}
        >
          {!SideA ? (
            <></>
          ) : (
            <div
              className="lg:overflow-scroll m-2 border border-teal-500 dark:border-gray-700 rounded-lg"
              style={{
                width: width >= 1024 ? widthA : "100%",
                display: width >= 1024 || SideA ? "block" : "none",
              }}
            >
              {SideA}
            </div>
          )}
          {!SideB ? (
            <></>
          ) : (
            <div
              className="overflow-scroll m-2 min-h-[60vh] border border-teal-500 dark:border-gray-700 rounded-lg items-center justify-center"
              style={{
                width: width >= 1024 ? widthB : "100%",
              }}
            >
              {SideB}
            </div>
          )}
        </div>
      </div>
    );
  }
);
