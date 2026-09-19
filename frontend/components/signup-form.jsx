"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/hooks/lib/utils";
import { register } from "@/hooks/lib/api/auth";
import { Button } from "@/components/ui/button";
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

export function SignupForm({ className, ...props }) {
  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const username = formData.get("name");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const role = formData.get("role");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm_password");
    const profilePicture = formData.get("profile_picture");

    // Check password
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Check profile picture type
    if (
      profilePicture &&
      profilePicture instanceof File &&
      profilePicture.size > 0
    ) {
      if (!profilePicture.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
      }
    }

    try {
      console.log("Registering user:", {
        username,
        phone,
        email,
        role,
        password,
        profilePicture,
      });

      await register(
        username,
        phone,
        email,
        role,
        password,
        profilePicture
      );

      alert("Registration successful! Please log in.");

      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        error?.message ||
          "Registration failed. Please check your information and try again."
      );
    }
  };

  return (
    <div
      className={cn("flex w-full max-w-xl flex-col gap-6", className)}
      {...props}
    >
      <Card className="w-full rounded-2xl border-border/70 shadow-lg">
        <CardHeader className="space-y-3 px-6 pb-6 pt-8 text-center sm:px-10 sm:pt-10">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center justify-center rounded-xl transition-opacity hover:opacity-80"
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
            <CardTitle className="text-2xl font-bold">
              Create your account
            </CardTitle>

            <CardDescription className="mx-auto mt-2 max-w-sm text-sm leading-6 sm:text-base">
              Create your account to start learning, track your progress, and
              explore your courses.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8 sm:px-10 sm:pb-10">
          <form onSubmit={handleRegister}>
            <FieldGroup className="gap-5">

              {/* Google Signup */}
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  className="mt-3 h-12 w-full rounded-xl text-sm font-medium"
                >
                  <Image
                    src="/google-logo.png"
                    alt="Google"
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

              {/* Full Name + Phone */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Full Name */}
                <Field>
                  <FieldLabel
                    htmlFor="name"
                    className="text-sm font-medium"
                  >
                    Full name
                  </FieldLabel>

                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                    className="h-12 rounded-xl px-4 text-base"
                  />
                </Field>

                {/* Phone */}
                <Field>
                  <FieldLabel
                    htmlFor="phone"
                    className="text-sm font-medium"
                  >
                    Phone number
                  </FieldLabel>

                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    autoComplete="tel"
                    inputMode="numeric"
                    required
                    className="h-12 rounded-xl px-4 text-base"
                  />
                </Field>
              </div>

              {/* Email + Role */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Email */}
                <Field>
                  <FieldLabel
                    htmlFor="email"
                    className="text-sm font-medium"
                  >
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

                {/* Role */}
                <Field>
                  <FieldLabel
                    htmlFor="role"
                    className="text-sm font-medium"
                  >
                    Account role
                  </FieldLabel>

                  <select
                    id="role"
                    name="role"
                    defaultValue=""
                    required
                    className={cn(
                      "h-12 w-full rounded-xl border border-input",
                      "bg-background px-4 text-base",
                      "text-foreground shadow-sm",
                      "outline-none transition-colors",
                      "focus-visible:border-ring",
                      "focus-visible:ring-3 focus-visible:ring-ring/50"
                    )}
                  >
                    <option value="" disabled>
                      Select your role
                    </option>

                    <option value="student">
                      Student
                    </option>

                    <option value="teacher">
                      Teacher
                    </option>
                  </select>
                </Field>
              </div>

              {/* Profile Picture */}
              <Field>
                <FieldLabel
                  htmlFor="profile_picture"
                  className="text-sm font-medium"
                >
                  Profile picture
                </FieldLabel>

                <Input
                  id="profile_picture"
                  name="profile_picture"
                  type="file"
                  accept="image/*"
                  className="h-12 rounded-xl px-4 py-2 text-base"
                />

                <FieldDescription className="text-xs">
                  Upload a profile picture. JPG, PNG, or other image formats
                  are supported.
                </FieldDescription>
              </Field>

              {/* Password + Confirm Password */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Password */}
                <Field>
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </FieldLabel>

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-12 rounded-xl px-4 text-base"
                  />
                </Field>

                {/* Confirm Password */}
                <Field>
                  <FieldLabel
                    htmlFor="confirm-password"
                    className="text-sm font-medium"
                  >
                    Confirm password
                  </FieldLabel>

                  <Input
                    id="confirm-password"
                    name="confirm_password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-12 rounded-xl px-4 text-base"
                  />
                </Field>
              </div>

              {/* Password Description */}
              <FieldDescription className="-mt-2 text-xs">
                Password must be at least 8 characters long.
              </FieldDescription>

              {/* Signup */}
              <Field className="pt-1">
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl text-base font-semibold shadow-sm"
                >
                  Create Account
                </Button>

                <FieldDescription className="pt-2 text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Terms */}
      <FieldDescription className="px-6 text-center text-xs leading-5 text-muted-foreground sm:text-sm">
        By creating an account, you agree to our{" "}
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
      </FieldDescription>
    </div>
  );
}