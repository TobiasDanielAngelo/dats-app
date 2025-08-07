import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import { type StateSetter } from "../constants/interfaces";
import { MyInput } from "./MyInput";

export const MySearch = (props: {
  query?: string;
  setQuery: StateSetter<string>;
  open?: boolean;
  setOpen?: StateSetter<boolean>;
}) => {
  const { query, setQuery, open, setOpen } = props;

  return (
    <div className="items-center flex flex-row flex-1 text-left">
      <MyInput
        label={"Quick Search"}
        value={query}
        onChangeValue={setQuery}
        optional
        hidden={open ? !open : true}
      />
      {!open ? (
        <SearchIcon color="action" onClick={() => setOpen?.(true)} />
      ) : (
        <FilterAltIcon color="action" onClick={() => setOpen?.(false)} />
      )}
    </div>
  );
};
