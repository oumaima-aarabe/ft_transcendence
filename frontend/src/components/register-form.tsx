"use client"

import { useForm } from "react-hook-form"
import { Card } from "./ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation";



export const RegisterForm = () => {
    const router = useRouter();
    
    const formSchema = z.object({
        username: z.string().min(4).max(10),
        email: z.string().email("Invalid email address"),
        password: z.string().regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."),
        confirmPassword: z.string(),
    }).refine(data => data.password === data.confirmPassword, { 
        message: "Passwords must match",
        path: ["confirmPassword"],
    });

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
    
        // Handle the form values
        console.log(values);

        // Redirect to the dashboard page
        router.push("/dashboard");
    }

    return(
        <Card className="">
            <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(submitRegister)}>
                    <FormField
                    control={registerForm.control}
                    name="username"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    ></FormField>
                    <FormField
                    control={registerForm.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    ></FormField>
                    <FormField
                    control={registerForm.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    ></FormField>
                    <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Confirm password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Confirm your Password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    ></FormField>
                    <Button type="submit">sign up</Button>
                </form>
            </Form>
        </Card>
    )
}