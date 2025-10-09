import { z } from "zod";

export const createUserSchema = z.object({
    username: z.string({message:"Veuillez entrer un username valide"}).min(3,{message:"Le username doit contenir au moins 3 caractères"}).max(20,{message:"Le username ne doit pas dépasser 20 caractères"}),
    email: z.email().min(3, {message:"L'email est requis"}).max(255, {message:"L'email ne doit pas dépasser 255 caractères"}),
    password: z.string().min(4).max(128, {message:"Le mot de passe doit contenir entre 4 et 128 caractères"}),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

export const loginUserSchema = z.object({
    email: z.string({message:"L'email est requis"}).email({message:"Veuillez entrer une adresse email valide"}).max(255, {message:"L'email ne doit pas dépasser 255 caractères"}),
    password: z.string().min(4).max(128, {message:"Le mot de passe doit contenir entre 4 et 128 caractères"}),
});

export type LoginUserSchema = z.infer<typeof loginUserSchema>;