function isDeadlineExpired(endTime) {
  return new Date(endTime).getTime() < Date.now();
}

export default function ChallengeHistory({ challenges }) {
  if (!challenges || challenges.length === 0) {
    return <p className="text-dark-400 text-xs py-4 text-center font-medium">No past challenge records found.</p>;
  }

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="space-y-2.5">
        {challenges.map((challenge) => {
          const isExpired = isDeadlineExpired(challenge.endTime);
          const displayStatus =
            challenge.status === "COMPLETED"
              ? "COMPLETED"
              : challenge.status === "NOT_COMPLETED" && isExpired
              ? "MISSED"
              : "PENDING";

          return (
            <div
              key={challenge.id}
              className={`p-3 rounded-xl transition-all ${
                displayStatus === "COMPLETED"
                  ? "bg-[#e0e5ec] shadow-neu-flat-sm border-l-4 border-l-emerald-500"
                  : displayStatus === "MISSED"
                  ? "bg-[#e0e5ec] shadow-neu-flat-sm border-l-4 border-l-red-500"
                  : "bg-[#e0e5ec] shadow-neu-flat-sm border-l-4 border-l-amber-500"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-xs font-bold text-dark-800 line-clamp-1">
                    #{challenge.leetcodeNumber} · {challenge.leetcodeTitle}
                  </div>
                  <div className="text-[10px] font-medium text-dark-400 mt-0.5">
                    {new Date(challenge.startTime).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {displayStatus === "COMPLETED" ? (
                    <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md">✓ Done</span>
                  ) : displayStatus === "MISSED" ? (
                    <span className="text-[10px] text-red-600 font-extrabold bg-red-500/10 px-2 py-0.5 rounded-md">✗ Missed</span>
                  ) : (
                    <span className="text-[10px] text-amber-700 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-md">Pending</span>
                  )}
                  {challenge.language && (
                    <div className="text-[9px] font-semibold text-dark-400 mt-1 uppercase tracking-wider">{challenge.language}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
