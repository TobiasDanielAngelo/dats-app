import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useState } from "react";
import { MyCalendar } from "../../blueprints/MyCalendar";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyIcon } from "../../blueprints/MyIcon";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { generateCollidingDates } from "../../constants/helpers";
import {
  CalendarEvent,
  CalendarView,
  ScheduleInterface,
} from "../../constants/interfaces";
import { useStore } from "../core/Store";

const TaskCard = ({ item }: { item: CalendarEvent }) => {
  return (
    <div className="m-2 border border-teal-300 rounded-md items-center justify-center flex flex-1 flex-col">
      <div className="font-bold text-xl">{item.title}</div>
      <div>{moment(item.dateStart).format("h:mm A")}</div>
    </div>
  );
};

export const TaskView = observer(() => {
  const { productivityStore } = useStore();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
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
    productivityStore.taskStore.fetchAll("page=1");
  }, []);

  const itemsOfTheDay = items.filter(
    (s) =>
      moment(s.dateStart).format("YYYYMMDD") === moment(date).format("YYYYMMDD")
  );

  const actions = [{ name: "", icon: <MyIcon icon="Add" label="Add" /> }];

  return (
    <>
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
