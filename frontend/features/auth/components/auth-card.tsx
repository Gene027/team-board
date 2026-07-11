"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowRight, FiCheckCircle, FiLock, FiMail, FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { AuthView } from "@/enums/auth-view.enum";
import {
  loginSchema,
  signupSchema,
  type LoginFormValues,
  type SignupFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/services/api-client";
import { authService } from "@/services/auth.service";

const highlights = [
  "Plan projects with clean ownership",
  "See your active workspaces instantly",
  "Built for fast, focused team execution",
];

export function AuthCard() {
  const [view, setView] = useState<AuthView>(AuthView.Login);
  const [serverError, setServerError] = useState<string | null>(null);
  const { setSession } = useAuth();
  const isLogin = view === AuthView.Login;

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const authMutation = useMutation({
    mutationFn: (values: LoginFormValues | SignupFormValues) =>
      isLogin
        ? authService.login(values)
        : authService.signup(values as SignupFormValues),
    onSuccess: (session) => {
      setServerError(null);
      setSession(session);
    },
    onError: (error) => {
      setServerError(getApiErrorMessage(error, "Authentication failed."));
    },
  });

  const switchView = (nextView: AuthView) => {
    setView(nextView);
    setServerError(null);
    authMutation.reset();
  };

  return (
    <section className="grid min-h-screen bg-slate-100 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <div className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(34,197,94,0.14),transparent_28%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-white text-base font-black text-slate-950">
              TB
            </div>
            <span className="text-lg font-bold">TeamBoard</span>
          </div>
          <h1 className="mt-20 max-w-xl text-5xl font-black leading-[1.05] tracking-normal">
            Bring the clarity of Jira into a lighter team workspace.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
            Sign in, choose a project, and move straight into the work that
            matters. This first slice is built for speed, structure, and calm.
          </p>
        </div>
        <div className="relative space-y-4">
          {highlights.map((highlight) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              key={highlight}
            >
              <FiCheckCircle className="size-5 text-emerald-300" />
              {highlight}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-md animate-in">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-base font-black text-white">
                TB
              </div>
              <span className="text-lg font-bold text-slate-950">TeamBoard</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                {isLogin ? "Welcome back" : "Create account"}
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-normal text-slate-950">
                {isLogin ? "Sign in to your workspace" : "Start your workspace"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isLogin
                  ? "Access your projects and keep momentum across your team."
                  : "Create an account and your first project dashboard is ready."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
              <button
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-bold transition",
                  isLogin
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900",
                )}
                type="button"
                onClick={() => switchView(AuthView.Login)}
              >
                Login
              </button>
              <button
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-bold transition",
                  !isLogin
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900",
                )}
                type="button"
                onClick={() => switchView(AuthView.Signup)}
              >
                Sign up
              </button>
            </div>

            {serverError ? (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {serverError}
              </div>
            ) : null}

            <form
              className="space-y-4"
              onSubmit={
                isLogin
                  ? loginForm.handleSubmit((values) => authMutation.mutate(values))
                  : signupForm.handleSubmit((values) => authMutation.mutate(values))
              }
            >
              {!isLogin ? (
                <div className="relative">
                  <TextInput
                    autoComplete="name"
                    error={signupForm.formState.errors.name?.message}
                    label="Full name"
                    placeholder="Ada Lovelace"
                    {...signupForm.register("name")}
                  />
                  <FiUser className="pointer-events-none absolute right-3 top-10 size-5 text-slate-400" />
                </div>
              ) : null}

              <div className="relative">
                <TextInput
                  autoComplete="email"
                  error={
                    isLogin
                      ? loginForm.formState.errors.email?.message
                      : signupForm.formState.errors.email?.message
                  }
                  label="Email address"
                  placeholder="ada@teamboard.dev"
                  type="email"
                  {...(isLogin
                    ? loginForm.register("email")
                    : signupForm.register("email"))}
                />
                <FiMail className="pointer-events-none absolute right-3 top-10 size-5 text-slate-400" />
              </div>

              <div className="relative">
                <TextInput
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  error={
                    isLogin
                      ? loginForm.formState.errors.password?.message
                      : signupForm.formState.errors.password?.message
                  }
                  label="Password"
                  placeholder="Minimum 8 characters"
                  type="password"
                  {...(isLogin
                    ? loginForm.register("password")
                    : signupForm.register("password"))}
                />
                <FiLock className="pointer-events-none absolute right-3 top-10 size-5 text-slate-400" />
              </div>

              <Button
                className="mt-2 w-full"
                isLoading={authMutation.isPending}
                size="lg"
                type="submit"
              >
                {isLogin ? "Sign in" : "Create account"}
                <FiArrowRight className="size-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
