"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAuth } from "firebase/auth";
import { fetchMovieDetails } from "../../lib/tmdb";
import { db } from "../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const MovieDetail = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const user = getAuth().currentUser; // Récupération de l'utilisateur connecté

  useEffect(() => {
    const fetchDetails = async () => {
      if (!movieId) return; // Évite de lancer si movieId est undefined

      try {
        const movieDetails = await fetchMovieDetails(movieId);
        setMovie(movieDetails);

        await fetchLikes(movieId);

        // Vérifie si l'utilisateur est bien chargé avant de récupérer ses likes
        const authUser = getAuth().currentUser;
        if (authUser) {
          await checkIfUserLiked(movieId);
        }
      } catch (error) {
        console.error("Erreur de récupération des détails du film", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [movieId]); // Supprimé `user` des dépendances pour éviter qu'il casse le chargement

  // Récupérer le nombre de likes du film
  const fetchLikes = async (id: string) => {
    try {
      const movieRef = doc(db, "movies", id);
      const movieSnap = await getDoc(movieRef);
      if (movieSnap.exists()) {
        setLikes(movieSnap.data().likes || 0);
      } else {
        await setDoc(movieRef, { likes: 0 });
      }
    } catch (error) {
      console.error("Erreur de récupération des likes", error);
    }
  };

  // Vérifier si l'utilisateur a déjà liké ce film
  const checkIfUserLiked = async (id: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userLikes = userSnap.data().likes || [];
        setLiked(userLikes.includes(id));
      } else {
        await setDoc(userRef, { likes: [] });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du like utilisateur",
        error
      );
    }
  };

  const handleLike = async () => {
    if (!movieId || !user) return;

    try {
      const movieRef = doc(db, "movies", movieId);
      const userRef = doc(db, "users", user.uid);

      // Requête pour récupérer les données utilisateur à jour
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, { likes: [] });
      }

      const userLikes = userSnap.data()?.likes || [];
      const hasLiked = userLikes.includes(movieId);

      if (hasLiked) {
        // Retirer le like
        await updateDoc(movieRef, { likes: Math.max(0, likes - 1) });
        await updateDoc(userRef, { likes: arrayRemove(movieId) });
        setLikes(Math.max(0, likes - 1));
        setLiked(false);
      } else {
        // Ajouter le like
        await updateDoc(movieRef, { likes: likes + 1 });
        await updateDoc(userRef, { likes: arrayUnion(movieId) });

        // Vérifier après mise à jour si le like est bien enregistré
        const updatedUserSnap = await getDoc(userRef);
        const updatedUserLikes = updatedUserSnap.data()?.likes || [];
        setLiked(updatedUserLikes.includes(movieId));
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error("Erreur lors du like", error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!movie) return <div>Film introuvable.</div>;

  return (
    <div className="movie-detail p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-gray-900">{movie.title}</h1>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-96 object-cover mt-4 rounded-lg"
      />
      <div className="mt-4 text-gray-700">
        <p className="text-lg">{movie.overview}</p>
        <p className="mt-2 text-sm">
          <strong>Genres:</strong>{" "}
          {movie.genres.map((g: any) => g.name).join(", ")}
        </p>
        <p className="mt-2 text-sm">
          <strong>Durée:</strong> {movie.runtime} minutes
        </p>
        <p className="mt-2 text-sm">
          <strong>Date de sortie:</strong> {movie.release_date}
        </p>
        <p className="mt-2 text-sm">
          <strong>Note:</strong> {movie.vote_average} ({movie.vote_count} votes)
        </p>
      </div>

      {/* Bouton de like */}
      <div className="mt-6 flex items-center space-x-4">
        <button
          onClick={handleLike}
          className={`px-4 py-2 rounded-lg text-white ${
            liked
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {liked ? "❤️ Aimé" : "🤍 J'aime"}
        </button>
        <p className="text-gray-900 text-lg font-semibold">{likes} likes</p>
      </div>
    </div>
  );
};

export default MovieDetail;
