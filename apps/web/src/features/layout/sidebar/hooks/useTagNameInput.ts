import { useState } from "react";
import { MAX_TAG_NAME_LENGTH } from "../constants/tag";

interface UseTagNameInputProps {
  initialValue?: string;
}

/**
 * 태그명 입력 및 글자수 제한을 관리하는 커스텀 훅
 */
export const useTagNameInput = ({
  initialValue = "",
}: UseTagNameInputProps = {}) => {
  const [name, setName] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TAG_NAME_LENGTH) {
      setName(value);
    }
  };

  return {
    name,
    setName,
    handleChange,
    maxLength: MAX_TAG_NAME_LENGTH,
  };
};
