import { UserButton, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useAuthSync } from "../../context/AuthSyncContext";

function DashboardUserButton() {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { resetAuthState } = useAuthSync();

  const handleAddAccount = async () => {
    resetAuthState();
    await signOut();
    navigate("/login", { replace: true });
  };

  const handleSignOut = async () => {
    resetAuthState();
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <UserButton
      afterSignOutUrl="/login"
      signInUrl="/login"
      appearance={{
        elements: {
          avatarBox: "w-9 h-9",
          userButtonPopoverActionButton__addAccount: { display: "none" },
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Action label="manageAccount" />
        <UserButton.Action
          label="Add account"
          labelIcon={<span aria-hidden>+</span>}
          onClick={handleAddAccount}
        />
        <UserButton.Action
          label="Sign out"
          labelIcon={<span aria-hidden>↪</span>}
          onClick={handleSignOut}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}

export default DashboardUserButton;
