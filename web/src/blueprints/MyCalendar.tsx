import { observer } from "mobx-react-lite";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { getStoreSignature, sortByKey } from "../constants/helpers";
import { useVisible, useWindowWidth } from "../constants/hooks";
import type {
  CalendarEvent,
  CalendarView,
  StateSetter,
} from "../constants/interfaces";
import { MyIcon } from "./MyIcon";
import { MyModal } from "./MyModal";
import { MyTable } from "./MyTable";

const HourItem = (props: {
  hour: number;
  modalContent: React.ReactNode;
  noIcon?: boolean;
  disabled?: boolean;
  events?: CalendarEvent[];
  noCompletion?: boolean;
}) => {
  const { events, modalContent, hour, noCompletion } = props;
  const { isVisible1, setVisible1 } = useVisible();

  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1} title="Events">
        {modalContent}
      </MyModal>
      <div className="flex flex-col p-1" onClick={() => setVisible1(true)}>
        <div className="text-xs text-center font-semibold">{`${
          hour % 12 === 0 ? 12 : hour % 12
        }${hour >= 12 ? "P" : "A"}M`}</div>
        <div className="text-center text-xs cursor-pointer font-bold">
          {!noCompletion
            ? `[${String(events?.length)}]`
            : events?.length
            ? String(events?.filter((s) => s.dateCompleted).length) +
              "/" +
              String(events?.length)
            : "-"}
        </div>
      </div>
    </>
  );
};

const EventItem = (props: {
  label: string;
  modalContent: React.ReactNode;
  noIcon?: boolean;
  title: string;
  disabled?: boolean;
}) => {
  const { label, modalContent, noIcon, title, disabled } = props;
  const { isVisible1, setVisible1 } = useVisible();
  const width = useWindowWidth();

  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1} title="Events">
        {modalContent}
      </MyModal>
      <span onClick={() => setVisible1(true)}>{title}</span>
      {!noIcon && (
        <MyIcon
          icon="Event"
          fontSize="small"
          label={width > 1024 ? label : ""}
          onClick={() => setVisible1(true)}
          disabled={disabled}
        />
      )}
    </>
  );
};

