"use client"

import { useForm } from "react-hook-form"
import { Card } from "./ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"


export const RegisterForm = () => {
    const formSchema = z.object({
        username: z.string().min(4).max(10),
        email: z.string().email("Invalid email address"),
        password: z.string().regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."),
        confirmPassword: z.string(),
    }).refine(data => data.password === data.confirmPassword, { message: "Passwords must match",});

    const registerForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email:"",
            password: "",
            confirmPassword: "",
        },
    })
    function submitRegister(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.

        console.log(values)}
    return(
        <Card >
            <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(submitRegister)}>
                    <FormField
                        control={registerForm}
                    name="..."
                    render={() => (
                        <FormItem>
                        <FormLabel />
                        <FormControl>
                          { /* Your form field */}
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                </form>
            </Form>
        </Card>
    )
}