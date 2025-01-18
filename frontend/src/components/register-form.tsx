"use client";

import { useForm } from "react-hook-form";
import { Card } from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";

export interface FormDataRegister {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
}

export const RegisterForm = () => {
  const router = useRouter();
  const [data, setData] = useState("");

  const formSchema = z
    .object({
      username: z.string().min(4).max(10),
      email: z.string().email("Invalid email address"),
      password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords must match",
      path: ["confirmPassword"],
    });

  const registerForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const postRegisterData = async (formData: FormDataRegister) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/sign_up",
        formData
      );
      setData(response.data.message);
    } catch (error) {
      console.error("Error fetching data:", error);
      return;
    }
    console.log(data);
    router.push("/dashboard");
  };

  function submitRegister(values: z.infer<typeof formSchema>) {
    // Handle the form values
    console.log(values);

    // Redirect to the dashboard page
    postRegisterData(values);
  }

  return (
    <Card className="w-[690px] h-[606px] bg-[#751d03] bg-opacity-[18%] p-10 flex justify-center flex-col rounded-3xl border-none backdrop-blur-lg">
      <div className="flex justify-center">
        <p className="text-[22px] font-normal text-gray-700 leading-relaxed">
          {" "}
          Join us by entering your information{" "}
        </p>
      </div>
      <div className="flex justify-center">
        <Form {...registerForm}>
          <form
            onSubmit={registerForm.handleSubmit(submitRegister)}
            className="h-[472px] w-[562px] space-y-10"
          >
            <FormField
              control={registerForm.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-[562px] h-[54px] space-y-2 border border-red-600 ">
                  <FormLabel>Username</FormLabel>
                  <div className="border border-green-500">
                  <FormControl>
                    <Input placeholder="@ Enter your username" {...field} />
                  </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-[562px] h-[54px] space-y-2">
                  <FormLabel>email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <div className="flex space-x-4 justify-between">
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
									<FormItem className="w-[275px] h-[54px]">
                    <FormLabel>password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="w-[275px] h-[54px]">
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            </div>
            <Button type="submit" className="w-[562px] h-[54px] mt-7 bg-[#40CFB7] shadow-md hover:bg-[#c75b37] rounded-3xl space-y-20">
							<span className="text-[#c75b37]">sign up</span>
						</Button>
            <div className="flex justify-center space-x-1">
              <p>You already have an account?</p>
              <button className="text-blue-500 hover:text-[#8D361A] focus:outline-none">Sign in!</button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
};
