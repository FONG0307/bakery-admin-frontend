// src/hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/auth";

type User = {
  id: number;
  email: string;
  role: "admin" | "staff" | "user";
};


export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  return { user, loading };
}
