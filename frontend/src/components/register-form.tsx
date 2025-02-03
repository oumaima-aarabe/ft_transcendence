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
import { Icon } from '@iconify-icon/react';

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
        <p className="text-[22px] font-regular text-white leading-relaxed">
          Join us by entering your information
        </p>
      </div>
      <div className="flex justify-center">
        <Form {...registerForm}>
          <form
            onSubmit={registerForm.handleSubmit(submitRegister)}
            className="h-[472px] w-[562px] space-y-[50px]"
          >
            <FormField
              control={registerForm.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-[562px] h-[54px] space-y-2 text-white">
                  <FormLabel>Username</FormLabel>
                  <FormControl className="text-[#4C4C4C]">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Icon icon="entypo:email" width="20" height="20" />                        
                        </div>
                        <div>
                          <Input placeholder="Enter your username" className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl" {...field} />
                        </div>
                      </div>
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-[562px] h-[54px] space-y-2 text-white">
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
            ></FormField>
            <div className="flex space-x-4 justify-between">
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-[275px] h-[54px] text-white">
                    <FormLabel>Password</FormLabel>
                    <FormLabel>Password</FormLabel>
                      <FormControl className="text-[#4C4C4C]">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Icon icon="icon-park-solid:lock-one" width="24" height="24" />
                          </div>
                          <div>
                            <Input placeholder="Enter password" className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl" {...field} />
                          </div>
                        </div>
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="w-[275px] h-[54px] text-white">
                    <FormLabel>Confirm password</FormLabel>
                      <FormControl className="text-[#4C4C4C]">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Icon icon="icon-park-solid:lock-one" width="24" height="24" />
                          </div>
                          <div>
                            <Input placeholder="Confirm password" className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl" {...field} />
                          </div>
                        </div>
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            </div>
            <Button
              type="submit"
              className="w-[562px] h-[54px] mt-7 bg-[#40CFB7] hover:bg-[#EEE5BE] rounded-3xl shadow-lg shadow-[#8D361A]"
            >
              <span className="text-[#c75b37]">sign up</span>
            </Button>
            <div className="flex justify-center space-x-1">
              <p>You already have an account?</p>
              <button className="text-[#40CFB7] hover:text-[#8D361A] focus:outline-none">
                Sign in!
              </button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
};
