import z from "zod";

const firstNameSchema = z
  .string()
  .min(2, {
    message: "invalid first name",
  })
  .max(50, {
    message: "first name is too long",
  })
  .regex(/^[A-Za-z]+$/, {
    message: "first name must contain only letters",
  });

const lastNameSchema = z
  .string()
  .min(2, {
    message: "invalid last name",
  })
  .max(50, {
    message: "last name is too long",
  })
  .regex(/^[A-Za-z]+$/, {
    message: "last name must contain only letters",
  });

const emailSchema = z
  .string()
  .min(1, {
    message: "email is required",
  })
  .max(250, {
    message: "email is too long",
  })
  .email({
    message: "invalid email format",
  });

const passwordSchema = z
  .string()
  .min(6, {
    message: "Password must be at least 6 characters",
  })
  .max(20, {
    message: "Password must be at most 20 characters",
  })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number",
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: "Password must contain at least one special character",
  });

export const SignUpSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const LoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});