import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Save from "@mui/icons-material/Save";
import AddCard from "@mui/icons-material/AddCard";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import CloudUpload from "@mui/icons-material/CloudUpload";
import Event from "@mui/icons-material/Event";
import FilterAlt from "@mui/icons-material/FilterAlt";
import Inbox from "@mui/icons-material/MoveToInbox";
import InsertChart from "@mui/icons-material/InsertChart";
import Toll from "@mui/icons-material/Toll";
import Inventory from "@mui/icons-material/Inventory";
import Menu from "@mui/icons-material/Menu";
import Payment from "@mui/icons-material/Payment";
import Print from "@mui/icons-material/Print";
import RestartAlt from "@mui/icons-material/RestartAlt";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FilterListAlt from "@mui/icons-material/FilterListAlt";
import NoteAdd from "@mui/icons-material/NoteAdd";
import PieChart from "@mui/icons-material/PieChart";
import Search from "@mui/icons-material/Search";
import ViewList from "@mui/icons-material/ViewList";
import TableChart from "@mui/icons-material/TableChart";
import Timeline from "@mui/icons-material/Timeline";
import Padding from "@mui/icons-material/Padding";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import BarChart from "@mui/icons-material/BarChart";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Sort from "@mui/icons-material/Sort";
import Today from "@mui/icons-material/Today";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBox from "@mui/icons-material/CheckBox";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import PrecisionManufacturing from "@mui/icons-material/PrecisionManufacturing";
import DisabledVisible from "@mui/icons-material/DisabledVisible";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import Settings from "@mui/icons-material/Settings";
import Calculate from "@mui/icons-material/Calculate";
import Sunny from "@mui/icons-material/Sunny";
import FilePresent from "@mui/icons-material/FilePresent";
import Star from "@mui/icons-material/Star";
import DisplaySettings from "@mui/icons-material/DisplaySettings";
import DynamicForm from "@mui/icons-material/DynamicForm";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Warning from "@mui/icons-material/Warning";
import ElectricBolt from "@mui/icons-material/ElectricBolt";
import type { SvgIconProps } from "@mui/material/SvgIcon";

// 1. Map icons to names
const iconMap = {
  Edit,
  Delete,
  Save,
  Calculate,
  AddCard,
  Check,
  Close,
  ElectricBolt,
  CloudUpload,
  WarningAmber,
  Event,
  Add,
  Remove,
  FilterAlt,
  Inbox,
  InsertChart,
  Menu,
  Payment,
  PrecisionManufacturing,
  Print,
  Inventory,
  DisplaySettings,
  RestartAlt,
  FilePresent,
  VisibilityOff,
  FilterListAlt,
  ViewList,
  NoteAdd,
  Toll,
  PieChart,
  Timeline,
  TableChart,
  Padding,
  DarkMode,
  LightMode,
  Warning,
  Today,
  Sunny,
  DynamicForm,
  BarChart,
  ExpandMore,
  ExpandLess,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Settings,
  Star,
  Sort,
  CheckBox,
  DisabledVisible,
  RemoveRedEye,
  CheckBoxOutlineBlank,
  Search,
} as const;

// 2. Derive type from keys
export type IconName = keyof typeof iconMap;

// 3. Props with generic icon component + standard icon props
interface MyIconProps extends SvgIconProps {
  icon: IconName;
  label?: string;
  hidden?: boolean;
  disabled?: boolean;
}

export const MyIcon: React.FC<MyIconProps> = ({
  icon,
  label,
  hidden,
  disabled,
  ...props
}) => {
  const IconComponent = iconMap[icon];

  return hidden ? (
    <></>
  ) : (
    <div className="flex flex-col items-center">
      <IconComponent
        className={`cursor-pointer ${
          disabled
            ? "text-gray-400 dark:text-gray-700"
            : "text-teal-700 dark:text-gray-400"
        }`}
        onClick={disabled ? () => {} : props.onClick}
        {...props}
      />
      <div className="text-xs text-gray-500 font-bold">{label}</div>
    </div>
  );
};
