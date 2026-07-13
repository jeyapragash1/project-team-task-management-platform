import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

export function SubmitButton({
  children,
  className,
  disabled,
  isLoading = false,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
