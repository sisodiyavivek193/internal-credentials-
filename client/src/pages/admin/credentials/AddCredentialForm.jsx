import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ArrowLeftIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api_axios.js";

import { useRouter, useParams } from "@/routes/hooks"; // useParams add kiya


import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const FormSchema = z.object({
    projectName: z.string().min(2, "Project name is required"),
    projectUrl: z.string().url("Please enter a valid URL"),
    projectNotes: z.string().optional(),
    isActive: z.boolean().default(true),
    roles: z.array(z.string()).min(1, "Select at least one role"),
    credentials: z.array(
        z.object({
            username: z.string().min(1, "Username is required"),
            password: z.string().min(1, "Password is required"),
        })
    ).min(1, "Add at least one login detail"),
});

const AddCredentialForm = () => {
    const rolesList = ["admin", "uiux", "seo", "developer"];
    const router = useRouter();
    const { userId } = useParams(); // URL se ID nikalne ke liye (e.g. /edit/123)
    const [isLoading, setIsLoading] = useState(false);


    // Check if we are in Edit Mode
    const isEditMode = !!userId;

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            projectName: "",
            projectUrl: "",
            projectNotes: "",
            isActive: true,
            roles: [],
            credentials: [{ username: "", password: "" }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "credentials",
    });

    // --- EDIT MODE: Data Fetching ---
    useEffect(() => {
        if (isEditMode) {
            const fetchDetail = async () => {
                try {
                    setIsLoading(true);
                    const res = await api.get(`/admin/credentials/${userId}/edit`);
                    console.log("🚀 ~ fetchDetail ~ res:", res)
                    const data = res.data;
                    // Form fields ko backend data se update karna
                    form.reset({
                        projectName: data.projectName,
                        projectUrl: data.projectUrl,
                        projectNotes: data.projectNotes || "",
                        isActive: data.isActive,
                        roles: data.roles || [],
                        credentials: data.credentials || [{ username: "", password: "" }]
                    });
                } catch (error) {
                    toast.error("Failed to fetch details");
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
                // Update Logic
                await api.put(`/admin/credentials/${userId}`, data);
                toast.success("Credential updated successfully!");
            } else {
                // Create Logic
                await api.post("/admin/credentials", data);
                toast.success("Credential added successfully!");
            }
            router.push('/admin');
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
                    {isEditMode ? "Edit Project Credentials" : "Add New Project Credentials"}
                </h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Project Name */}
                    <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl><Input placeholder="E.g. My Portfolio" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Project URL */}
                    <FormField
                        control={form.control}
                        name="projectUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project URL</FormLabel>
                                <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Roles (Multi-Checkbox) */}
                    <div className="space-y-2">
                        <FormLabel>Roles</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                            {rolesList.map((role) => (
                                <FormField
                                    key={role}
                                    control={form.control}
                                    name="roles"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(role)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...field.value, role])
                                                            : field.onChange(field.value?.filter((v) => v !== role));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="capitalize font-normal">{role}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Credentials */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex justify-between items-center">
                            <FormLabel className="text-lg">Login Details</FormLabel>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ username: "", password: "" })}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add More
                            </Button>
                        </div>

                        {fields.map((item, index) => (
                            <div key={item.id} className="flex gap-4 items-end border p-3 rounded-md">
                                <FormField
                                    control={form.control}
                                    name={`credentials.${index}.username`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Username</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`credentials.${index}.password`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Password</FormLabel>
                                            <FormControl><Input type="text" {...field} /></FormControl> {/* Password text rakha hai edit ke time dekhne ke liye */}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <FormField
                        control={form.control}
                        name="projectNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Notes</FormLabel>
                                <FormControl>
                                    {/* ReactQuill field.value aur field.onChange ke saath */}
                                    <ReactQuill
                                        theme="snow"
                                        placeholder="Any extra info..."
                                        value={field.value}
                                        onChange={field.onChange}
                                        style={{ height: '200px', marginBottom: '50px' }} // Height set karna sahi rehta hai
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full h-12 text-lg uppercase">
                        {isEditMode ? "Update Credentials" : "Save Credentials"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AddCredentialForm;