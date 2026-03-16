"use client";

import { logoutUser } from "@/redux/slices/authSlice";
import { logoutUser as logoutUserAPI } from "@/services/authService";
import { useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUserAPI();

    dispatch(logoutUser());

    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}