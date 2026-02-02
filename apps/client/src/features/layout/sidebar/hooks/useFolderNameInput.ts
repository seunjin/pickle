import { useState } from "react";
import { MAX_FOLDER_NAME_LENGTH } from "../constants/folder";

export const useFolderNameInput = (options?: { initialValue?: string }) => {
  const [name, setName] = useState(options?.initialValue || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return {
    name,
    handleChange,
    maxLength: MAX_FOLDER_NAME_LENGTH,
    setName,
  };
};
