import { observer } from "mobx-react-lite";
import { sortAndFilterByIds } from "../../constants/helpers";
import type { PaginatedDetails } from "../../constants/interfaces";
import { MyIcon } from "../MyIcon";
import { useVisible, useWindowWidth } from "../../constants/hooks";
import { useEffect } from "react";

export const MyGenericCollection = observer(
  <T extends { id: number | string /* & object */ }>(props: {
    updates?: number;
    PageBar?: React.FC;
    pageDetails?: PaginatedDetails | undefined; // set page details to undefined if you don't want any filters
    items: T[];
    CardComponent: React.ComponentType<{
      item: T;
    }>;
    title: string;
    onClickUpdate?: () => void;
  }) => {
    const {
      PageBar,
      items,
      pageDetails,
      CardComponent,
      title,
      updates,
      onClickUpdate,
    } = props;
    const { isVisible1, setVisible1 } = useVisible();
    const width = useWindowWidth();

    useEffect(() => {
      setVisible1(true);
    }, [width > 1024]);

    return (
      <div
        className="flex flex-col  rounded-lg"
        style={
          {
            // minHeight: isVisible1 ? "85vh" : undefined,
            // maxHeight: isVisible1 ? "85vh" : undefined,
          }
        }
      >
        <div className="flex rounded-md items-center flex-row sticky font-bold top-0 z-10 text-lg border-b-2 dark:border-gray-600 border-teal-400 p-2 text-center bg-teal-100 dark:bg-[#242424]">
          <MyIcon
            icon={"RestartAlt"}
            onClick={onClickUpdate}
            label={String(updates ?? 0)}
          />
          <div className="flex-1">{title.toUpperCase()}</div>
          <MyIcon
            icon={isVisible1 ? "RemoveRedEye" : "DisabledVisible"}
            onClick={() => setVisible1((t) => !t)}
          />
        </div>

        {isVisible1 && (
          <div>
            {PageBar ? <PageBar /> : <></>}
            <div className="flex-1 overflow-scroll">
              {sortAndFilterByIds(
                items,
                pageDetails?.ids ?? items.map((s) => s.id),
                (s) => s.id
              ).map((s) => (
                <CardComponent item={s} key={s.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
