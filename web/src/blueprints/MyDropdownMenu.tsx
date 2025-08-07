import { useClickAway } from "@uidotdev/usehooks";
import type { Page } from "../constants/interfaces";

export const MyDropdownMenu = (props: {
  open?: boolean;
  setOpen?: (t: boolean) => void;
  actions?: Page[];
  margin?: number;
}) => {
  const { open, actions, setOpen, margin } = props;
  const ref = useClickAway<HTMLDivElement>(() => setOpen?.(false));

  return (
    <div
      ref={ref}
      className={`${
        !open ? "hidden" : ""
      } absolute -mx-20 my-3 z-10 max-h-[50vh] overflow-scroll text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
      style={{
        marginRight: margin ? `-${margin}rem` : "-5rem",
        marginLeft: margin ? `-${margin}rem` : "-5rem",
      }}
    >
      <ul className="py-2">
        {actions?.map((s, ind) => (
          <li key={ind} onClick={s.onClick}>
            <a
              href={s.link}
              className="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
