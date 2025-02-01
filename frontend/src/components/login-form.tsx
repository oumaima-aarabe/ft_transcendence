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
import { Icon } from '@iconify/react';
import { useState } from 'react';


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
			<div className="flex justify-center items-center h-[200px] border border-gray-50 space-x-1 text-[#EEE5BE]">
				<p>You already have an account?</p>
				<button className="text-[#40CFB7] hover:text-[#f18662] focus:outline-none">
					Sign in!
				</button>
			</div>
			<div className="flex justify-center h-[300px] border border-red-400">
			<Form {...loginForm}>
				<form onSubmit={loginForm.handleSubmit(submitLogin)} 
				className="h-[472px] w-[562px] space-y-[50px]">
					<FormField
						control={loginForm.control}
						name="email"
						render={({ field }) => (
							<FormItem className="w-[562px] h-[54px] space-y-2 text-[#FFFFFF]">
							<FormLabel>Email</FormLabel>
							<FormControl className="text-[#4C4C4C]">
								<div className="relative">
									<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
										<Icon icon="entypo:email" width="20" height="20" />
									</div>
									<div>
										<Input placeholder="Enter your email" className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl" {...field} />
									</div>
								</div>
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
							<FormControl className="text-[#4C4C4C]">
								<div className="relative">
									<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
										<Icon icon="icon-park-solid:lock-one" width="24" height="24" />
									</div>
									<div>
										<Input placeholder="Enter your email" className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl" {...field} />
									</div>
								</div>
							</FormControl>
							<FormMessage />
							</FormItem>
					)}
					/>
					<Button type="submit"
					className="w-[562px] h-[54px] mt-7 bg-[#40CFB7] hover:bg-[#EEE5BE] rounded-3xl shadow-shd">
						<span className="text-[#c75b37]">sign up</span>
					</Button>
				</form>
			</Form>
			</div>
			<div className="flex flex-col justify-center items-center border h-[300px] border-red space-y-4">
				<div className="flex items-center w-full">
					<div className="border-t-2 border-[#40CFB7] flex-grow "></div>
					<p className="text-[15px] font-regular text-white mx-4">Or sign with</p>
					<div className="border-t-2 border-[#40CFB7] flex-grow "></div>
				</div>
				<button>
					<img src="/42.svg" alt="logo" width={69} height={50} className="w-16 h-auto"/>
				</button>
			</div>
		</Card>
	</div>
	)
}

export default LoginForm
