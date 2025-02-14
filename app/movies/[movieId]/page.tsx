"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Utilisation de useParams dans l'architecture app/
import { fetchMovieDetails } from "../../lib/tmdb"; // Fonction pour récupérer les détails du film

const MovieDetail = () => {
  const { movieId } = useParams(); // Utilisation de useParams pour récupérer l'ID du film dans l'URL
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (movieId) {
        try {
          const movieDetails = await fetchMovieDetails(movieId);
          console.log("Détails du film récupérés:", movieDetails);
          setMovie(movieDetails);
        } catch (error) {
          console.error("Erreur de récupération des détails du film", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (movieId) {
      fetchDetails();
    }
  }, [movieId]); // Réexécuter l'effet lorsque movieId change

  if (loading) {
    return <div className="text-center py-10 text-xl">Chargement...</div>;
  }

  if (!movie) {
    return <div className="text-center py-10 text-xl">Film introuvable.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center md:space-x-12">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full md:w-72 h-auto object-cover rounded-lg shadow-lg"
        />
        <div className="mt-6 md:mt-0 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {movie.title}
          </h1>
          <p className="text-lg text-gray-600">{movie.overview}</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Genres:</strong>{" "}
              {movie.genres.map((g: any) => g.name).join(", ")}
            </p>
            <p>
              <strong>Durée:</strong> {movie.runtime} minutes
            </p>
            <p>
              <strong>Date de sortie:</strong> {movie.release_date}
            </p>
            <p>
              <strong>Note:</strong> {movie.vote_average} ({movie.vote_count}{" "}
              votes)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
