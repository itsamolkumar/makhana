"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import AuthInitializer from "@/components/auth/AuthInitializer";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster, ToastBar, toast } from "react-hot-toast";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthInitializer>{children}</AuthInitializer>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: { minWidth: "320px", maxWidth: "90vw", fontSize: "14px", borderRadius: "12px", padding: "16px", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" },
              success: { style: { background: "#10b981", color: "white", fontWeight: "500" }, iconTheme: { primary: "white", secondary: "#10b981" } },
              error: { style: { background: "#ef4444", color: "white", fontWeight: "500" }, iconTheme: { primary: "white", secondary: "#ef4444" } },
            }}
          >
            {(t) => (
              <ToastBar toast={t}>
                {({ icon, message }) => (
                  <>
                    {icon}
                    {message}
                    {t.type !== 'loading' && (
                      <button 
                        onClick={() => toast.dismiss(t.id)} 
                        className="ml-auto flex items-center justify-center rounded-full w-6 h-6 hover:bg-black/10 focus:outline-none"
                        style={{ alignSelf: "flex-start", marginTop: "-2px" }}
                      >
                        ✕
                      </button>
                    )}
                  </>
                )}
              </ToastBar>
            )}
          </Toaster>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  );
}