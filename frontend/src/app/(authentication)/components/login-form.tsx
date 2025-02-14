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
    mutationFn: (data: z.infer<typeof formSchema>) => axios.post("http://localhost:8000/api/auth/sign_in", data, {withCredentials: true}),
  });
  // const fortyTwoMutation = useMutation({
  //   mutationFn: () => axios.get("http://localhost:8000/api/auth/42", {withCredentials: true}),
  // });

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
    console.log(loginMutation);
  }

  if (loginMutation.isSuccess) {
    router.push("/dashboard");
  }

  const handleOauth = async () => {
    const clientId = "u-s4t2ud-485157a1dedad716eefa2e43f388a9ff41988e266ce0a1db66e46b157c9508c7";
    const redirectUri = encodeURIComponent("http://localhost:3000/auth/callback");
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`
    
    window.location.href = url;
    // await axios.get(url, {withCredentials: true})
    // .then((res) => {
    //   console.log('RES: ', res);
    // })
    // .catch((err) => {
    //   console.log('ERR: ', err);
    // });
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
              error:
              {/* {loginMutation.error} */}
            </p>
          ) : null}
          {loginMutation.isSuccess ? (
            <p className="text-green-500 text-sm">
              success:
              {/* {loginMutation.data} */}
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
        <button
          onClick={() => handleOauth()}
        >
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
