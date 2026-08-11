const leetcodeService = require("../src/services/leetcode.service");

async function main() {
  const [username, problemNumber] = process.argv.slice(2);

  if (!username || !problemNumber) {
    console.log("Usage: node scripts/test-leetcode.js <leetcodeUsername> <problemNumber>");
    process.exit(1);
  }

  console.log(`Testing LeetCode verification for ${username} on problem #${problemNumber}`);
  const result = await leetcodeService.verifySubmission(username, parseInt(problemNumber));
  console.log("Result:", result);
}

main().finally(() => process.exit());