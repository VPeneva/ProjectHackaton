export const POINT_RULES = Object.freeze({
  report: 10,
  resolved: 20,
  comment: 3,
  vote: 1,
});

export const computePoints = (stats = {}) => {
  const reports = stats.reports || 0;
  const resolved = stats.resolved || 0;
  const comments = stats.comments || 0;
  const votes = stats.votes || 0;

  return (
    reports * POINT_RULES.report +
    resolved * POINT_RULES.resolved +
    comments * POINT_RULES.comment +
    votes * POINT_RULES.vote
  );
};

export const computeWeight = (points = 0) => {
  if (points >= 300) return 1.5;
  if (points >= 200) return 1.3;
  if (points >= 100) return 1.2;
  if (points >= 50) return 1.1;
  return 1;
};

export const computeBadges = (stats = {}, points = 0) => {
  const badges = [];
  const reports = stats.reports || 0;
  const resolved = stats.resolved || 0;
  const comments = stats.comments || 0;
  const votes = stats.votes || 0;

  if (reports >= 5) {
    badges.push({
      key: "active_reporter",
      label: "Active Reporter",
      description: "Submitted 5+ reports",
    });
  }

  if (resolved >= 3) {
    badges.push({
      key: "verified_reporter",
      label: "Verified Reporter",
      description: "Resolved 3+ reports",
    });
  }

  if (comments >= 10) {
    badges.push({
      key: "community_helper",
      label: "Community Helper",
      description: "Posted 10+ helpful comments",
    });
  }

  if (votes >= 20) {
    badges.push({
      key: "voice_of_city",
      label: "Voice of the City",
      description: "Cast 20+ votes",
    });
  }

  if (points >= 200) {
    badges.push({
      key: "top_contributor",
      label: "Top Contributor",
      description: "Earned 200+ points",
    });
  }

  return badges;
};

const buildCountMap = (rows = []) => {
  const map = new Map();
  for (const row of rows) {
    map.set(row.userId, row._count?._all || 0);
  }
  return map;
};

export const getUserStatsMap = async (prisma, userIds = []) => {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (!uniqueIds.length) return new Map();

  const [reportCounts, resolvedCounts, commentCounts, voteCounts] = await Promise.all([
    prisma.report.groupBy({
      by: ["userId"],
      where: { userId: { in: uniqueIds } },
      _count: { _all: true },
    }),
    prisma.report.groupBy({
      by: ["userId"],
      where: { userId: { in: uniqueIds }, status: "Finished" },
      _count: { _all: true },
    }),
    prisma.comment.groupBy({
      by: ["userId"],
      where: { userId: { in: uniqueIds } },
      _count: { _all: true },
    }),
    prisma.vote.groupBy({
      by: ["userId"],
      where: { userId: { in: uniqueIds } },
      _count: { _all: true },
    }),
  ]);

  const reportMap = buildCountMap(reportCounts);
  const resolvedMap = buildCountMap(resolvedCounts);
  const commentMap = buildCountMap(commentCounts);
  const voteMap = buildCountMap(voteCounts);

  const statsMap = new Map();
  for (const userId of uniqueIds) {
    const stats = {
      reports: reportMap.get(userId) || 0,
      resolved: resolvedMap.get(userId) || 0,
      comments: commentMap.get(userId) || 0,
      votes: voteMap.get(userId) || 0,
    };
    const points = computePoints(stats);
    statsMap.set(userId, {
      stats,
      points,
      badges: computeBadges(stats, points),
      weight: computeWeight(points),
    });
  }

  return statsMap;
};
