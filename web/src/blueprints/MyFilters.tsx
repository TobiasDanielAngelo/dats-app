import { type PropsWithChildren, useState } from "react";
import type { StateSetter } from "../constants/interfaces";
import { MyIcon } from "./MyIcon";
import { MySearch } from "./MySearch";

export const MyFilters = (
  props: PropsWithChildren<{
    active?: number;
    query?: string;
    setQuery?: StateSetter<string>;
  }>
) => {
  const { children, active, query, setQuery } = props;
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState(false);

  return (
    <div className="flex flex-col md:flex-row-reverse gap-3">
      <div className={open ? "" : "absolute right-0 top-0"}>
        <div
          className="flex items-center justify-end cursor-pointer"
          onClick={() => setOpen((t) => !t)}
        >
          {!open ? (
            <div className="pr-5 pt-5">
              <MyIcon icon="FilterAlt" fontSize="large" />
              <div
                className="bg-red-400 rounded-full text-white -mt-3 text-sm ml-5"
                hidden={!active || active === 0}
              >
                {active ?? 0}
              </div>
            </div>
          ) : (
            <MyIcon icon="VisibilityOff" fontSize="large" />
          )}
        </div>
      </div>
      {open ? (
        <div className="flex flex-col-reverse md:flex-row-reverse flex-1 gap-3 text-left px-6 pt-4">
          {setQuery ? (
            <MySearch
              query={query}
              setQuery={setQuery}
              open={search}
              setOpen={setSearch}
            />
          ) : (
            <></>
          )}
          {!search && children}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
