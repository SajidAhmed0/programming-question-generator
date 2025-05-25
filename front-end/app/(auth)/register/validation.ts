import { z } from "zod";

export enum CreateUserFormFields {
  FullName = "fullName",
  Email = "email",
  Password = "password",
  ConfirmPassword = "confirmPassword",
}

export const createUserFormSchema = z
  .object({
    [CreateUserFormFields.FullName]: z.string(),
    [CreateUserFormFields.Email]: z.string().email(),
    [CreateUserFormFields.Password]: z.string().min(8),
    [CreateUserFormFields.ConfirmPassword]: z.string().min(8),
  })
  .refine(
    (data) =>
      data[CreateUserFormFields.Password] ===
      data[CreateUserFormFields.ConfirmPassword],
    {
      message: "Passwords do not match",
      path: [CreateUserFormFields.ConfirmPassword],
    }
  );

export type CreateUserFormSchema = z.infer<typeof createUserFormSchema>;
