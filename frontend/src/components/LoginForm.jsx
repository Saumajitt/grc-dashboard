"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm({ className }) {
    const { register, handleSubmit } = useForm();
    const { login } = useAuth();
    const router = useRouter();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setError(null);
        setLoading(true);
        try {
            const role = await login(data.email, data.password);
            if (role === "admin") router.push("/admin/dashboard");
            else router.push("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={`flex flex-col gap-6 ${className || ""}`}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm">
                    Enter your credentials to continue
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-2 rounded">{error}</div>
            )}

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email", { required: true })}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password", { required: true })}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in…" : "Login"}
                </Button>
            </div>

            <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                    Sign up
                </a>
            </div>
        </form>
    );
}
