import { z } from "zod";

export const generateUserTokenPayload = z.object({
  id: z.string().describe("uuid of the user"),
});

export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>;

export const createUserWithEmailAndPasswordInput = z.object({
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
  fullName: z.string().describe("Full name of the user"),
});

export type CreateUserWithEmailAndPasswordInputType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;

export const signInUserWithEmailAndPasswordInput = z.object({
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});

export type SignInUserWithEmailAndPasswordInputType = z.infer<
  typeof signInUserWithEmailAndPasswordInput
>;
