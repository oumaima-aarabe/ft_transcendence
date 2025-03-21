"use client";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { LoginFormProps } from "../auth/page";
import { useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface FormDataRegister {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
}

interface RegisterError {
  error: string;
}

export const RegisterForm = ({ setLogin }: LoginFormProps) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const t = useTranslations('auth');

  const PasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const ConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const registerUser = async (userData: FormDataRegister) => {
    try {
      const response = await fetcher.post("/api/auth/sign_up", userData);
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data as RegisterError;
      if (errorData?.error) {
        throw new Error(errorData.error);
      }
      throw new Error("An unexpected error occurred");
    }
  };

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setLogin(true);
    },
    onError: (error) => {
      console.log("user not created", error);
    },
  });

  const formSchema = z
    .object({
      first_name: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(100),
      last_name: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(100),
      username: z
        .string()
        .min(4)
        .max(10)
        .refine((value) => value.includes("_"), {
          message: "Username must contain an underscore (_)",
        }),
      email: z
        .string()
        .email("Invalid email address")
        .refine((value) => !value.toLowerCase().endsWith("@1337.ma"), {
          message: "Email address cannot have 1337.ma extension",
        }),
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
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function submitRegister(values: z.infer<typeof formSchema>) {
    registerMutation.mutate(values);
  }

  return (
    <Card className="w-full max-w-[690px] bg-[#751d03] bg-opacity-[18%] p-8 md:p-10 flex flex-col justify-center rounded-3xl border-none backdrop-blur-lg">
      <div className="text-center mb-6">
        <p className="text-[18px] md:text-[22px] font-medium text-white">
          {t('sign_up.title')}
        </p>
      </div>
      <Form {...registerForm}>
        <form
          onSubmit={registerForm.handleSubmit(submitRegister)}
          className="space-y-6"
        >
          <div className="flex flex-wrap gap-4">
            <FormField
              control={registerForm.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[220px]">
                  <FormLabel className="text-white">{t('sign_up.first_name_label')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Icon icon="mdi:account" 
                        width="20" 
                        height="20"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2"
                        />
                      <Input
                        placeholder={t('sign_up.first_name_placeholder')}
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
              name="last_name"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[220px]">
                  <FormLabel className="text-white">{t('sign_up.last_name_label')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Icon icon="mdi:account" 
                        width="20" 
                        height="20" 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2"
                        />
                      <Input
                        placeholder={t('sign_up.last_name_placeholder')}
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
          
          <FormField
            control={registerForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">{t('sign_up.username_label')}</FormLabel>
                <FormControl>
                  <div className="relative">
                      <Icon icon="mdi:account-circle" 
                      width="20" 
                      height="20" 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      />
                    <Input
                      placeholder={t('sign_up.username_placeholder')}
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
                <FormLabel className="text-white">{t('sign_up.email_label')}</FormLabel>
                <FormControl>
                  <div className="relative">
                      <Icon icon="entypo:email" 
                      width="20" 
                      height="20"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      />
                    <Input
                      placeholder={t('sign_up.email_placeholder')}
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
                  <FormLabel className="text-white">{t('sign_up.password_label')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Icon
                          icon="icon-park-solid:lock-one"
                          width="24"
                          height="24"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2"
                        />
                      <Input
                        type={showPassword ? "password" : "text"}
                        placeholder={t('sign_up.password_placeholder')}
                        className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={PasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                      >
                        <Icon
                          icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                          width="24"
                          height="24"
                          className="text-[#4C4C4C]"
                        />
                      </button>
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
                  <FormLabel className="text-white">{t('sign_up.confirm_password_label')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Icon
                          icon="icon-park-solid:lock-one"
                          width="24"
                          height="24"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2"
                        />
                      <Input
                        type={showConfirmPassword ? "password" : "text"}
                        placeholder={t('sign_up.confirm_password_placeholder')}
                        className="pl-10 !bg-[#EEE5BE] !text-[#4C4C4C] !rounded-3xl"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={ConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                      >
                        <Icon
                          icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                          width="24"
                          height="24"
                          className="text-[#4C4C4C]"
                        />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {registerMutation.isError && (
            <div className="rounded-xl bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {registerMutation.error?.message ||
                      "An error occurred during login"}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {registerMutation.isSuccess && (
            <div className="rounded-lg bg-green-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon
                    className="h-5 w-5 text-green-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {registerMutation.data.data}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-[54px] bg-[#40CFB7] hover:bg-[#EEE5BE] rounded-3xl shadow-lg shadow-[#8D361A]"
            disabled={registerMutation.isPending}
          >
            <span className="text-[#c75b37]">
              {registerMutation.isPending ? t('auth.common.loading') : t('sign_up.button')}
            </span>
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm text-white mt-6">
        <p>
          {t('sign_up.have_account')}{" "}
          <button
            onClick={() => {
              setLogin(true);
            }}
            className="text-[#40CFB7] hover:text-[#8D361A] focus:outline-none"
          >
            {t('sign_up.sign_in_link')}
          </button>
        </p>
      </div>
    </Card>
  );
};
