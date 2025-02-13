// app/page.tsx
"use client"; // Utiliser cette directive pour indiquer un composant client

import { useEffect, useState } from "react";
import { fetchPopularMovies } from "./lib/tmdb"; // Import de la fonction pour récupérer les films populaires
import { useRouter } from "next/navigation";

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Films Populaires</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie: any) => (
            <div
              key={movie.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-72 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold">{movie.title}</h3>
              <p className="text-sm text-gray-400">{movie.release_date}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={goToProfile}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Voir Mon Profil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
