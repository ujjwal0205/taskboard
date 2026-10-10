import { z } from "zod";

// The limits here match the validation annotations on the backend request records.

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(100, "Keep it under 100 characters"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters").max(72, "Use at most 72 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const nameSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(100, "Keep it under 100 characters"),
});
export type NameValues = z.infer<typeof nameSchema>;

// One-field forms (the inline "add a card" and "add a list" composers).
const textValueSchema = (max: number, emptyMessage: string) =>
  z.object({
    value: z.string().trim().min(1, emptyMessage).max(max, `Keep it under ${max} characters`),
  });
export const cardTitleSchema = textValueSchema(200, "Enter a title");
export const listNameSchema = textValueSchema(100, "Enter a name");
export type TextValue = z.infer<typeof cardTitleSchema>;

export const cardEditSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(200, "Keep it under 200 characters"),
  description: z.string().max(5000, "Keep it under 5000 characters"),
  assigneeId: z.string(),
  dueDate: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Enter a valid date"),
  priority: z.enum(["", "LOW", "MEDIUM", "HIGH"]),
});
export type CardEditValues = z.infer<typeof cardEditSchema>;

export const memberSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(["EDITOR", "VIEWER"]),
});
export type MemberValues = z.infer<typeof memberSchema>;
