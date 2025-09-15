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

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap();// API call using authApi
      // console.log(" Full API result:", result);
      dispatch(setCredentials(result.data));
      // console.log(" Dispatched credentials:", result.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };


  return (
    <div className="flex min-h-screen w-screen">
      <div className="flex w-full lg:w-1/2 flex-col p-4 bg-white">
        <img src="./Logo-R.png" alt="Logo" className="w-40" />

        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md w-full space-y-6">
            <h2 className="text-4xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600">Please sign in to your account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {error && <p className="text-sm text-red-500">{error?.data?.message || "Login failed"}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#f42222] text-white py-3 rounded-lg font-semibold hover:bg-[#770c0c] transition"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="./bg.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 flex flex-col items-center justify-center w-full bg-black/60">
          <img src="./circle-logo.png" alt="Logo" className="w-[20%]" />
          <h1 className="text-white text-3xl font-semibold">Collegium Consultancy</h1>
        </div>
      </div>
    </div>
  );
}
