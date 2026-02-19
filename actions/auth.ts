"use server";

import { loginSchema } from "@/lib/validations";

export async function loginAction(formData: FormData) {
  try {
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues.map((e) => e.message).join(", "),
      };
    }

    // Return credentials to client for signIn call
    return {
      success: true,
      email: result.data.email,
      password: result.data.password,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Invalid email or password",
    };
  }
}
