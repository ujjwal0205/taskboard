"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
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
import { loginSchema, type LoginValues } from "@/lib/schemas";
import type { AuthResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (session) router.replace("/boards");
  }, [session, router]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const auth = await api<AuthResponse>("/auth/login", { method: "POST", body: values, auth: false });
      authStore.set(auth);
      toast.success(`Welcome back, ${auth.user.name}`);
      router.replace("/boards");
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h2>
      <p className="mt-1.5 text-sm text-slate-400">Sign in to pick up where your team left off.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        <FormError message={errors.root?.message} />

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
            autoComplete="current-password"
            placeholder="Your password"
            icon={<Lock />}
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <Button type="submit" size="lg" loading={isSubmitting} className="group w-full">
          Sign in
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        New here?{" "}
        <Link href="/register" className="font-medium text-violet-300 transition hover:text-violet-200">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
