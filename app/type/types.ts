// types.ts
export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    overview: string;
    genres: string[]; 
    genre_ids: number[];
    release_date: string;
    backdrop_path: string;
    vote_average: number;
  }
  