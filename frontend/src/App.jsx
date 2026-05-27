import { ClerkProvider } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
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
      <AuthSyncProvider>
        <AppRoutes />
      </AuthSyncProvider>
    </ClerkProvider>
  );
}

export default App;
