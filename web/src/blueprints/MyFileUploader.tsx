import { useState } from "react";
import { MyIcon } from "./MyIcon";

export const MyFileUploader = (props: {
  value?: File;
  onChangeValue?: (t: File) => void;
}) => {
  const { value, onChangeValue } = props;

  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

  const [image, setImage] = useState(
    value && imageExtensions.test(String(value)) ? String(value) : ""
  );

  const [nonImageFile, setNonImageFile] = useState(
    value && !imageExtensions.test(String(value)) ? String(value) : ""
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files?.[0];
      if (file) {
        if (file.type.startsWith("image/")) {
          setImage(URL.createObjectURL(e.target.files[0]));
          setNonImageFile("");
        } else {
          setImage("");
          setNonImageFile(URL.createObjectURL(e.target.files[0]));
        }
      }
      onChangeValue?.(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-center w-full px-10">
      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-teal-300 rounded-full cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-teal-500 dark:hover:bg-gray-600">
        {image !== "" ? (
          <img src={image} className="rounded-full object-cover h-32 w-32" />
        ) : nonImageFile === "" ? (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <MyIcon icon="CloudUpload" fontSize="large" color="action" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <MyIcon icon="FilePresent" fontSize="large" color="action" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <a
                className="font-semibold"
                href={nonImageFile}
                target="_blank"
                rel="noopener noreferrer"
              >
                Uploaded File
              </a>
            </p>
          </div>
        )}
        <input type="file" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
};
