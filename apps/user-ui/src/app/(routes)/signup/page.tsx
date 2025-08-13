'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import GoogleButtonIcon from '../../../shared/components/google-button';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from "axios";

type FormData = {
  name: string;
  email: string;
  password: string;
};

const signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
 
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setshowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setotp] = useState(['', '', '', '']);
  const [userData, setUserData] = useState<FormData|null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();


  const startResetTimer = () =>{
    const interval = setInterval(()=>{
      setTimer((prev)=> {
        if(prev<= 1){
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev -1;

      });

    }, 1000);
  }


  const signupMutation = useMutation({
    mutationFn: async(data:FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-registration`,data);
      return response.data;
    },
    onSuccess:(_, formData) => {
      setUserData(formData);
      setshowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResetTimer();
    },
  })


  const verifyOtpMutation = useMutation({

    mutationFn: async()=>{
      if(!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-user`,{
          ...userData,
          otp: otp.join(""),
        }
      );
      return response.data
    },
    onSuccess:()=>{
      router.push("/login");
    },
  });


  const onSubmit = (data: FormData) => {
   signupMutation.mutate(data);
  };

  const resendOtp = () => {
    if(userData){
      signupMutation.mutate(userData);
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
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        SignUp
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home.Signup
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            SignUp to Lazycheck
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an account?
            <Link href="/signup" className="text-blue-500">
              login
            </Link>
          </p>

          <GoogleButtonIcon />
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in with Email </span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
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
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">
                  {String(errors.email.message)}
                </p>
              )}

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
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </button>
                {errors.password && (
                  <p className="text-red-500">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
              >
                {signupMutation.isPending? "Signing up...":"Signup"}
              </button>
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
              <button className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
              disabled={verifyOtpMutation.isPending}
              onClick={()=>verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending?"Verifying OTP ...": "Verify OTP"}
                
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
              {
                verifyOtpMutation?.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className='text-red-500 text-sm mt-2'>
                    {verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}

                  </p>
                )
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default signup;
