// components/UserFavorites.tsx
import { useEffect, useState } from "react";
import { getFavorites } from "../lib/firestore";
import { Movie } from "../type/types";
import MoviesList from "./MoviesList";

const UserFavorites = () => {
  const [favorites, setFavorites] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const fetchedFavorites = await getFavorites();
      setFavorites(fetchedFavorites);
      console.log(fetchedFavorites, "fetchedFavorites");
    };
    fetchFavorites();
  }, []);

  return <MoviesList userFavorites={favorites} />;
};

export default UserFavorites;
