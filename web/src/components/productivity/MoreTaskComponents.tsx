import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { MyConfirmModal } from "../../blueprints";
import { MyCalendar } from "../../blueprints/MyCalendar";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { MyTable } from "../../blueprints/MyTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import {
  generateCollidingDates,
  generateScheduleDefinition,
  sortByKey,
} from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import {
  CalendarEvent,
  CalendarView,
  ScheduleInterface,
} from "../../constants/interfaces";
import { useStore } from "../core/Store";
import { TaskForm } from "./TaskComponents";
import { Task } from "./TaskStore";

export const TaskCard = ({ item }: { item: CalendarEvent }) => {
  return (
    <div className="m-2 border border-teal-300 rounded-md items-center justify-center flex flex-1 flex-col">
      <div className="font-bold text-xl">{item.title}</div>
      <div>{moment(item.dateStart).format("h:mm A")}</div>
    </div>
  );
};

const TaskAction = ({ item }: { item: Task }) => {
  const { isVisible1, setVisible1 } = useVisible();
  const { productivityStore } = useStore();
  return (
    <>
      <MyConfirmModal
        isVisible={isVisible1}
        setVisible={setVisible1}
        onClickCheck={() => productivityStore.taskStore.deleteItem(item.id)}
        statement="Delete this task?"
      />
      <MyIcon icon="Close" onClick={() => setVisible1(true)} />
    </>
  );
};

export const TaskView = observer(() => {
  const { productivityStore } = useStore();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
  const range =
    view === "week"
      ? moment(date).format("YYYY-MM-DD")
      : view === "month"
      ? moment(date).format("YYYY-MM")
      : view === "year"
      ? moment(date).format("YYYY")
      : `${Math.floor(moment(date).year() / 10)}X`;

  const items = !["week", "month"].includes(view)
    ? []
    : (productivityStore.taskStore.items
        .map((s) => s.$view)
        .flatMap((s) =>
          generateCollidingDates(s as ScheduleInterface, {
            startDate: moment(date).startOf("week").toDate(),
            endDate: moment(date).endOf("week").toDate(),
          }).map((date) => ({
            ...s,
            collidingDate: date,
          }))
        )
        .filter((s) => {
          const m = moment(s.collidingDate);
          if (view === "week")
            return m.isBetween(
              moment(range).startOf("week"),
              moment(range).endOf("week"),
              null,
              "[]"
            );
          if (view === "month") return m.format("YYYY-MM") === range;
          return false;
        })
        .map((s, ind) => ({
          id: ind,
          title: s.title ?? "",
          dateStart: s.collidingDate.toISOString(),
          dateEnd: s.collidingDate.toISOString(),
          dateCompleted: s.collidingDate.toISOString(),
        })) satisfies CalendarEvent[]);

  useEffect(() => {
    productivityStore.taskStore.fetchAll("page=all");
  }, []);

  const itemsOfTheDay = sortByKey(
    items.filter(
      (s) =>
        moment(s.dateStart).format("YYYYMMDD") ===
        moment(date).format("YYYYMMDD")
    ),
    "dateStart"
  );

  const actions = [
    {
      name: "",
      icon: <MyIcon icon="Add" label="Add" onClick={() => setVisible1(true)} />,
      onClick: () => setVisible1(true),
    },
    {
      name: "",
      icon: (
        <MyIcon
          icon="ViewList"
          label="List"
          onClick={() => setVisible2(true)}
        />
      ),
      onClick: () => setVisible2(true),
    },
  ];

  const matrix = useMemo(() => {
    return [
      ["Title", "Schedule", ""],
      ...productivityStore.taskStore.items.map((s) => [
        s.title,
        generateScheduleDefinition(s as ScheduleInterface) ?? "",
        <TaskAction item={s} />,
      ]),
    ];
  }, [productivityStore.taskStore.items.length]);

  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <TaskForm setVisible={setVisible1} />
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2}>
        <MyTable matrix={matrix} />
      </MyModal>
      <SideBySideView
        SideA={
          <MyGenericCollection
            items={itemsOfTheDay}
            CardComponent={TaskCard}
            title={moment(date).format("MMM D, YYYY")}
          />
        }
        SideB={
          <MyCalendar
            date={date}
            setDate={setDate}
            view={view}
            setView={setView}
            events={items}
          />
        }
        ratio={0.3}
      />
      <MySpeedDial actions={actions} />
    </>
  );
});
