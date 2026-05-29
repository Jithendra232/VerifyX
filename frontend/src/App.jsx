import { ClerkProvider } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { AuthSyncProvider } from "./context/AuthSyncContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to)}
      signInUrl="/login"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/login"
      signUpFallbackRedirectUrl="/sign-up"
    >
      <ErrorBoundary>
        <AuthSyncProvider>
          <AppRoutes />
        </AuthSyncProvider>
      </ErrorBoundary>
    </ClerkProvider>
  );
}

export default App;
