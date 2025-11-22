import { observer } from "mobx-react-lite";
import moment from "moment";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { IconName, MyIcon } from "../../blueprints/MyIcon";
import { generateCollidingDates, sortByKey } from "../../constants/helpers";
import {
  CalendarEvent,
  MySpeedDialProps,
  ScheduleInterface,
} from "../../constants/interfaces";
import { TaskCard } from "../productivity/MoreTaskComponents";
import { useStore } from "./Store";

interface DashboardCardProps extends PropsWithChildren {
  height?: number;
  className?: string;
  column: number;
  order: number;
  protectionLevel?: 0 | 1 | 2 | 3;
  pin?: string;
  title?: string;
  lockTime?: number;
  hideTime?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  height = 200,
  className = "",
  column,
  order,
  protectionLevel = 0,
  pin = "1234",
  title,
  lockTime = 60,
  hideTime = 10,
}) => {
  const [isVisible, setIsVisible] = useState(protectionLevel === 0);
  const [pinInput, setPinInput] = useState("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinError, setPinError] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleEyeClick = () => {
    if (protectionLevel === 1) {
      setIsVisible(!isVisible);
    } else if (protectionLevel === 2) {
      setIsVisible(!isVisible);
      if (!isVisible) {
        // Hide after 10 seconds
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, hideTime * 1000);
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    }
  };

  const handleLockClick = () => {
    setShowPinDialog(true);
    setPinError(false);
  };

  const handlePinSubmit = () => {
    if (pinInput === pin) {
      setIsVisible(true);
      setShowPinDialog(false);
      setPinInput("");
      setPinError(false);

      // Hide after 1 minute
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, lockTime * 1000);
    } else {
      setPinError(true);
    }
  };

  const handlePinCancel = () => {
    setShowPinDialog(false);
    setPinInput("");
    setPinError(false);
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-md flex-1 flex flex-col ${className}`}
      style={{
        minWidth: "250px",
        minHeight: `${height}px`,
      }}
      data-column={column}
      data-order={order}
    >
      {!isVisible && title && (
        <div className="px-2 pt-2 pb-2 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-800 truncate">
            {title}
          </h3>
        </div>
      )}

      {/* Content area */}
      <div className="relative flex-1 p-4">
        {/* Protection overlay */}
        {!isVisible && (
          <div className="absolute inset-0 bg-gray-200 rounded-b-lg flex items-center justify-center backdrop-blur-sm">
            <div className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              {protectionLevel === 1 || protectionLevel === 2 ? (
                <MyIcon icon="VisibilityOff" onClick={handleEyeClick} />
              ) : protectionLevel === 3 ? (
                <MyIcon icon="Lock" onClick={handleLockClick} />
              ) : null}
            </div>
          </div>
        )}

        {/* PIN Dialog */}
        {showPinDialog && (
          <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-b-lg flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-xs w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Enter PIN</h3>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                className={`w-full px-3 py-2 border rounded-md mb-2 ${
                  pinError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter PIN"
                autoFocus
              />
              {pinError && (
                <p className="text-red-500 text-sm mb-3">Incorrect PIN</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handlePinSubmit}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Unlock
                </button>
                <button
                  onClick={handlePinCancel}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle visibility button (top-right) */}
        {isVisible && (protectionLevel === 1 || protectionLevel === 2) && (
          <div className="absolute bottom-2 left-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10">
            <MyIcon
              icon="RemoveRedEye"
              onClick={handleEyeClick}
              fontSize="small"
            />
          </div>
        )}

        {/* Lock button for level 3 */}
        {isVisible && protectionLevel === 3 && (
          <div className="absolute bottom-2 left-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10">
            <MyIcon
              icon="Lock"
              fontSize="small"
              onClick={() => {
                setIsVisible(false);
                if (timerRef.current) clearTimeout(timerRef.current);
              }}
            />
          </div>
        )}

        {/* Content */}
        {isVisible && <div className="h-full overflow-auto">{children}</div>}
      </div>
    </div>
  );
};

interface DashboardViewProps extends PropsWithChildren {
  gap?: number;
}

