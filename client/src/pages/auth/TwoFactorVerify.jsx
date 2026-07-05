import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import api from "@/services/api_axios";
import { useParams } from "react-router-dom";
import { useRouter } from "@/routes/hooks";

const FormSchema = z.object({
    otp: z
        .string()
        .regex(/^\d{6}$/, {
            message: "OTP must be exactly 6 digits",
        }).transform(Number),
});

const TwoFactorVerify = () => {

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            otp: ""
        },
    });

    const router = useRouter();
    const { userId } = useParams();

    useEffect(() => {
        if (!userId) {
            router.replace("/login");
        }
    }, [userId, router]);

    async function onSubmit(data) {
        try {
            const res = await api.post("/auth/verify-2fa", {
                userId,
                otpCode: data.otp
            });

            if (res.data?.success) {
                const role = res.data.role.toLowerCase();
                localStorage.setItem("role", role);
                if (res.data.token) {
                    localStorage.setItem("auth_token", res.data.token);
                }

                router.replace(role === "admin" ? "/admin" : "/dashboard");
            } else {
                toast.error("Verification Failed", {
                    description: res.data?.message || "Invalid OTP code",
                });
            }

        } catch (err) {
            toast.error("Error", {
                description: "Something went wrong. Please try again.",
            });
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="w-full max-w-lg rounded-lg border bg-white p-10 shadow-sm dark:bg-zinc-900">

                <div className="space-y-5 mb-5">
                    <img
                        src="/img/Logo.svg"
                        alt="Innovative Glance"
                        className="h-20 w-auto mx-auto object-contain"
                    />
                    <h1 className="text-3xl mt-7 font-bold text-center">
                        Two-Factor Authentication
                    </h1>
                    <p className="text-center">
                        Enter the 6-digit code from your Google Authenticator app
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <InputOTP
                                            maxLength={6}
                                            value={field.value}
                                            onChange={(val) => {
                                                const filtered = val.replace(/\D/g, "");
                                                field.onChange(filtered);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key && !/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            <InputOTPGroup className="space-x-3 mx-auto">
                                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                                    <InputOTPSlot
                                                        key={i}
                                                        index={i}
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        className="rounded-full! text-xl border border-gray-400 size-14 text-center"
                                                    />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button className="inline-block uppercase w-full text-xl h-13" type="submit">
                            Confirm
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default TwoFactorVerify;
