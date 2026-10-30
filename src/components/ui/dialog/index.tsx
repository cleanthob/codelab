import { ReactNode } from "react";
import {
  DialogContent,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "./primitives";

type DialogProps = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  title?: string;
  children?: ReactNode;
  content: ReactNode;
  width?: string;
  height?: string;
  preventOutsideClick?: boolean;
};

export const Dialog = ({
  open,
  setOpen,
  title,
  children,
  content,
  width = "600px",
  height = "90vh",
  preventOutsideClick,
}: DialogProps) => {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        if (preventOutsideClick && eventDetails.reason === "outside-press") {
          eventDetails.cancel();
          return;
        }

        setOpen?.(nextOpen);
      }}
    >
      {children && <DialogTrigger>{children}</DialogTrigger>}

      <DialogContent
        style={{ maxWidth: width, maxHeight: height }}
        className="overflow-y-auto"
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}

        {content}
      </DialogContent>
    </DialogRoot>
  );
};
