import { useState } from "react";
import { MAX_FOLDER_NAME_LENGTH } from "../constants/folder";

interface UseFolderNameInputProps {
  initialValue?: string;
}

/**
 * 폴더명 입력 및 글자수 제한을 관리하는 커스텀 훅
 */
export const useFolderNameInput = ({
  initialValue = "",
}: UseFolderNameInputProps = {}) => {
  const [name, setName] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_FOLDER_NAME_LENGTH) {
      setName(value);
    }
  };

  return {
    name,
    setName,
    handleChange,
    maxLength: MAX_FOLDER_NAME_LENGTH,
  };
};
