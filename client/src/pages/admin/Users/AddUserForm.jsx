import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeftIcon } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/services/api_axios.js";

import { useRouter, useParams } from "@/routes/hooks";

const rolesList = ["admin", "uiux", "seo", "developer"];

const baseSchema = {
    email: z.string().email("Please enter a valid email"),
    role: z.string().min(1, "Select a role"),
};

const AddUserForm = () => {
    const router = useRouter();
    const { userId } = useParams();
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = !!userId;

    const FormSchema = z.object({
        ...baseSchema,
        // Password is required only when creating a new user.
        password: isEditMode
            ? z.string().optional().or(z.literal(""))
            : z.string().min(6, "Password must be at least 6 characters"),
    });

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: "",
            role: "",
        },
    });

    // --- EDIT MODE: Data Fetching ---
    useEffect(() => {
        if (isEditMode) {
            const fetchDetail = async () => {
                try {
                    setIsLoading(true);
                    const res = await api.get(`/admin/users/${userId}`);
                    const data = res.data;
                    form.reset({
                        email: data.email,
                        role: data.role,
                        password: "",
                    });
                } catch (error) {
                    toast.error("Failed to fetch user details");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetail();
        }
    }, [userId, isEditMode, form]);

    // --- SUBMIT: Add or Update ---
    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                const payload = { email: data.email, role: data.role };
                if (data.password) payload.password = data.password;
                await api.put(`/admin/users/${userId}`, payload);
                toast.success("User updated successfully!");
            } else {
                await api.post("/admin/users", {
                    email: data.email,
                    password: data.password,
                    role: data.role,
                });
                toast.success("User added successfully!");
            }
            router.push('/admin/users');
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /> Loading...</div>;
    }

    return (
        <div className="container max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">

            <div className="flex items-center gap-3 mb-6">
                <Button onClick={() => router.back()} variant='ghost' size='icon' className='bg-accent'>
                    <ArrowLeftIcon />
                </Button>
                <h2 className="text-2xl font-bold">
                    {isEditMode ? "Edit User" : "Add New User"}
                </h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input placeholder="user@example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Password {isEditMode && <span className="text-muted-foreground text-xs">(leave blank to keep unchanged)</span>}
                                </FormLabel>
                                <FormControl><Input type="text" placeholder="••••••••" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Role (Single Select) */}
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {rolesList.map((role) => (
                                            <SelectItem key={role} value={role} className="capitalize">
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full h-12 text-lg uppercase">
                        {isEditMode ? "Update User" : "Save User"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AddUserForm;
