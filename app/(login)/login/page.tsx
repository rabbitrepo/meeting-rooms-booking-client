'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { sendOtp } from '@/lib/AppWrite';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

export default function Page() {
  const [buttonLoading, setButtonLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setButtonLoading(true);

    try {
      const { email } = data; // Extract email from form data
      const userId = uuidv4(); // Generate a unique userId
      console.log('created userId:', userId);
      // Call the sendOtp function with userId and email
      const result = await sendOtp(userId, email);
      console.log('sendOtp result:', result);

      // Redirect to /login/verify with the userId and email in the query parameters
      router.push(`/login/verify?userId=${result.userId}&email=${encodeURIComponent(email)}`);

      // Stop button loading state
      setButtonLoading(false);
    } catch (error) {
      console.error(error);
      setButtonLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        {/* Heading */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          ลงชื่อเข้าใช้
        </h1>

        {/* Subheading */}
        <p className="text-sm text-gray-600 mb-6">
          กรุณากรอก Email ของคุณ และกดเข้าสู่ระบบ
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="example@dohome.co.th"
              {...register('email', { required: 'Email is required' })}
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <LoadingButton loading={buttonLoading} type="submit" className="w-full" >
            เข้าสู่ระบบ
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
