let cachedData = null;
let cachedAt = null;

export default async function handler(req, res) {
  const username = req.query.username || "sandeepvashishtha";
  const type = req.query.type || "rating"; // "rating" or "rank"
  const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

  // Serve from cache if valid
  if (cachedData && cachedAt && Date.now() - cachedAt < CACHE_TIME) {
    return redirectBadge(res, cachedData, type);
  }

  try {
    const query = `
      query getContestData($username: String!) {
        userContestRanking(username: $username) {
          rating
          globalRanking
          attendedContestsCount
        }
      }
    `;

    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com"
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const json = await response.json();
    const rankingData = json?.data?.userContestRanking;

    let rating = "Unrated";
    let rank = "Unrated";

    if (rankingData) {
      if (rankingData.rating !== null && rankingData.rating !== undefined) {
        rating = Math.round(rankingData.rating);
      }

      if (
        rankingData.globalRanking !== null &&
        rankingData.globalRanking !== undefined
      ) {
        rank = rankingData.globalRanking;
      }
    }

    const finalData = { rating, rank };

    // Cache result
    cachedData = finalData;
    cachedAt = Date.now();

    return redirectBadge(res, finalData, type);

  } catch (error) {
    return res.redirect(
      "https://img.shields.io/badge/Contest%20Data-inaccessible-lightgrey?style=flat-square"
    );
  }
}

// Helper function to generate badge
function redirectBadge(res, data, type) {
  if (type === "rank") {
    return res.redirect(
      `https://img.shields.io/badge/Global%20Rank-${encodeURIComponent(
        data.rank
      )}-orange?style=flat-square`
    );
  }

  // Default: rating
  return res.redirect(
    `https://img.shields.io/badge/Contest%20Rating-${encodeURIComponent(
      data.rating
    )}-blue?style=flat-square`
  );
}
