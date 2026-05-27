import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import { PageLoader } from "../../components/common/Loader";
import PostAuthRedirect from "../../components/auth/PostAuthRedirect";

function AuthCallbackPage() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader message="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader message="Completing sign in..." />
      <AuthenticateWithRedirectCallback />
      <PostAuthRedirect />
    </div>
  );
}

export default AuthCallbackPage;
