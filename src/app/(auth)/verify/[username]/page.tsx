'use client';
import { signUpSchema } from '@/schemas/signupSchema';
import {useParams,useRouter} from 'next/navigation';
import React, {useEffect, useState } from 'react';
import {  useForm} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from 'axios';  
import {toast} from 'sonner';
import { verifySchema } from '@/schemas/verifySchema';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const VerifyAccount=()=>{
    const router=useRouter();
    const param=useParams<{username:string}>();
      const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

    
    const onSubmit=async(data:z.infer<typeof verifySchema >)=>{
    try{
        await axios.post('/api/verify-code',{
            username:param.username,
            code:data.code
        })

        toast.success('Account verified successfully! Redirecting to sign in page...');
        router.replace('/sign-in')
    }
    catch(error){
    toast.error('Verification failed. Please try again.');
    }
}
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  );   

}

export default VerifyAccount;
