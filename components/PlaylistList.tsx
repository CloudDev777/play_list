import { PlaylistType } from "../types/types";
import CardItem from "./CardItem";
import CardItemGrid from "./CardItemGrid";

interface IProps {
  playlists: PlaylistType[];
}

export default function PlaylistList({ playlists = [] }: IProps) {
  if (!playlists?.length) {
    return null;
  }

  return (
    <CardItemGrid>
      {playlists.map((playlist) => {
        // Skip invalid playlists
        if (!playlist?.id || !playlist?.name) {
          return null;
        }

        // Ensure all required properties have fallback values
        const images = Array.isArray(playlist.images) ? playlist.images : [];
        const description = playlist.description || '';
        const name = playlist.name || 'Untitled Playlist';

        return (
          <CardItem
            key={playlist.id}
            id={playlist.id}
            heading={name}
            subheading={description}
            altTitle={name}
            images={images}
            type="playlist"
          />
        );
      })}
    </CardItemGrid>
  );
}
