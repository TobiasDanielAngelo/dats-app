import { GuidedDiv } from "./MyGuidedDiv";

export const MyTag = (props: {
  label?: string;
  color?: string;
  title?: string;
  hidden?: boolean;
}) => {
  const { label, color, title, hidden } = props;

  return (
    <div
      className="text-center m-1 px-2 py-1 text-xs cursor-pointer font-bold text-white rounded-full"
      style={{
        backgroundColor: color ?? "skyblue",
        display: hidden ? "none" : "",
      }}
    >
      <GuidedDiv
        className="text-white"
        title={`${label ?? ""}${title ? " - " + title : ""}`}
      >
        {label && label.length > 15 ? `${label?.substring(0, 15)}...` : label}
      </GuidedDiv>
    </div>
  );
};
