import React from "react";
import { RxPaperPlane } from "react-icons/rx";

interface InputProps {
  label?: string;
  value: string;
  placeholder?: string;
  extra?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const Input: React.FC<InputProps> = ({
  extra,
  label,
  value,
  placeholder,
  onChange,
  onSubmit,
}) => {
  return (
    <div>
      {!!label && (
        <label
          className="text-sm font-bold text-slate-700"
          htmlFor={label?.toLowerCase()}
        >
          {label}
        </label>
      )}
      <div
        id={label?.toLowerCase()}
        className="flex items-center rounded-md border border-stone-300/50 px-2"
      >
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 w-full bg-transparent px-2 text-slate-900 outline-none"
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        <button
          className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-slate-50"
          onClick={onSubmit}
        >
          <RxPaperPlane />
        </button>
      </div>
      {!!extra && <div className="m-2 text-xs">{extra}</div>}
    </div>
  );
};

export default Input;
