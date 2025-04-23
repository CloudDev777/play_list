import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { customGet } from "../../utils/customGet";
import { isAuthenticated } from "../../utils/isAuthenticated";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!(await isAuthenticated(session))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const playlists = await customGet(
      "https://api.spotify.com/v1/me/playlists?limit=50",
      session
    );
    
    if (!playlists?.items) {
      return res.status(404).json({ error: "No playlists found" });
    }

    return res.status(200).json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return res.status(500).json({ error: "Failed to fetch playlists" });
  }
}
