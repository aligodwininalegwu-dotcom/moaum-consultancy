import { z } from "zod";
import { CAMPUSES, CONTACT_CATEGORIES } from "@/lib/constants";

const phone = z
  .string()
  .trim()
  .regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number, e.g. 08031234567");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(3, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email address"),
    phone,
    matricNo: z.string().trim().max(30).optional().or(z.literal("")),
    department: z.string().trim().max(80).optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const shopApplicationSchema = z.object({
  campus: z.enum(CAMPUSES),
  preferredShopId: z.string().optional().or(z.literal("")),
  businessName: z.string().trim().min(3, "Enter your business name").max(100),
  businessType: z.string().trim().min(3, "Describe the type of business").max(80),
  phone,
  yearsExperience: z.coerce.number().int().min(0).max(60),
  description: z
    .string()
    .trim()
    .min(60, "Give at least a short paragraph (60+ characters) about the business")
    .max(3000),
  agree: z.literal(true, { errorMap: () => ({ message: "You must accept the allocation guidelines" }) }),
});
export type ShopApplicationInput = z.infer<typeof shopApplicationSchema>;

export const registrationSchema = z.object({
  programmeId: z.string().min(1),
  phone,
  institution: z.string().trim().max(120).optional().or(z.literal("")),
  motivation: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type RegistrationInput = z.infer<typeof registrationSchema>;

export const paymentProofSchema = z.object({
  registrationId: z.string().min(1),
  paymentReference: z.string().trim().min(6, "Enter the bank transaction reference").max(60),
});

export const contactSchema = z.object({
  name: z.string().trim().min(3, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  category: z.enum(CONTACT_CATEGORIES),
  subject: z.string().trim().min(4, "Add a short subject").max(120),
  message: z.string().trim().min(20, "Tell us a little more (20+ characters)").max(3000),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const trackSchema = z.object({
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^MOAUM-(SA|PR)-\d{4}-[A-Z0-9]{5}$/, "References look like MOAUM-SA-2026-4F7K2"),
});
