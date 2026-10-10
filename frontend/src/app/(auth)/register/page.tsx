"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api, errorMessage } from "@/lib/api";
import { authStore, useSession } from "@/lib/auth";
import { registerSchema, type RegisterValues } from "@/lib/schemas";
import type { AuthResponse } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const session = useSession();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (session) router.replace("/boards");
  }, [session, router]);

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    try {
      await api("/auth/register", { method: "POST", body: { name, email, password }, auth: false });
      // Registration returns the user only, so sign in to get a token.
      const auth = await api<AuthResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false });
      authStore.set(auth);
      toast.success(`Welcome, ${auth.user.name}`);
      router.replace("/boards");
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <h2 className="text-2xl font-semibold tracking-tight text-white">Create your account</h2>
      <p className="mt-1.5 text-sm text-slate-400">Start a board and invite your team in a minute.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        <FormError message={errors.root?.message} />

        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your name"
            icon={<User />}
            invalid={!!errors.name}
            {...register("name")}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<Mail />}
            invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            icon={<Lock />}
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            icon={<Lock />}
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>

        <Button type="submit" size="lg" loading={isSubmitting} className="group w-full">
          Create account
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-violet-300 transition hover:text-violet-200">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
