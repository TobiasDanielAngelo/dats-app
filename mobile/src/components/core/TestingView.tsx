import { useState } from "react";
import CameraUpload from "../../blueprints/CameraUpload";

export const TestingView = () => {
  const [value, setValue] = useState<string | number>(0);
  return (
    <>
      <CameraUpload />
    </>
  );
};
