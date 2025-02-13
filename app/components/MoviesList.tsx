// components/MoviesList.tsx

import React from "react";
import Link from "next/link"; // Pour naviguer vers les détails du film

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

interface MoviesListProps {
  movies: Movie[];
}

const MoviesList: React.FC<MoviesListProps> = ({ movies }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <Link href={`/movie/${movie.id}`}>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-72 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{movie.title}</h2>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default MoviesList;
