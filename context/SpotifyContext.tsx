import axios from "axios";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { PlaylistType, SearchResults, Track } from "../types/types";

interface ContextProps {
  playlists: PlaylistType[];
  searchResults: SearchResults | null;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  fetchPlaylists: () => Promise<void>;
  fetchSearchResults: (query: string) => Promise<void>;
  currentTrack: Track | null;
  setCurrentTrack: Dispatch<SetStateAction<Track | null>>;
  tracksQueue: Track[];
  setTracksQueue: Dispatch<SetStateAction<Track[]>>;
  error: string | null;
  isLoading: boolean;
}

const SpotifyContext = createContext({} as ContextProps);

export const SpotifyProvider = ({ children }: any) => {
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [tracksQueue, setTracksQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.get("/api/playlists");
      if (resp.data?.items) {
        setPlaylists(resp.data.items);
      } else {
        setError("No playlists found");
      }
    } catch (err) {
      console.error("Error fetching playlists:", err);
      setError("Failed to fetch playlists");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    if (!query) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`/api/search?q=${query}`);
      setSearchResults(resp.data);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError("Failed to fetch search results");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SpotifyContext.Provider
      value={{
        playlists,
        fetchPlaylists,
        query,
        setQuery,
        searchResults,
        fetchSearchResults,
        currentTrack,
        setCurrentTrack,
        tracksQueue,
        setTracksQueue,
        error,
        isLoading,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => useContext(SpotifyContext);
