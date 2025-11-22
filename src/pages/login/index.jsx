import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "At least 6 characters").required("Password is required"),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials(result.data));
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen w-screen">
      {/* Left Side */}
      <div className="flex w-full lg:w-1/2 flex-col p-4 bg-white relative">
        <img src="./Logo-R.png" alt="Logo" className="w-36" />

        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-sm w-full space-y-5">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Please sign in to your account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1 text-sm">Password</label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-500">
                  {error?.data?.message || "Login failed"}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#f42222] text-white py-2 rounded-md font-semibold text-sm hover:bg-[#770c0c] transition"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="absolute bottom-4 left-0 w-full text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Collegium Consultancy. All rights reserved.
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex w-1/2 relative">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="./bg.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 flex flex-col items-center justify-center w-full bg-black/60">
          <img src="./circle-logo.png" alt="Logo" className="w-[18%]" />
          <h1 className="text-white text-2xl font-semibold">
            Collegium Consultancy
          </h1>
        </div>
      </div>
    </div>
  );
}
