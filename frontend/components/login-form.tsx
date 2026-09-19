"use client";

import Link from "next/link";
import { cn } from "@/hooks/lib/utils";
import { login } from "@/hooks/lib/api/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await login(email, password);

      router.replace("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={cn("flex w-full max-w-xl flex-col gap-6", className)}
      {...props}
    >
      <Card className="w-full rounded-2xl border-border/70 shadow-lg">
        <CardHeader className="space-y-3 px-6 pb-6 pt-8 text-center sm:px-10 sm:pt-10">
          <Link
            href="/"
            className="group flex items-center justify-center  rounded-xl   transition-colors"
          >
            <Image
              src="/gyandeeplogo.png"
              alt="Gyan Deep College logo"
              width={100}
              height={100}
              priority
              className="object-contain"
            />
          </Link>
          <hr />

          <div>
            <CardDescription className="mx-auto mt-2 max-w-sm text-sm leading-6 sm:text-base">
              Sign in to continue learning, track your progress, and explore
              your courses.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8 sm:px-10 sm:pb-10">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              {/* Social Login */}
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  className="mt-3 h-12 w-full rounded-xl text-sm font-medium"
                >
                  <Image
                    src="/google-logo.png"
                    alt="Gyan Deep College logo"
                    width={30}
                    height={30}
                    priority
                    className="object-contain"
                  />
                  Continue with Google
                </Button>
              </Field>

              {/* Separator */}
              <FieldSeparator className="my-1 *:data-[slot=field-separator-content]:bg-card">
                Or continue with email
              </FieldSeparator>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Email address
                </FieldLabel>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="h-12 rounded-xl px-4 text-base"
                />
              </Field>

              {/* Password */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </FieldLabel>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-12 rounded-xl px-4 text-base"
                />
              </Field>

              {/* Login */}
              <Field className="pt-1">
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl text-base font-semibold shadow-sm"
                >
                  Sign in
                </Button>

                <FieldDescription className="pt-2 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Create an account
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs leading-5 text-muted-foreground sm:text-sm">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
