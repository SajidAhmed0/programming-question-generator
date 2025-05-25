"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "../ui/button";

interface FormInputProps {
  form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  name: string;
  label?: string;
  placeholder?: string;
  type?: "email" | "number" | "password" | "search" | "tel" | "text" | "url";
}

export function FormInput({
  form,
  name,
  label,
  placeholder,
  type = "text",
}: Readonly<FormInputProps>) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(type !== "password");

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {/* <Input placeholder={placeholder} type={type} {...field} /> */}
            <div className="relative">
              <Input
                id={id}
                className="pe-9"
                type={isVisible && type === "password" ? "text" : type}
                placeholder={placeholder}
                {...field}
              />
              {type === "password" && (
                <Button
                  variant="ghost"
                  className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={toggleVisibility}
                  aria-label={isVisible ? "Hide password" : "Show password"}
                  aria-pressed={isVisible}
                  aria-controls="password"
                >
                  {isVisible ? (
                    <EyeOffIcon size={16} aria-hidden="true" />
                  ) : (
                    <EyeIcon size={16} aria-hidden="true" />
                  )}
                </Button>
              )}
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
