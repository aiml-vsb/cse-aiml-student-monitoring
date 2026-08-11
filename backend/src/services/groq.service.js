const Groq = require("groq-sdk");
const { GROQ_API_KEY } = require("../config/env");

const groq = new Groq({ apiKey: GROQ_API_KEY });

/**
 * Verify a LeetCode submission using AI (fallback).
 * @param {object} submissionInfo - Data about submission
 * @returns {Promise<{valid: boolean, reason?: string}>}
 */
const verifyCompletion = async (submissionInfo) => {
  try {
    // If we already verified via LeetCode API, skip AI call
    if (submissionInfo && submissionInfo.status === "Accepted") {
      return { valid: true, reason: "LeetCode API confirmed accepted submission" };
    }

    // Fallback prompt
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You verify if a student has completed a LeetCode challenge based on their submission data. Respond with 'yes' if completed, else 'no'.",
        },
        {
          role: "user",
          content: JSON.stringify(submissionInfo),
        },
      ],
    });

    const answer = response.choices?.[0]?.message?.content?.toLowerCase() || "";
    return { valid: answer.includes("yes") };
  } catch (err) {
    console.error("Groq verification error:", err.message);
    // Default to true if AI fails (to avoid blocking) – adjust based on trust
    return { valid: true };
  }
};

module.exports = { verifyCompletion };