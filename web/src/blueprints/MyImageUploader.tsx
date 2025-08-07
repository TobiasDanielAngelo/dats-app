import { useState } from "react";
import { MyIcon } from "./MyIcon";

export const MyImageUploader = (props: {
  value?: File;
  onChangeValue?: (t: File) => void;
}) => {
  const { value, onChangeValue } = props;

  const [image, setImage] = useState(value ? `${value}` : "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChangeValue?.(e.target.files[0]);
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="flex items-center justify-center w-full px-10">
      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-teal-300 rounded-full cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-teal-500 dark:hover:bg-gray-600">
        {image !== "" ? (
          <img src={image} className="rounded-full object-cover h-32 w-32" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <MyIcon icon="CloudUpload" fontSize="large" color="action" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span>
            </p>
          </div>
        )}
        <input type="file" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
};
