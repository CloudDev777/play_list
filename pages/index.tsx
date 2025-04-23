import { BiPauseCircle } from "react-icons/bi"; 
'use client'

import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import AlbumList from "../components/AlbumList";
import Heading from "../components/Heading";
import Layout from "../components/Layout";
import PlaylistList from "../components/PlaylistList";
import { customGet } from "../utils/customGet";
import { isAuthenticated } from "../utils/isAuthenticated";
import { useState } from "react";
import { MdGridView, MdViewList } from "react-icons/md";
import Playlist from "../components/playlistId_custom";
import { BiPlayCircle } from "react-icons/bi"; 

export default function Home({ albumlists, trackList }) {

  const [viewtype, setViewType] = useState("tile");
  function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Pad seconds with leading zero if less than 10
  }
  const unwantedKeywords = [
    "outro",
    "upcoming events",
    "track recap",
    "service for dreamers",
    "shout outs",
    "ASOT event london",
    "intro",
    "upcoming"
  ];

  function containsUnwantedKeywords(trackName) {
    return unwantedKeywords.some(keyword => trackName.toLowerCase().includes(keyword.toLowerCase()));
  }
  return (
    <Layout title="Welcome to Spotify">
      {albumlists?.items && (
        <>
          <div className="flex  justify-between items-center mx-5 ">
            <h1 className={`text-2xl inline-block font-bold mb-5 mt-5`}>
              My Favourites
            </h1>
            <div className="flex gap-4">
              <button onClick={() => setViewType('grid')}>
                <MdGridView size={30} />
              </button>
              <button onClick={() => setViewType('tile')}>
                <MdViewList size={30} />
              </button>
            </div>
          </div>

          {/* {viewtype === "grid" ? (
            <>
              {trackList.map(item => (

                console.log("trackList----track", item['7pOQsB2wBvULZyu59THukt']),
                <Playlist playlist={item}/>
              ))}
            </>
          ) : (
            <AlbumList albums={albumlists.items} />
          )} */}
          {/* {viewtype === "grid" ? (
            <>
              {trackList.map(item => {
                const tracks = item[Object.keys(item)[0]].items; // Get the items from the track object
                return (
                  <div key={Object.keys(item)[0]}>
                    <h2 className="text-xl font-bold my-4">Tracks for Album {Object.keys(item)[0]}</h2>
                    {tracks.map(track => (
                      <div key={track.id} className="p-2 border-b">
                        <h3>{track.name}</h3>
                        <p>Duration: {track.duration_ms} ms</p>
                        <p>Artists: {track.artists.map(artist => artist.name).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ) : (
            <AlbumList albums={albumlists.items} />
          )} */}
          {/* //Tracks of Album name show */}
          {viewtype === "grid" ? (
            <div>
              {trackList.map(item => {
                const albumId = Object.keys(item)[0]; // Get the Album ID from the keys
                const albumData = item[albumId].tracks; // Get the data for that album using the album ID
                const tracksData = albumData?.items || []; // Access the tracks data
                const albumInfo = item[albumId].albumInfo || 'Untitled Album'; // Get the album name safely
                // const buttonClass =
                // song.track.id === this.props.songId && !this.props.songPaused
                //   ? "fa-pause-circle-o"
                //   : "fa-play-circle-o";
        
                return (
                  <div key={albumId}>
                    {/* <h2 className="text-3xl font-bold my-4">Tracks for Album: {albumName}</h2> */}
                    <Playlist playlist={albumInfo} />

                    {/* Filter, de-duplicate, and display the unique tracks */}
                    {(() => {
                      const seenTracks = new Set<string>(); // A Set to track seen track IDs

                      return tracksData
                        .filter(track => {
                          if (track.duration_ms < 120000) {
                            return false; // Skip tracks under 2 minutes
                          }
                          if (containsUnwantedKeywords(track.name)) {
                            return false; // Skip tracks with unwanted keywords
                          }
                          if (seenTracks.has(track.id)) {
                            return false; // Skip duplicate tracks
                          }
                          seenTracks.add(track.id); // Add to Set if unique
                          return true; // Keep this track
                        })
                        .map(track => (
                          <div key={track.id} className="p-2 flex items-center justify-between ">
                            <div className="flex items-center gap-2">
                              <div>
                                <div
                                
                                  onClick={() => {
                                    
                                  }}
                                  className="play-song"
                                >
                                  <BiPlayCircle size={36}/>
                                  <BiPauseCircle size={36} />
                                </div>
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{track.name}</h3>
                                <p>Artists: {track.artists.map(artist => artist.name).join(', ')}</p>

                              </div>
                            </div>
                            <p>{formatDuration(track.duration_ms)}</p>


                          </div>
                        ));
                    })()}
                  </div>
                );
              })}
            </div>
          ) : (
            <AlbumList albums={albumlists.items} />
          )}

        </>
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
    const [albumlists] = await Promise.all([
      customGet(
        "https://api.spotify.com/v1/artists/25mFVpuABa9GkGcj9eOPce/albums?limit=30",
        session
      ),
    ]);
    const trackList = [];
    for (const item of albumlists?.items || []) {
      const tracks = await customGet(
        `https://api.spotify.com/v1/albums/${item?.id}/tracks?limit=50`,
        session
      );
      // const trackObj = {}
      // trackObj[item.id] = item
      // trackObj[item.id].push(tracks) 
      const trackObj = {
        [item.id]: {
          albumInfo: item, // Store the album information
          tracks: tracks || [] // Store the array of tracks
        }
      };
      trackList.push(trackObj);
      // console.log("tracks===================", trackObj[item.id])
    }

    return {
      props: {
        albumlists: albumlists || { albums: { items: [] } },
        trackList: trackList || { tracks: { items: [] } },
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        albumlists: { albums: { items: [] } },
        trackList: { tracks: { items: [] } },
        // featuredalbumlists: { albumlists: { items: [] } }
      }
    };
  }
};