const GenericDashboardView: React.FC<DashboardViewProps> = ({
  children,
  gap = 16,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const updateColumns = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const cardWidth = 300;
        const cols = Math.max(
          1,
          Math.floor((containerWidth + gap) / (cardWidth + gap))
        );
        setColumns(cols);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [gap]);

  const childArray = React.Children.toArray(children);

  // Group cards by column and sort by order
  type ColumnItem = { child: React.ReactNode; order: number };
  const columnItems: ColumnItem[][] = new Array(columns)
    .fill(null)
    .map(() => []);

  childArray.forEach((child) => {
    const element = child as React.ReactElement<DashboardCardProps>;
    const cardColumn = element.props?.column ?? 0;
    const cardOrder = element.props?.order ?? 0;

    // Adjust column if it exceeds available columns (wrap around)
    const targetColumn = cardColumn % columns;

    if (!columnItems[targetColumn]) {
      columnItems[targetColumn] = [];
    }

    columnItems[targetColumn].push({ child, order: cardOrder });
  });

  // Sort each column by order
  columnItems.forEach((items) => {
    items.sort((a, b) => a.order - b.order);
  });

  return (
    <div ref={containerRef} className="w-full p-4">
      <div
        className="flex justify-start items-start"
        style={{ gap: `${gap}px` }}
      >
        {columnItems.map((items, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col"
            style={{ gap: `${gap}px` }}
          >
            {items.map((item, idx) => (
              <React.Fragment key={idx}>{item.child}</React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardActions = ({
  actions,
}: {
  actions: Partial<MySpeedDialProps>[];
}) => {
  return (
    <div className="flex flex-row absolute bottom-3 right-3 p-2 rounded-full border-1 border-teal-600 bg-white">
      {actions.map((s, ind) => (
        <MyIcon
          icon={s.icon as IconName}
          fontSize="small"
          onClick={s.onClick}
          key={ind}
        />
      ))}
    </div>
  );
};

export const DashboardView = observer(() => {
  const { productivityStore } = useStore();

  const taskItems = productivityStore.taskStore.items
    .map((s) => s.$view)
    .flatMap((s) =>
      generateCollidingDates(s as ScheduleInterface, {
        startDate: moment(new Date()).startOf("week").toDate(),
        endDate: moment(new Date()).endOf("week").toDate(),
      }).map((date) => ({
        ...s,
        collidingDate: date,
      }))
    )
    .map((s, ind) => ({
      id: ind,
      title: s.title ?? "",
      dateStart: s.collidingDate.toISOString(),
      dateEnd: s.collidingDate.toISOString(),
      dateCompleted: s.collidingDate.toISOString(),
    })) satisfies CalendarEvent[];

  const tasksOfTheDay = sortByKey(
    taskItems.filter(
      (s) =>
        moment(s.dateStart).format("YYYYMMDD") ===
        moment(new Date()).format("YYYYMMDD")
    ),
    "dateStart"
  );

  useEffect(() => {
    productivityStore.taskStore.fetchAll("page=all");
  }, []);

  const taskActions = [
    { icon: "RestartAlt", onClick: () => {} },
    { icon: "Print", onClick: () => {} },
    { icon: "Add", onClick: () => {} },
  ];

  return (
    <div>
      <div className="mx-auto">
        <GenericDashboardView gap={5}>
          <DashboardCard
            column={0}
            order={1}
            height={300}
            title="Tasks for the Day"
          >
            <MyGenericCollection
              items={tasksOfTheDay}
              CardComponent={TaskCard}
              title={"Tasks for the Day"}
            />
            <DashboardActions actions={taskActions} />
          </DashboardCard>
          <DashboardCard
            column={0}
            order={2}
            height={300}
            title="Pending Sales"
          >
            <MyGenericCollection
              items={tasksOfTheDay}
              CardComponent={TaskCard}
              title={"Pending Sales"}
            />
          </DashboardCard>
          <DashboardCard
            column={1}
            order={1}
            height={300}
            protectionLevel={2}
            title={"Today's Expenses"}
          >
            <MyGenericCollection
              items={tasksOfTheDay}
              CardComponent={TaskCard}
              title={"Today's Expenses"}
            />
            <DashboardActions actions={taskActions} />
          </DashboardCard>
          <DashboardCard column={1} order={1} height={300}>
            <MyGenericCollection
              items={tasksOfTheDay}
              CardComponent={TaskCard}
              title={"Receivables"}
            />
          </DashboardCard>
          <DashboardCard column={2} order={1} height={300}>
            <MyGenericCollection
              items={tasksOfTheDay}
              CardComponent={TaskCard}
              title={"Labor Claims"}
            />
          </DashboardCard>
          <DashboardCard
            column={2}
            order={2}
            height={300}
            protectionLevel={3}
            title={"SO History"}
          >
            <MyGenericCollection
              items={tasksOfTheDay}
              CardComponent={TaskCard}
              title={"Completed Sales"}
            />
          </DashboardCard>
        </GenericDashboardView>
      </div>
    </div>
  );
});
