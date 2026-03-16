"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import AuthInitializer from "@/components/auth/AuthInitializer";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <Provider store={store}>
        <AuthInitializer>{children}</AuthInitializer>
        <Toaster />
      </Provider>
    </GoogleOAuthProvider>
  );
}