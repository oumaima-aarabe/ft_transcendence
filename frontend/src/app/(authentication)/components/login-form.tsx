"use client";

import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { LoginFormProps } from "../auth/page";
import {  useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

const LoginForm = ({setLogin}: LoginFormProps) => {
  const router = useRouter();
  const loginMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => axios.post("http://127.0.0.1:8000/api/auth/sign_in", data),
  });

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
    console.log(values);
    loginMutation.mutate(values);
    if (loginMutation.isSuccess) router.push("/dashboard");
  }

  return (
    <Card className="w-full max-w-lg bg-[#751d03] bg-opacity-[18%] p-6 md:p-10 flex flex-col rounded-3xl border-none backdrop-blur-lg">
      <div className="flex justify-center items-center h-auto p-4 mb-6 text-white text-center space-x-2">
        <p className="text-sm sm:text-base">New to PongArcadia?</p>
        <button onClick={() => {setLogin(false)}} className="text-[#40CFB7] hover:text-[#f18662] focus:outline-none">
          Sign up!
        </button>
      </div>

      <Form {...loginForm}>
        <form
          onSubmit={loginForm.handleSubmit(submitLogin)}
          className="space-y-6"
        >
          <FormField
            control={loginForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2 text-[#FFFFFF]">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Icon
                      icon="entypo:email"
                      width="20"
                      height="20"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      placeholder="Enter your email"
                      className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl w-full"
                      {...field}
                    />
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
              <FormItem className="space-y-2 text-[#FFFFFF]">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Icon
                      icon="icon-park-solid:lock-one"
                      width="24"
                      height="24"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl w-full"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {loginMutation.isError ? (
            <p className="text-red-500 text-sm">
              {loginMutation.error.message}
            </p>
          ) : null}
          {loginMutation.isSuccess ? (
            <p className="text-green-500 text-sm">
              {loginMutation.data.data.message}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-[54px] bg-[#40CFB7] hover:bg-[#EEE5BE] rounded-3xl shadow-shd"
          >
            <span className="text-[#c75b37]">Sign In</span>
          </Button>
        </form>
      </Form>
      <div className="flex flex-col justify-center items-center mt-6 space-y-4">
        <div className="flex items-center w-full">
          <div className="border-t-2 border-[#40CFB7] flex-grow"></div>
          <p className="text-sm text-white mx-4">Or sign in with</p>
          <div className="border-t-2 border-[#40CFB7] flex-grow"></div>
        </div>
        <button>
          <Image
            src="/42.svg"
            alt="logo"
            width={69}
            height={50}
            className="w-16 h-auto"
          />
        </button>
      </div>
    </Card>
  );
};

export default LoginForm;
