// app/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { auth } from "./lib/firebase"; // Assure-toi que le chemin est correct
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import ProtectedRoute from "./components/auth";
import LogoutButton from "./components/LogoutButton";

const HomePage = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        router.push("/login"); // Redirection vers la page de login si non connecté
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-black">
            Profil Utilisateur
          </h1>
          <p className="text-center text-black">Bienvenue sur votre profil.</p>
          <h1 className="text-center text-black">{user.email}</h1>

          <div className="text-center mt-6">
            <LogoutButton />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default HomePage;
