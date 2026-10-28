import { ReactNode } from "react";
import {
  Tooltip as TooltipRoot,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./primitives";

type TooltipProps = {
  children: ReactNode;
  content: string;
};

export const Tooltip = ({ children, content, ...props }: TooltipProps) => {
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger render={children} {...props}></TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
};
