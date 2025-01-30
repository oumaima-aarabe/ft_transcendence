"use client"

import { Card } from './ui/card';
import { 
	FormControl,
	FormField, 
	FormItem, 
	FormLabel, 
	FormMessage, 
	Form} from './ui/form';
import { Input } from './ui/input';
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';


const LoginForm = () => {

	const formSchema = z.object({
		email: z.string().email("Invalid email address"),
		password: z
        .string()
        .regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
			"Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."
        ),
	});
	
	const loginForm = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});
	
	function submitLogin(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values)
	};

	return (
	<div>
		<Card>
			<Form {...loginForm}>
				<form >
					<FormField
						control={loginForm.control}
						name="email"
						render={({ field }) => (
							<FormItem>
							<FormLabel>email</FormLabel>
							<FormControl>
								<Input placeholder="Enter your email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
					/>
					<FormField 
						control={loginForm.control}
						name="password"
						render={({ field }) => (
							<FormItem>
							<FormLabel>email</FormLabel>
							<FormControl>
								<Input placeholder="Enter your email" {...field} />
							</FormControl>
							<FormMessage />
							</FormItem>
					)}
					/>
					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</Card>
	</div>
	)
}

export default LoginForm
