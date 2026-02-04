export const VOTE_EXPIRATION_DAYS = parseInt(
  process.env.VOTE_EXPIRATION_DAYS || "180",
  10
);

export const getVoteCutoff = () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - VOTE_EXPIRATION_DAYS);
  return cutoff;
};
