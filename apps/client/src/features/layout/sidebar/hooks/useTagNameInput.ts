import { useState } from "react";
import { MAX_TAG_NAME_LENGTH } from "../constants/tag";

export const useTagNameInput = (options?: { initialValue?: string }) => {
  const [name, setName] = useState(options?.initialValue || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return {
    name,
    handleChange,
    maxLength: MAX_TAG_NAME_LENGTH,
    setName,
  };
};
