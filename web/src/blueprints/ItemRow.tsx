export const ItemRow = (props: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => {
  const { label, value } = props;
  return (
    <div className="flex items-center gap-5 text-sm text-gray-300">
      <span className="text-right font-bold w-[20%] text-gray-400">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
};
