import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

const getFavorites = async (uid: number) => {
  const user = getAuth().currentUser;
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const favorites = userDoc.data().favorites || [];
      console.log(favorites, "Favorites récupérés depuis Firestore");

      // On récupère les détails du film pour chaque favori (en utilisant l'ID)
      const fetchedFavorites = await Promise.all(
        favorites.map(async (favorite) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/movie/${favorite.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            );
            const movieDetails = await response.json();

            if (movieDetails.title && movieDetails.poster_path) {
              return {
                id: favorite.id,
                title: movieDetails.title,
                poster_path: movieDetails.poster_path,
                genres: movieDetails.genres.map((genre: string) => genre.name),
                genre_ids: movieDetails.genres.map((genre: number) => genre.id),
              };
            } else {
              console.error(
                `Détails du film manquants pour l'ID ${favorite.id}`
              );
              return null;
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération des détails du film:",
              error
            );
            return null;
          }
        })
      );

      const validFavorites = fetchedFavorites.filter(
        (favorite) => favorite !== null
      );

      console.log(validFavorites, "Favorites après avoir récupéré les détails");
      return validFavorites;
    } else {
      console.log("Document utilisateur non trouvé");
      return [];
    }
  } else {
    console.log("Utilisateur non connecté");
    return [];
  }
};

const addFavorite = async (movieId: { id: number }) => {
  const user = getAuth().currentUser;
  if (!user) {
    console.log("Utilisateur non connecté");
    return;
  }

  if (!movieId.id || isNaN(movieId.id)) {
    console.error("ID de film invalide :", movieId);
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, { favorites: [] });
  }

  const currentFavorites = userDoc.exists()
    ? userDoc.data().favorites || []
    : [];
  if (currentFavorites.some((fav: any) => fav.id === movieId.id)) {
    console.log("Film déjà en favoris");
    return;
  }

  try {
    console.log(`Fetching details for movie ID: ${movieId.id}`);

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
    );

    console.log("TMDB response:", response);

    if (!response.ok) {
      console.error(
        `Erreur API TMDB : ${response.status} ${response.statusText}`
      );
      return;
    }

    const movieDetails = await response.json();

    if (!movieDetails.id || movieDetails.success === false) {
      console.log("Film introuvable sur TMDB :", movieDetails);
      return;
    }

    console.log("Détails du film reçus :", movieDetails);

    const movieData = {
      id: movieDetails.id,
      title: movieDetails.title,
      poster_path: movieDetails.poster_path,
      backdrop_path: movieDetails.backdrop_path,
      overview: movieDetails.overview,
      release_date: movieDetails.release_date,
      genres: movieDetails.genres.map((genre: any) => genre.name),
      genre_ids: movieDetails.genres.map((genre: any) => genre.id),
      vote_average: movieDetails.vote_average,
    };

    await updateDoc(userRef, {
      favorites: arrayUnion(movieData),
    });

    console.log(`Film "${movieDetails.title}" ajouté aux favoris ✅`);
  } catch (error) {
    console.error("Erreur lors de l'ajout du favori :", error);
  }
};

const removeFavorite = async (uid, movie) => {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const favorites = userDoc.data().favorites || [];

    const movieToRemove = favorites.find(
      (favMovie) => favMovie.id === movie.id
    );

    if (movieToRemove) {
      await updateDoc(userRef, {
        favorites: arrayRemove(movieToRemove),
      });

      console.log(`Film ${movie.id} retiré des favoris`);
    } else {
      console.log("Film introuvable dans les favoris");
    }
  } else {
    console.log("Utilisateur non connecté");
  }
};

export { getFavorites, addFavorite, removeFavorite };
