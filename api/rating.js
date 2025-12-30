// Cached values stored in memory
let cachedRating = null;
let cachedAt = null;

import fetch from "node-fetch";

export default async function handler(req, res) {
  const username = req.query.username || "vsandeep_11"; // default username
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // If cached and still fresh → return cached badge
  if (cachedRating !== null && cachedAt && Date.now() - cachedAt < CACHE_DURATION) {
    const cachedBadge = `https://img.shields.io/badge/Contest%20Rating-${encodeURIComponent(
      cachedRating
    )}-blue?style=flat-square`;
    return res.redirect(cachedBadge);
  }

  try {
    const query = `
      query getContestRating($username: String!) {
        userContestRanking(username: $username) {
          rating
        }
      }
    `;

    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const data = await response.json();
    const rating =
      data?.data?.userContestRanking?.rating !== null
        ? Math.round(data.data.userContestRanking.rating)
        : "inaccessible";

    // Save to cache
    cachedRating = rating;
    cachedAt = Date.now();

    // Generate badge
    const badgeUrl = `https://img.shields.io/badge/Contest%20Rating-${encodeURIComponent(
      rating
    )}-blue?style=flat-square`;

    return res.redirect(badgeUrl);
  } catch (error) {
    return res.redirect(
      "https://img.shields.io/badge/Contest%20Rating-inaccessible-lightgrey?style=flat-square"
    );
  }
}
