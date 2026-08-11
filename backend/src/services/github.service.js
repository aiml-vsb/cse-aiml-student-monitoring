const axios = require("axios");
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
} = require("../config/env");

/**
 * Generate GitHub OAuth authorization URL
 * @param {string} state - Random state string (CSRF protection)
 * @returns {string}
 */
const getOAuthURL = (state) => {
  const base = "https://github.com/login/oauth/authorize";
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: "read:user user:email",
    state,
  });
  return `${base}?${params.toString()}`;
};

/**
 * Exchange OAuth code for an access token
 * @param {string} code
 * @returns {Promise<string>} Access token
 */
const exchangeCodeForToken = async (code) => {
  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const data = response.data;
    if (data.error) {
      throw new Error(data.error_description || "GitHub OAuth error");
    }
    return data.access_token;
  } catch (error) {
    console.error("❌ GitHub token exchange failed:", error.message);
    throw new Error("Failed to exchange GitHub code for token");
  }
};

/**
 * Fetch authenticated GitHub user profile
 * @param {string} accessToken
 * @returns {Promise<Object>} User data (id, login, name, email, avatar_url)
 */
const getGitHubUser = async (accessToken) => {
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const { id, login, name, email, avatar_url } = response.data;
    return { id, username: login, name, email, avatarUrl: avatar_url };
  } catch (error) {
    console.error("❌ GitHub user fetch failed:", error.message);
    throw new Error("Failed to fetch GitHub user");
  }
};

/**
 * Extract GitHub username from a profile URL (optional utility)
 * @param {string} url
 * @returns {string|null}
 */
const extractUsernameFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts.length > 0 ? parts[0] : null;
  } catch {
    return null;
  }
};

module.exports = {
  getOAuthURL,
  exchangeCodeForToken,
  getGitHubUser,
  extractUsernameFromUrl,
};