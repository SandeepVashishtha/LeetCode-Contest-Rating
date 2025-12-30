let cachedRating = null;
let cachedAt = null;

export default async function handler(req, res) {
  const username = req.query.username || "vsandeep_11";   
  const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

  // Serve from cache
  if (cachedRating !== null && cachedAt && Date.now() - cachedAt < CACHE_TIME) {
    return res.redirect(
      `https://img.shields.io/badge/Contest%20Rating-${encodeURIComponent(
        cachedRating
      )}-blue?style=flat-square`
    );
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const json = await response.json();

    const rating =
      json?.data?.userContestRanking?.rating !== null &&
      json?.data?.userContestRanking?.rating !== undefined
        ? Math.round(json.data.userContestRanking.rating)
        : "inaccessible";

    // Cache the result
    cachedRating = rating;
    cachedAt = Date.now();

    return res.redirect(
      `https://img.shields.io/badge/Contest%20Rating-${encodeURIComponent(
        rating
      )}-blue?style=flat-square`
    );
  } catch (err) {
    return res.redirect(
      "https://img.shields.io/badge/Contest%20Rating-inaccessible-lightgrey?style=flat-square"
    );
  }
}
