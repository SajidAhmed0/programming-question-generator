import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface QuizInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const QuizInput = forwardRef<HTMLInputElement, QuizInputProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500",
            "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

QuizInput.displayName = "QuizInput";

export default QuizInput;
