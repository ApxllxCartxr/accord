"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createOrganization } from "./actions"
import { useTransition, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens only"),
})

export function CreateOrgForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        setError(null)
        startTransition(async () => {
            const formData = new FormData()
            formData.append("name", values.name)
            formData.append("slug", values.slug)

            const result = await createOrganization(null, formData)
            if (result && 'message' in result && typeof result.message === 'string') {
                setError(result.message)
            }
            // redirect happens in action
        })
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Corp" {...field} onChange={(e) => {
                                            field.onChange(e);
                                            // Auto-generate slug
                                            const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                                            form.setValue("slug", slug);
                                        }} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL Slug</FormLabel>
                                    <FormControl>
                                        <Input placeholder="acme-corp" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Organization"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
