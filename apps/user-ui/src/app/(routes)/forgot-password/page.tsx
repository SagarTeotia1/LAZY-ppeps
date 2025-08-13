'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResetTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/forgot-user-password`,
        { email }
      );
      return response.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep('otp');
      setServerError(null);
      setCanResend(false);
      startResetTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid OTP. Try Again';
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-user-Forgotpassword`,
        {
          email: userEmail,
          otp: otp.join(''),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('reset');
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid OTP. Try Again';
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-user-password`,
        {
          email: userEmail,
          newPassword: password,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('email');
      toast.success(
        'Password reset successfully! Please login with your new password.'
      );
      setServerError(null);
      router.push('/login');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Failed to reset password. Try again.';
      setServerError(errorMessage);
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpkeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key == 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };

  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home.Forgot-Password
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          {step == 'email' && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2">
                Login to Lazycheck
              </h3>
              <p className="text-center text-gray-500 mb-4">
                Go back to?{' '}
                <Link href="/login" className="text-blue-500">
                  Login
                </Link>
              </p>

              <form onSubmit={handleSubmit(onSubmitEmail)}>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="support@sagarteotia.in"
                  className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {String(errors.email.message)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full text-lg cursor-pointer bg-black mt-4 text-white py-2 rounded-lg hover:bg-gray-800"
                >
                  {requestOtpMutation.isPending ? 'Sending OTP...' : 'Submit'}
                </button>

                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </form>
            </>
          )}
          {step == 'otp' && (
            <div>
              <h3 className="text-xl font-semibold text-center mb-10">
                Enter OTP
              </h3>

              <div className="flex justify-center gap-6">
                {otp?.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpkeyDown(index, e)}
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    className="w-12 h-12 text-center border border-gray-300 outline-none !rounded text-xl"
                  />
                ))}
              </div>
              <button
                className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending
                  ? 'Verifying OTP ...'
                  : 'Verify OTP'}
              </button>
              <p className="text-center text-sm mt-4 text-gray-600">
                {canResend ? (
                  <button
                    onClick={() =>
                      requestOtpMutation.mutate({ email: userEmail! })
                    }
                    className="text-blue-600 cursor-pointer font-medium hover:underline"
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>
              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
            </div>
          )}
          {step == 'reset' && (
            <>
              <h3 className="text-xl font-semibold text-ceneter mb-4">
                Reset Password
              </h3>
              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <label className="block text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {String(errors.password.message)}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full mt-4 text-lg cursor-pointer bg-black py-2 text-white rounded-lg"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending
                    ? 'Resetting..'
                    : 'Reset Password'}
                </button>
              </form>
              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
