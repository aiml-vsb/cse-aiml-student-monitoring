const axios = require("axios");

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";
const LEETCODE_API_ALL = "https://leetcode.com/api/problems/all/";

let problemsCache = null;
let cacheTime = 0;

const headers = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
  Referer: "https://leetcode.com/",
};

const getAllProblems = async () => {
  const now = Date.now();
  if (problemsCache && now - cacheTime < 60 * 60 * 1000) return problemsCache;

  try {
    const response = await axios.get(LEETCODE_API_ALL, { headers, timeout: 20000 });
    const pairs = response?.data?.stat_status_pairs || [];

    const map = {};
    for (const pair of pairs) {
      const num = pair.stat.frontend_question_id;
      map[num] = {
        number: num,
        title: pair.stat.question__title,
        slug: pair.stat.question__title_slug,
        difficulty: pair.difficulty?.level || 0,
      };
    }

    problemsCache = map;
    cacheTime = now;
    console.log(`[LeetCode] Loaded ${Object.keys(map).length} problems from cache.`);
    return map;
  } catch (err) {
    console.error("[LeetCode] Failed to fetch problem list:", err.message);
    return {};
  }
};

const getProblem = async (questionNumber) => {
  const all = await getAllProblems();
  const problem = all[questionNumber];

  if (!problem) {
    return {
      number: questionNumber,
      title: `Problem #${questionNumber}`,
      slug: `problem-${questionNumber}`,
      difficulty: "Unknown",
    };
  }

  return {
    number: problem.number,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
  };
};

const getRecentSubmissions = async (username) => {
  try {
    const query = `
      query getRecentSubmissions($username: String!) {
        recentSubmissionList(username: $username, limit: 20) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `;

    const response = await axios.post(
      LEETCODE_GRAPHQL,
      { query, variables: { username } },
      { headers, timeout: 20000 }
    );

    const subs = response?.data?.data?.recentSubmissionList || [];
    console.log(`[LeetCode] Response data:`, JSON.stringify(response?.data).slice(0, 500));
    console.log(`[LeetCode] Found ${subs.length} recent submissions for ${username}`);
    return subs;
  } catch (err) {
    console.error("[LeetCode] getRecentSubmissions error:", err.message);
    if (err.response) {
      console.error("[LeetCode] Response status:", err.response.status);
      console.error("[LeetCode] Response data:", JSON.stringify(err.response.data).slice(0, 500));
    }
    return [];
  }
};

const verifySubmission = async (username, questionNumber) => {
  const problem = await getProblem(questionNumber);
  console.log(`[LeetCode] Verifying user ${username} for problem #${questionNumber} (${problem.title})`);

  if (!problem || problem.slug.startsWith("problem-")) {
    return {
      verified: false,
      error: `Could not identify problem #${questionNumber} on LeetCode. Please try again later.`,
    };
  }

  const submissions = await getRecentSubmissions(username);

  // Strategy 1: Exact slug match
  let accepted = submissions.find(
    (s) => s.titleSlug === problem.slug && s.statusDisplay === "Accepted"
  );

  // Strategy 2: Title starts with "number." (e.g., "1. Two Sum")
  if (!accepted) {
    accepted = submissions.find(
      (s) =>
        s.statusDisplay === "Accepted" &&
        (s.title.startsWith(`${problem.number}. `) ||
          s.title.includes(`#${problem.number}`))
    );
  }

  // Strategy 3: Exact title match
  if (!accepted) {
    accepted = submissions.find(
      (s) => s.statusDisplay === "Accepted" && s.title === problem.title
    );
  }

  if (!accepted) {
    console.warn(`[LeetCode] No accepted submission found. Submitted titles:`, submissions.map(s => s.title).join(", "));
    return {
      verified: false,
      error: `No accepted submission found for "${problem.title}" (Problem #${questionNumber}). ` +
        `Make sure you've solved it on LeetCode and your profile is public.`,
    };
  }

  console.log(`[LeetCode] ✅ Verified: ${accepted.lang} submission found.`);
  return { verified: true, language: accepted.lang };
};

module.exports = {
  getProblem,
  getAllProblems,
  getRecentSubmissions,
  verifySubmission,
};