"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate form
    if (!formData.username || !formData.password) {
      setError("Username and password are required");
      return;
    }
    
    // Test credentials for frontend testing
    if (formData.username === "admin" && formData.password === "admin123") {
      // Mock successful admin login for testing
      localStorage.setItem("token", "test-token-for-frontend-development");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userId", "admin_user");
      toast.success("Login successful as Admin!");
      router.push("/matrix");
      return;
    } else if (formData.username === "user" && formData.password === "user123") {
      // Mock successful user login for testing
      localStorage.setItem("token", "test-token-for-frontend-development");
      localStorage.setItem("userRole", "user");
      localStorage.setItem("userId", formData.username);
      toast.success("Login successful as User!");
      router.push("/matrix");
      return;
    } 
    // Sample user 1
    else if (formData.username === "john" && formData.password === "john123") {
      localStorage.setItem("token", "test-token-for-frontend-development");
      localStorage.setItem("userRole", "user");
      localStorage.setItem("userId", "john");
      toast.success("Login successful as John!");
      router.push("/matrix");
      return;
    }
    // Sample user 2
    else if (formData.username === "sarah" && formData.password === "sarah123") {
      localStorage.setItem("token", "test-token-for-frontend-development");
      localStorage.setItem("userRole", "user");
      localStorage.setItem("userId", "sarah");
      toast.success("Login successful as Sarah!");
      router.push("/matrix");
      return;
    }
    // Sample user 3
    else if (formData.username === "mike" && formData.password === "mike123") {
      localStorage.setItem("token", "test-token-for-frontend-development");
      localStorage.setItem("userRole", "user");
      localStorage.setItem("userId", "mike");
      toast.success("Login successful as Mike!");
      router.push("/matrix");
      return;
    }
    // Sample user 4
    else if (formData.username === "emma" && formData.password === "emma123") {
      localStorage.setItem("token", "test-token-for-frontend-development");
      localStorage.setItem("userRole", "user");
      localStorage.setItem("userId", "emma");
      toast.success("Login successful as Emma!");
      router.push("/matrix");
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`,
        {
          username: formData.username,
          password: formData.password,
        }
      );
      
      if (response.data.token) {
        // Save token and role to localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.role || "user");
        
        // Redirect to dashboard
        toast.success("Login successful!");
        router.push("/matrix");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error || 
          "Login failed. Please check your credentials and try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link href="/auth/register" className="font-medium text-green-600 hover:text-green-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {registered && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Registration successful! Please login with your credentials.</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-green-600 hover:text-green-500">
                Forgot your password?
              </a>
            </div>
          </div>

         <div>
            <button
             type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-green-800 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-green-300"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}