import { useState } from "react";
import AvatarSelector from "../../blueprints/AvatarSelector";
import { Text } from "react-native";

export const TestingView = () => {
  const [value, setValue] = useState<string | number>(0);
  return (
    <>
      <AvatarSelector value={value} onChangeValue={setValue} />
    </>
  );
};
