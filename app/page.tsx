// app/page.tsx
"use client"; // Utiliser cette directive pour indiquer un composant client

import { useEffect, useState } from "react";
import { fetchPopularMovies } from "./lib/tmdb"; // Import de la fonction pour récupérer les films populaires
import { useRouter } from "next/navigation";
import MoviesList from "./components/MoviesList";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const router = useRouter();

  // Fonction pour charger les films populaires
  useEffect(() => {
    const getMovies = async () => {
      const data = await fetchPopularMovies();
      setMovies(data);
    };
    getMovies();
  }, []);

  // Fonction pour rediriger vers le profil de l'utilisateur
  const goToProfile = () => {
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className=" text-center">
        <button
          onClick={goToProfile}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Voir Mon Profil
        </button>
      </div>
      <div className="container mx-auto px-4 py-8">
        <MoviesList />
      </div>
    </div>
  );
};

export default Home;
