'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const errorMessages: Record<string, { title: string; description: string }> =
    {
      Configuration: {
        title: 'Configuration Error',
        description:
          'There is a problem with the server configuration. Please contact support.',
      },
      AccessDenied: {
        title: 'Access Denied',
        description:
          'You do not have permission to access this resource. Your account may be inactive.',
      },
      Verification: {
        title: 'Verification Failed',
        description:
          'The verification token is invalid or has expired. Please try signing in again.',
      },
      Default: {
        title: 'Authentication Error',
        description:
          'An error occurred during authentication. Please try again.',
      },
    };

  const errorInfo =
    errorMessages[error || ''] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light text-stone-900 mb-2">
            Al Fath Kayu
          </h1>
          <p className="text-sm text-stone-600">
            Multi-Wood-Type Precision Costing System
          </p>
        </div>

        {/* Error Message */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-light text-stone-900 mb-2">
              {errorInfo.title}
            </h2>
            <p className="text-sm text-stone-600">{errorInfo.description}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-lg">
              <p className="text-xs font-medium text-stone-700 mb-1">
                Error Code
              </p>
              <p className="text-sm text-stone-900 font-mono">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-stone-900 text-white py-3 px-4 rounded-lg hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-all"
            >
              Back to Sign In
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-white text-stone-700 py-3 px-4 rounded-lg border border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-all"
            >
              Go to Home
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Al Fath Kayu. All rights reserved.
          </p>
          <p className="text-xs text-stone-400 mt-2">
            If this problem persists, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <p className="text-stone-600">Loading...</p>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
