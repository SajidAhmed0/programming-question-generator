import { z } from "zod";

export enum LoginFormFields {
  FullName = "fullName",
  Email = "email",
  Password = "password",
  ConfirmPassword = "confirmPassword",
}

export const loginFormSchema = z.object({
  [LoginFormFields.Email]: z.string().email(),
  [LoginFormFields.Password]: z.string().min(8),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
