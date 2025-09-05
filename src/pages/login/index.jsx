import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";

// ✅ Validation Schema with Yup
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  // ✅ Use react-hook-form with Yup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <div className="flex min-h-screen w-screen">
      {/* Left Side - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col p-4 bg-white">
        {/* Logo top-left */}
        <div className="">
          <img src="./Logo-R.png" alt="Logo" className="w-40" />
        </div>

        {/* Form Section Centered */}
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md w-full space-y-6">
            <h2 className="text-4xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600">Please sign in to your account</p>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end items-center">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              <Link to="/dashboard" 
                type="submit"
                className="w-full flex justify-center bg-[#f42222] text-white py-3 rounded-lg font-semibold hover:bg-[#770c0c] transition-colors duration-500"
              >
                Login
              </Link>
            </form>

            <p className="text-sm text-gray-600 text-center">
              Don’t have an account?{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Video Background with Logo */}
      <div className="hidden lg:flex w-1/2 relative">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="./bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Logo over the video */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full bg-black/60">
          <img
            src="./circle-logo.png"
            alt="Logo"
            className="w-[20%] drop-shadow-2xl !opacity-100"
          />
          <h1 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-center sm:text-left">Collegium Consultancy</h1>
        </div>
      </div>
    </div>
  );
}
