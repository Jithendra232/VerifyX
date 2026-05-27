import { SignUp } from "@clerk/clerk-react";
import PostAuthRedirect from "../../components/auth/PostAuthRedirect";
import { usePostAuthRedirect } from "../../hooks/usePostAuthRedirect";

function SignupPage() {
  const { isLoaded, hasActiveSession, isSyncingUser, syncError } = usePostAuthRedirect();

  if (!isLoaded || (hasActiveSession && isSyncingUser)) {
    return <div className="p-6">Loading...</div>;
  }

  if (hasActiveSession) {
    return (
      <div className="p-6">
        <p>Redirecting to dashboard...</p>
        <PostAuthRedirect />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Create Account</h1>
      {syncError ? <p className="mb-3 text-sm text-red-600">{syncError}</p> : null}
      <SignUp routing="path" path="/sign-up" signInUrl="/login" fallbackRedirectUrl="/sign-up" />
    </div>
  );
}

export default SignupPage;
