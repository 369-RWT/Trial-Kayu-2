'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignOutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: false });
    router.push('/auth/signin');
    router.refresh();
  };

  const handleCancel = () => {
    router.back();
  };

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

        {/* Sign Out Confirmation */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          <h2 className="text-xl font-light text-stone-900 mb-6">
            Sign Out
          </h2>

          {session ? (
            <>
              <div className="mb-6">
                <p className="text-sm text-stone-700 mb-4">
                  Are you sure you want to sign out?
                </p>
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                  <p className="text-xs text-stone-600 mb-1">Signed in as:</p>
                  <p className="text-sm font-medium text-stone-900">
                    {session.user?.email}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Role: {session.user?.role}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex-1 bg-stone-900 text-white py-3 px-4 rounded-lg hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningOut ? 'Signing out...' : 'Yes, Sign Out'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSigningOut}
                  className="flex-1 bg-white text-stone-700 py-3 px-4 rounded-lg border border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-stone-700 mb-6">
                You are not currently signed in.
              </p>
              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-stone-900 text-white py-3 px-4 rounded-lg hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-all"
              >
                Go to Sign In
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Al Fath Kayu. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
