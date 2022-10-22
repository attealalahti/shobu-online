import { createPortal } from "react-dom";
type ModalProps = {
  children: React.ReactNode;
  open: boolean;
};
const Modal = ({ children, open }: ModalProps) => {
  if (!open) return null;
  return createPortal(
    <>
      <div className="fixed top-0 bottom-0 left-0 right-0 bg-black opacity-60" />
      <div className="fixed top-2/4 left-2/4 h-screen w-screen -translate-y-1/2 -translate-x-1/2 p-5 py-10">
        {children}
      </div>
    </>,
    document.getElementById("portal") as HTMLElement
  );
};

export default Modal;
