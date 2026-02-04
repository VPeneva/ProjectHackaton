export const isInstitution = (req, res, next) => {
  if (!req.user || req.user.role !== "INSTITUTION") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};
