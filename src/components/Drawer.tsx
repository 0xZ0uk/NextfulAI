import clsx from "clsx";
import React from "react";
import { RxCross1 } from "react-icons/rx";

interface DrawerProps {
  open?: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ children, open, onClose }) => {
  return (
    <div
      className={clsx(
        "absolute right-0 h-full w-1/3 bg-slate-100 transition-all",
        open ? "w-1/3" : "w-0"
      )}
    >
      <RxCross1
        onClick={onClose}
        className="absolute right-4 top-4 cursor-pointer text-slate-900"
      />
      <div className="px-4 pt-16">{children}</div>
    </div>
  );
};

export default Drawer;
