'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Register() {
  const router = useRouter();
  const [errorMessages, setErrorMessages] = useState<string[]>([]); // State to store multiple error messages.
  const [isLoading, setIsLoading] = useState(false); // State to track loading status.

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessages([]); // Clear previous errors.
    setIsLoading(true); // Set loading state.

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrorMessages(data.errors.map((err) => err.message)); // Display specific error messages.
        } else {
          throw new Error(data.error || 'Registration failed');
        }
        return;
      }

      router.push('/dashboard'); // Redirect to dashboard on successful registration.
    } catch (err) {
      setErrorMessages([err instanceof Error ? err.message : 'An unexpected error occurred']);
    } finally {
      setIsLoading(false); // Reset loading state.
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">Get started with our service</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm">
          {/* First Name Input */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="John"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="•••••••••••••••"
              />
            </div>
          </div>

          {/* Error Messages */}
          {errorMessages.length > 0 && (
            <ul className="p-3 text-sm text-red-700 bg-red-50 rounded-md list-disc list-inside">
              {errorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                        text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-500 
                        disabled:bg-blue-300 transition-colors`}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Link to Login Page */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
