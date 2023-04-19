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
        open ? "w-1/3" : "-right-1/3"
      )}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-slate-900"
      >
        <RxCross1 />
      </button>
      <div className="relative top-12 px-4">{children}</div>
    </div>
  );
};

export default Drawer;
