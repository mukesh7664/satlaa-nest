"use client";
import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "../lib/store/store";
import { initializeAuth } from "../lib/store/features/auth/authSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(() => {
    const s = makeStore();
    // Initialize auth state from localStorage
    s.dispatch(initializeAuth());
    return s;
  });

  return <Provider store={store}>{children}</Provider>;
}