export const MyCalendar = observer(
  (props: {
    date: Date;
    setDate: StateSetter<Date>;
    view: CalendarView;
    setView: StateSetter<CalendarView>;
    events: CalendarEvent[];
    noIcon?: boolean;
    noCompletion?: boolean;
  }) => {
    const { date, setDate, view, setView, events, noIcon, noCompletion } =
      props;
    const [currentDate, setCurrentDate] = useState(moment());

    const startDecade = Math.floor(currentDate.year() / 10) * 10;

    useEffect(() => {
      setDate(currentDate.toDate());
    }, [currentDate]);

    const handlePrev = () => {
      const newDate =
        view === "week"
          ? moment(currentDate).subtract(1, "week")
          : view === "month"
          ? moment(currentDate).subtract(1, "month")
          : view === "year"
          ? moment(currentDate).subtract(1, "year")
          : view === "decade"
          ? moment(currentDate).subtract(10, "year").startOf("year")
          : moment(currentDate);
      setCurrentDate(newDate);
    };

    const handleNext = () => {
      const newDate =
        view === "week"
          ? moment(currentDate).add(1, "week").startOf("week")
          : view === "month"
          ? moment(currentDate).add(1, "month").startOf("month")
          : view === "year"
          ? moment(currentDate).add(1, "year").startOf("year")
          : view === "decade"
          ? moment(currentDate)
              .add(10, "year")
              .startOf("year")
              .year(Math.floor(moment(currentDate).year() / 10) * 10 + 10)
          : moment(currentDate);

      setCurrentDate(newDate);
    };

    const renderWeekView = useCallback(() => {
      const start = moment(currentDate).startOf("week"); // Starting point of the week
      const days = Array.from({ length: 7 }, (_, i) =>
        moment(start).add(i, "day")
      );

      // Hourly range for the day (0-23, representing 24 hours)
      const hours = Array.from({ length: 24 }, (_, i) => i);

      return (
        <div className="grid grid-cols-7 gap-4 h-[90%] overflow-scroll">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center font-bold">
              {d}
            </div>
          ))}

          {/* Render each day with hour-by-hour schedule */}
          {days.map((day, i) => {
            const isToday = day.isSame(moment(), "day");
            const isSelected = day.isSame(date, "day");

            // Filter events for the specific day
            const dayEvents = sortByKey(events, "dateStart").filter(
              (e) =>
                day.format("YYYY-MM-DD") ===
                  moment(e.dateStart).format("YYYY-MM-DD") ||
                day.format("YYYY-MM-DD") ===
                  moment(e.dateEnd).format("YYYY-MM-DD")
            );

            // Group events by hour
            const eventsByHour = hours.map((hour) => {
              return dayEvents.filter(
                (e) =>
                  moment(e.dateStart).hour() === hour ||
                  moment(e.dateEnd).hour() === hour
              );
            });

            return (
              <div key={i} className="flex flex-col">
                <div
                  onClick={() => setDate(day.toDate())}
                  className={`text-center p-2 rounded cursor-pointer ${
                    isToday ? "text-blue-500 dark:text-white" : ""
                  } ${isSelected ? "bg-teal-300 text-black" : ""}`}
                >
                  <div>{day.format("D")}</div>
                </div>
                {/* Hour blocks */}
                <div className="grid grid-rows-24 gap-1 text-sm">
                  {hours.map((hour, index) => {
                    // Get events for the specific hour
                    const hourlyEvents = eventsByHour[index];
                    return (
                      <HourItem
                        key={index}
                        events={hourlyEvents}
                        hour={hour}
                        modalContent={
                          <MyTable
                            matrix={[
                              [
                                "Event",
                                "Time",
                                !noCompletion ? "Completed?" : undefined,
                              ],
                              ...hourlyEvents.map((s) => [
                                s.title,
                                moment(s.dateStart).format("h:mm A"),
                                !noCompletion ? (
                                  <MyIcon
                                    icon={
                                      s.dateCompleted
                                        ? "CheckBox"
                                        : "CheckBoxOutlineBlank"
                                    }
                                  />
                                ) : undefined,
                              ]),
                            ]}
                          />
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }, [getStoreSignature(events), currentDate, date, events.length]);

    const renderMonthView = useCallback(() => {
      const start = moment(currentDate).startOf("month").startOf("week");
      const days = Array.from({ length: 42 }, (_, i) =>
        moment(start).add(i, "day")
      );
      return (
        <div className="grid grid-cols-7 gap-4 h-[90%]">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
            <div
              key={d}
              className={`text-center font-bold ${
                i === 0 || i === 6 ? "text-red-500" : ""
              }`}
            >
              {d}
            </div>
          ))}
          {days.map((day, i) => {
            const isToday = day.isSame(moment(), "day");
            const isSelected = day.isSame(date, "day");
            const isWeekend = day.day() === 0 || day.day() === 6;

            const dayEvents = sortByKey(events, "dateStart").filter(
              (e) =>
                day.format("YYYY-MM-DD") ===
                moment(e.dateStart).format("YYYY-MM-DD")
            );

            return (
              <div
                key={i}
                onClick={() => setDate(day.toDate())}
                className={`md:flex-row-reverse text-right text-sm md:text-md items-right justify-between flex flex-col-reverse p-1 md:p-2 rounded cursor-pointer
                ${day.month() === currentDate.month() ? "" : "text-gray-500"}
                ${isWeekend ? "text-red-500" : ""}
                ${isToday ? "text-blue-500 font-bold" : ""}
                ${isSelected ? "bg-teal-300 text-black" : ""}`}
              >
                <EventItem
                  noIcon={noIcon || !dayEvents.length}
                  title={day.date().toString()}
                  label={
                    !noCompletion
                      ? String(
                          dayEvents.filter((s) => s.dateCompleted).length
                        ) +
                        "/" +
                        String(dayEvents.length)
                      : `[${String(dayEvents.length)}]`
                  }
                  modalContent={
                    <MyTable
                      matrix={[
                        [
                          "Event",
                          "Time",
                          !noCompletion ? "Completed?" : undefined,
                        ],
                        ...sortByKey(dayEvents, "dateStart").map((s) => [
                          s.title,
                          moment(s.dateStart).format("h:mm A"),
                          !noCompletion ? (
                            <MyIcon
                              icon={
                                s.dateCompleted
                                  ? "CheckBox"
                                  : "CheckBoxOutlineBlank"
                              }
                            />
                          ) : undefined,
                        ]),
                      ]}
                    />
                  }
                />
              </div>
            );
          })}
        </div>
      );
    }, [getStoreSignature(events), currentDate, date, events.length]);

    const renderYearView = () => (
      <div className="grid grid-cols-3 gap-2 h-full">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            onClick={() => {
              setCurrentDate(moment(currentDate).month(i));
              setView("month");
            }}
            className="p-4 text-center rounded shadow cursor-pointer dark:hover:bg-gray-500 hover:bg-teal-200"
          >
            {moment().month(i).format("MMM")}
          </div>
        ))}
      </div>
    );

    const renderDecadeView = () => (
      <div className="grid grid-cols-3 gap-5 h-[90%]">
        {Array.from({ length: 12 }, (_, i) => startDecade - 1 + i).map(
          (year) => (
            <div
              key={year}
              onClick={() => {
                setCurrentDate(moment(currentDate).year(year));
                setView("year");
              }}
              className={`p-4 text-center rounded cursor-pointer shadow ${
                year === currentDate.year() ? "bg-blue-400" : ""
              }`}
            >
              {year}
            </div>
          )
        )}
      </div>
    );

    return (
      <div className="p-4 rounded-xl h-full">
        <div className="flex justify-between items-center mb-4">
          <div onClick={handlePrev}>
            <MyIcon icon="KeyboardArrowLeft" fontSize="large" />
          </div>
          <div
            onClick={() =>
              setView(
                view === "week"
                  ? "month"
                  : view === "month"
                  ? "year"
                  : view === "year"
                  ? "decade"
                  : "week"
              )
            }
            className="font-bold cursor-pointer"
          >
            {view === "week" &&
              `${currentDate.format(
                "YYYY"
              )} Week ${currentDate.week()} (${currentDate
                .startOf("week")
                .format("MMM D")} - ${currentDate
                .endOf("week")
                .format("MMM D")})`}
            {view === "month" && currentDate.format("MMMM YYYY")}
            {view === "year" && currentDate.format("YYYY")}
            {view === "decade" && `${startDecade} - ${startDecade + 9}`}
          </div>
          <div onClick={handleNext}>
            <MyIcon icon="KeyboardArrowRight" fontSize="large" />
          </div>
        </div>
        {view === "week" && renderWeekView()}
        {view === "month" && renderMonthView()}
        {view === "year" && renderYearView()}
        {view === "decade" && renderDecadeView()}
      </div>
    );
  }
);
