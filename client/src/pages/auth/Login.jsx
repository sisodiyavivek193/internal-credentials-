
import React from "react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import api from "@/services/api_axios.js";
import { useRouter } from "@/routes/hooks";

const FormSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required"),
    // .email("Please enter a valid email address."),
    password: z
        .string()
        .min(1, "Password must be at least 6 characters"),
});

const LoginPage = () => {

    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            const res = await api.post("/auth/login", {
                email: data.email,
                password: data.password,
            });

            toast.success("Login Successful!");

            if (res.data?.twoFactorRequired && res.data?.userId) {
                toast('2FA Required', {
                    description: "Redirecting to OTP verification...",
                });
                router.push(`/otp/${res.data?.userId}`);
                return;
            }
        } catch (err) {
            // 👉 Backend "Invalid credentials" (401) ya koi bhi error yahan aayega
            const message =
                err.response?.data?.message ||
                (err.response?.status === 401
                    ? "Invalid email or password"
                    : "Something went wrong, please try again");

            toast.error(message);

            // Password field clear kar dein (email rehne dein, wrong baar-baar type na karna pade)
            form.setValue("password", "");
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="w-full max-w-lg rounded-lg border bg-white p-10 shadow-sm dark:bg-zinc-900">
                <div className="space-y-10 mb-5">
                    <img
                        src="/img/Logo.svg"
                        alt="Innovative Glance"
                        className="h-20 w-auto mx-auto object-contain"
                    />
                    <p className="text-center text-sm text-muted-foreground">
                        Enter your credentials to access your account
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
                        {/* EMAIL */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-base'>Email address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* PASSWORD */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-base'>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Password must be at least 6 characters
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full text-lg uppercase h-12"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;
