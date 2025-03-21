"use client";

import { Card } from "@/components/ui/card";
import {
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@iconify/react";
import { useState, Dispatch, SetStateAction } from "react";
import { fetcher } from "@/lib/fetcher";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

// Define the form schema
const formSchema = z.object({
  code: z.string().length(6, { message: "Code must be 6 digits" }),
});

interface TwoFactorVerificationProps {
  userId: string;
  setShowTwoFactor: Dispatch<SetStateAction<boolean>>;
}

const TwoFactorVerification = ({ userId, setShowTwoFactor }: TwoFactorVerificationProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('auth');

  console.log("userId", userId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const verify2FACode = async (code: string) => {
    try {
      const response = await fetcher.post("/api/auth/verify-2fa", {
        userId,
        code
      });
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.error) {
        throw new Error(errorData.error);
      }
      throw new Error("An unexpected error occurred");
    }
  };

  const verifyMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => verify2FACode(values.code),
    onSuccess: (data) => {
      // On successful verification, redirect to dashboard
      router.push("/profile/me");
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError(null);
    verifyMutation.mutate(values);
  };

  return (
    <Card className="w-full max-w-lg bg-[#751d03] bg-opacity-[18%] p-6 md:p-10 flex flex-col rounded-3xl border-none backdrop-blur-lg">
      <div className="flex flex-col justify-center items-center h-auto p-4 text-white text-center space-x-2 space-y-2">
          <p className="text-3xl font-bold">{t('two_factor.title')}</p>
          <p className="text-xl inline-block text-[#40CFB7]">{t('two_factor.subtitle')}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col space-y-2">
            <label className="text-white text-sm pl-2" htmlFor="code">{t('two_factor.code_label')}</label>
            <input 
              className="h-[44px] pl-4 !bg-[#EEE5BE] text-black !rounded-3xl w-full" 
              type="text" 
              placeholder={t('two_factor.code_placeholder')}
              maxLength={6} 
              {...form.register("code")} 
              required 
            />
            {error && <p className="text-red-500 text-sm pl-2">{error}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full h-[48px] bg-[#40CFB7] hover:bg-[#33a28f] rounded-3xl shadow-shd"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? t('two_factor.verifying') : t('two_factor.verify_button')}
            </Button>
        </form>
        <div className="flex flex-col justify-center items-center mt-6 space-y-4">
        <div className="flex items-center w-full">
          <div className="border-t-2 border-[#40CFB7] flex-grow"></div>
          <p className="text-sm text-white mx-4">{t('two_factor.or')}</p>
          <div className="border-t-2 border-[#40CFB7] flex-grow"></div>
        </div>
        <Button className="w-full h-[48px] bg-zinc-500 hover:bg-zinc-600 rounded-3xl shadow-shd" onClick={() => setShowTwoFactor(false)}>
            <Icon icon="mdi:arrow-left" width="24" height="24" className="mr-2" fill="white"/>
            {t('two_factor.go_back')}
        </Button>
      </div>
      </Form>
    </Card>
  );
};

export default TwoFactorVerification;
