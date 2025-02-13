// components/MoviesList.tsx
import React, { useEffect, useState } from "react";
import { fetchPopularMovies } from "../lib/tmdb";
import { addFavorite } from "../lib/firestore"; // Import de la fonction pour ajouter un favori

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
}

const MoviesList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getMovies = async () => {
      const movies = await fetchPopularMovies();
      setMovies(movies);
      setLoading(false);
    };
    getMovies();
  }, []);

  const handleAddFavorite = (movie: {
    id: number;
    title: string;
    poster_path: string;
  }) => {
    addFavorite(movie); // Passe l'objet complet du film
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="border rounded-lg overflow-hidden shadow-lg text-black"
        >
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-96 object-cover text-black"
          />
          <div className="p-4">
            <h2 className="text-xl font-bold">{movie.title}</h2>
            <p className="text-black text-sm">
              {movie.overview.slice(0, 100)}...
            </p>
            <button
              onClick={() => handleAddFavorite(movie)}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Ajouter aux favoris
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MoviesList;
