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
import Image from 'next/image';



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
		<Card className="w-[690px] h-[606px] bg-[#751d03] bg-opacity-[18%] p-10 flex justify-center flex-col rounded-3xl border-none backdrop-blur-lg">
			<div className="flex justify-center space-x-1">
				<p>You already have an account?</p>
				<button className="text-[#40CFB7] hover:text-[#8D361A] focus:outline-none">
					Sign in!
				</button>
			</div>
			<div className="flex justify-center">
			<Form {...loginForm}>
				<form onSubmit={loginForm.handleSubmit(submitLogin)} 
				className="h-[472px] w-[562px] space-y-[50px]">
					<FormField
						control={loginForm.control}
						name="email"
						render={({ field }) => (
							<FormItem className="w-[562px] h-[54px] space-y-2 text-[#FFFFFF]">
							<FormLabel>Email</FormLabel>
							<FormControl className="text-[#4C4C4C] rounded-3xl bg-[#EEE5BE]">
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
							<FormItem className="w-[562px] h-[54px] space-y-2 text-[#FFFFFF]">
							<FormLabel>Password</FormLabel>
							<FormControl className="text-[#4C4C4C] rounded-3xl bg-[#EEE5BE]">
								<Input placeholder="Enter your email" {...field} />
							</FormControl>
							<FormMessage />
							</FormItem>
					)}
					/>
					<Button type="submit"
					className="w-[562px] h-[54px] mt-7 bg-[#40CFB7] hover:bg-[#EEE5BE] rounded-3xl shadow-lg shadow-[#8D361A]">
						<span className="text-[#c75b37]">sign up</span>
					</Button>
					<div className="flex justify-center">
						<p className="text-[15px] font-regular text-white leading-relaxed">
							Or sign with
						</p>
					</div>
					<div className="justify-center flex-col flex items-center">
						<button>
							<img src="/42.svg" alt="logo" width={69} height={50} className="w-16 h-auto"/>
						</button>
					</div>
				</form>
			</Form>
			</div>
		</Card>
	</div>
	)
}

export default LoginForm
