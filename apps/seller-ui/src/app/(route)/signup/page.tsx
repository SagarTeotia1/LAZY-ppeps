'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { countries } from 'apps/seller-ui/src/utils/contries';
import Createshop from '../../../shared/modules/auth/create-shop';
import StripeLogo from '../../../assets/svgs/stripe-logo';

const signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [activeStep, setactiveStep] = useState(1);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setshowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setotp] = useState(['', '', '', '']);
  const [SellerData, setSellerData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [sellerId, setsellerId] = useState('');

  const router = useRouter();

  const connectStripe = async () => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`,
      { sellerId }
    );
    
    
    if (response.data?.url) {
      window.location.href = response.data.url;
    }
  } catch (error) {
    console.error("Error connecting to Stripe:", error);
  }
};


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setshowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResetTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!SellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`,
        {
          ...SellerData,
          otp: otp.join(''),
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setsellerId(data?.seller?.id);
      setactiveStep(2);
    },
  });

  const onSubmit = (data: any) => {
    signupMutation.mutate(data);
  };

  const resendOtp = () => {
    if (SellerData) {
      signupMutation.mutate(SellerData);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setotp(newOtp);
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

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen ">
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10"></div>
        {[1, 2, 3].map((step) => (
          <div key={step}>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                step <= activeStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              {step}
            </div>
            <span className="ml-[-15px]">
              {step == 1
                ? 'Create Account'
                : step == 2
                ? 'Steup Shop'
                : 'Connect Bank'}
            </span>
          </div>
        ))}
      </div>

      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font font-semibold text-center mb-4">
                  Create Account
                </h3>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="name"
                  placeholder="sagarteotia"
                  className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                  {...register('name', {
                    required: 'Name is required',
                  })}
                />
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

                <label className="block text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91992*****"
                  className="w-full p-2 border border-gray-300 outline-none !rounded mb-1"
                  {...register('phone_number', {
                    required: 'Phone Number',
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Invalid Phone Number format',
                    },
                    minLength: {
                      value: 10,
                      message: 'Phone number must be at least 10 digits',
                    },
                    maxLength: {
                      value: 15,
                      message: 'Phone number cannot exceed 15 digits',
                    },
                  })}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm">
                    {String(errors.phone_number.message)}
                  </p>
                )}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Country</label>
                  <select
                    id="country"
                    className="w-full p-2 border border-gray-300 outline-none rounded-[4px]"
                    {...register('country', {
                      required: 'Country is required',
                    })}
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm">
                      {String(errors.country.message)}
                    </p>
                  )}
                </div>

                <label className="block text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
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
                    <p className="text-red-500">
                      {String(errors.password.message)}
                    </p>
                  )}
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <Eye /> : <EyeOff />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                >
                  {signupMutation.isPending ? 'Signing up...' : 'Signup'}
                </button>
                {signupMutation.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {signupMutation.error.response?.data?.message ||
                        signupMutation.error.message}
                    </p>
                  )}

                <p className="pt-3 text-center">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-500">
                    Login
                  </Link>
                </p>
              </form>
            ) : (
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
                      onClick={resendOtp}
                      className="text-blue-600 cursor-pointer font-medium hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer}s`
                  )}
                </p>
                {verifyOtpMutation?.isError &&
                  verifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {verifyOtpMutation.error.response?.data?.message ||
                        verifyOtpMutation.error.message}
                    </p>
                  )}
              </div>
            )}
          </>
        )}
        {activeStep == 2 && (
          <Createshop sellerId={sellerId} setActiveStep={setactiveStep} />
        )}
        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Withdraw Method</h3>
            <br />
            <button className="w-full m-auto flex items-center justify-center gap-3 bg-blue-600 text-white py-2 px-4 rounded-lg"
            onClick={connectStripe}
            >
              Connect Stripe <StripeLogo/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default signup;
