export default function ChallengeHistory({ challenges }) {
  if (!challenges || challenges.length === 0) {
    return <p className="text-dark-400 text-sm py-4">No past challenges.</p>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className={`p-3 rounded-lg border ${
            challenge.status === "COMPLETED"
              ? "bg-green-500/5 border-green-500/20"
              : challenge.status === "NOT_COMPLETED"
                ? "bg-red-500/5 border-red-500/20"
                : "bg-yellow-500/5 border-yellow-500/20"
          }`}
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="text-sm font-medium text-white">
                #{challenge.leetcodeNumber} · {challenge.leetcodeTitle}
              </div>
              <div className="text-[10px] text-dark-400 mt-1">
                {new Date(challenge.startTime).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right shrink-0">
              {challenge.status === "COMPLETED" ? (
                <span className="text-[10px] text-green-400 font-medium">✓ Done</span>
              ) : challenge.status === "NOT_COMPLETED" ? (
                <span className="text-[10px] text-red-400 font-medium">✗ Missed</span>
              ) : (
                <span className="text-[10px] text-yellow-400 font-medium">Pending</span>
              )}
              {challenge.language && (
                <div className="text-[10px] text-dark-400">{challenge.language}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
