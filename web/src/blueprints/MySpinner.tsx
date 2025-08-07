export const MySpinner = ({ size = 6 }) => {
  return (
    <div
      className={`border-2 m-1 border-t-teal-700 dark:border-t-teal-300 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}
      style={{
        height: `${size * 4}px`,
        width: `${size * 4}px`,
      }}
    ></div>
  );
};
