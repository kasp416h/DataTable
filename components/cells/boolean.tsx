import { CheckIcon, XIcon } from "lucide-react";

export const BooleanCell = ({ value }: { value: boolean }) => {
  return (
    <span>
      {value ? (
        <CheckIcon size={20} color="#94cf7c" />
      ) : (
        <XIcon size={20} color="#ff7762" />
      )}
    </span>
  );
};
