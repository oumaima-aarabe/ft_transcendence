"use client";

import { useForm } from "react-hook-form";
import { Card } from "../../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Icon } from "@iconify-icon/react";

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
    console.log(values);
    postRegisterData(values);
  }

  return (
    <Card className="w-full max-w-[690px] bg-[#751d03] bg-opacity-[18%] p-8 md:p-10 flex flex-col justify-center rounded-3xl border-none backdrop-blur-lg">
      <div className="text-center mb-6">
        <p className="text-[18px] md:text-[22px] font-medium text-white">
          Join us by entering your information
        </p>
      </div>
      <Form {...registerForm}>
        <form
          onSubmit={registerForm.handleSubmit(submitRegister)}
          className="space-y-6"
        >
          <FormField
            control={registerForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Icon icon="entypo:email" width="20" height="20" />
                    </div>
                    <Input
                      placeholder="Enter your username"
                      className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={registerForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Icon icon="entypo:email" width="20" height="20" />
                    </div>
                    <Input
                      placeholder="Enter your email"
                      className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-wrap gap-4">
            <FormField
              control={registerForm.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[220px]">
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Icon
                          icon="icon-park-solid:lock-one"
                          width="24"
                          height="24"
                        />
                      </div>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[220px]">
                  <FormLabel className="text-white">Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Icon
                          icon="icon-park-solid:lock-one"
                          width="24"
                          height="24"
                        />
                      </div>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-[54px] bg-[#40CFB7] hover:bg-[#EEE5BE] rounded-3xl shadow-lg shadow-[#8D361A]"
          >
            <span className="text-[#c75b37]">Sign up</span>
          </Button>
          <div className="text-center text-sm text-white">
            <p>
              Already have an account?{" "}
              <button className="text-[#40CFB7] hover:text-[#8D361A] focus:outline-none">
                Sign in!
              </button>
            </p>
          </div>
        </form>
      </Form>
    </Card>
  );
};

