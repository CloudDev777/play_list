import parse from "html-react-parser";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { RiMusic2Fill } from "react-icons/ri";
import Layout from "./Layout";
import TracksTable from "./TracksTable";
import styles from "../styles/Description.module.css";
import { PlaylistType_custom } from "../types/types";
import { customGet } from "../utils/customGet";
import { isAuthenticated } from "../utils/isAuthenticated";

interface IProps {
  playlist: PlaylistType_custom | null;
}

export default function Playlist({ playlist }: IProps) {
  if (!playlist) {
    return (
      <Layout title="Spotify - Playlist not found">
        <div className="flex items-center justify-center h-64">
          <p className="text-xl text-gray">Playlist not found</p>
        </div>
      </Layout>
    );
  }

  const images = Array.isArray(playlist.images) ? playlist.images : [];
  const name = playlist.name || 'Untitled Playlist';
  const description = playlist.description || '';
  const ownerName = playlist.release_date || 'Unknown';
  const followers = playlist.followers?.total || 0;
  const tracks = playlist.tracks?.items || [];
  const totalTracks = playlist.total_tracks || 0;

  return (
    <Layout title={`Spotify - ${name}`}>
      <div className="flex mt-[20px] items-center gap-6">
        <div>
        {images.length > 0 ? (
          <img
            src={images[0].url}
            alt={name}
            className="object-contain w-60 h-60"
          />
        ) : (
          <div className="w-60 h-60">
            <RiMusic2Fill className="w-full h-full bg-paper" />
          </div>
        )}
        </div>
        <div className="flex flex-col gap-7">
          <h5 className="text-xs font-bold uppercase">{playlist.type || 'Playlist'}</h5>
          <h2 className="text-3xl font-bold">{name}</h2>

          {description && (
            <p className={styles.description}>
              {parse(description)}
            </p>
          )}

          <div className="flex items-center gap-7 text-sm">
            <span className="font-bold">{ownerName}</span>
            {followers > 0 && (
              <span className="text-gray">
                {followers.toLocaleString()}{" "}
                {followers > 1 ? "likes" : "like"}
              </span>
            )}
            {totalTracks > 0 && (
              <span className="text-gray">
                {totalTracks.toLocaleString()} Lists
              </span>
            )}
          </div>
        </div>
      </div>

      {tracks.length > 0 && (
        <div className="mt-5">
          <TracksTable
            tracks={tracks
              .filter((item) => item?.track !== null)
              .map((item) => item.track)}
          />
        </div>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!(await isAuthenticated(session))) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const playlistId = ctx.params?.playlistId;
    if (!playlistId) {
      return { props: { playlist: null } };
    }

    console.log(playlistId)
    const playlist = await customGet(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      session
    );

    return { props: { playlist: playlist || null } };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return { props: { playlist: null } };
  }
};
