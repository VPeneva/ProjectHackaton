import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { sanitizeText } from "../utils/sanitize.js";
import { createNotifications } from "../utils/notifications.js";
import { getVoteCutoff } from "../utils/votes.js";

const router = express.Router();
const DUPLICATE_LOOKBACK_DAYS = 30;
const DUPLICATE_COORD_THRESHOLD = 0.0005;

const normalizeText = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const tokenizeText = (value) =>
  normalizeText(value)
    .split(" ")
    .filter((word) => word.length > 2);

const computeSimilarityScore = (baseReport, candidate) => {
  const baseTokens = new Set(
    tokenizeText(`${baseReport.title} ${baseReport.description || ""} ${baseReport.address || ""}`)
  );
  if (baseTokens.size === 0) return 0;

  const candidateTokens = new Set(
    tokenizeText(`${candidate.title} ${candidate.description || ""} ${candidate.address || ""}`)
  );

  let overlap = 0;
  baseTokens.forEach((token) => {
    if (candidateTokens.has(token)) overlap += 1;
  });

  const sameCategory =
    baseReport.categoryId && candidate.categoryId === baseReport.categoryId ? 3 : 0;
  const sameInstitution =
    baseReport.institutionId && candidate.institutionId === baseReport.institutionId ? 2 : 0;

  let proximity = 0;
  if (
    baseReport.lat !== null &&
    baseReport.lng !== null &&
    candidate.lat !== null &&
    candidate.lng !== null
  ) {
    const latDiff = Math.abs(baseReport.lat - candidate.lat);
    const lngDiff = Math.abs(baseReport.lng - candidate.lng);
    if (latDiff <= 0.01 && lngDiff <= 0.01) proximity = 2;
  }

  return overlap + sameCategory + sameInstitution + proximity;
};

const addVoteCounts = async (reports = []) => {
  if (!reports.length) return reports;

  const reportIds = reports.map((report) => report.id);
  const voteCutoff = getVoteCutoff();
  const groupedVotes = await prisma.vote.groupBy({
    by: ["reportId", "type"],
    where: { reportId: { in: reportIds }, createdAt: { gte: voteCutoff } },
    _count: { _all: true },
  });

  const countsByReport = new Map();
  for (const row of groupedVotes) {
    const current = countsByReport.get(row.reportId) || { upvotes: 0, downvotes: 0 };
    if (row.type === "UP") current.upvotes = row._count._all;
    if (row.type === "DOWN") current.downvotes = row._count._all;
    countsByReport.set(row.reportId, current);
  }

  return reports.map((report) => {
    const counts = countsByReport.get(report.id) || { upvotes: 0, downvotes: 0 };
    return { ...report, ...counts };
  });
};

/**
 * GET всички репорти
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 20, max 100)
 *   - mine: if "true", filter to authenticated user's reports only
 *   - status: filter by status (Pending, Sent, Finished)
 *   - institutionId: filter by institution
 *   - categoryId: filter by category
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      mine,
      status,
      institutionId,
      categoryId,
      search,
      dateFrom,
      dateTo,
      sort,
      nearLat,
      nearLng,
      radiusKm,
      hasLocation,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    // Filter by user's own reports (requires auth token in header)
    if (mine === "true") {
      // Try to get user from token if provided
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const jwt = await import("jsonwebtoken");
          const token = authHeader.split(" ")[1];
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "secret");
          where.userId = decoded.id;
        } catch {
          // Invalid token, ignore mine filter
        }
      }
    }

    // Filter by status
    if (status && ["Pending", "Sent", "Finished"].includes(status)) {
      where.status = status;
    }

    // Filter by institution
    if (institutionId) {
      where.institutionId = Number(institutionId);
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (dateFrom || dateTo) {
      const createdAt = {};
      if (dateFrom) {
        const parsed = new Date(dateFrom);
        if (!Number.isNaN(parsed.getTime())) createdAt.gte = parsed;
      }
      if (dateTo) {
        const parsed = new Date(dateTo);
        if (!Number.isNaN(parsed.getTime())) {
          parsed.setHours(23, 59, 59, 999);
          createdAt.lte = parsed;
        }
      }
      if (Object.keys(createdAt).length) {
        where.createdAt = createdAt;
      }
    }

    const latFilter = {};
    const lngFilter = {};

    if (hasLocation === "true") {
      latFilter.not = null;
      lngFilter.not = null;
    }

    const nearLatNum = parseFloat(nearLat);
    const nearLngNum = parseFloat(nearLng);
    const radiusNum = parseFloat(radiusKm);

    if (
      !Number.isNaN(nearLatNum) &&
      !Number.isNaN(nearLngNum) &&
      !Number.isNaN(radiusNum) &&
      radiusNum > 0 &&
      nearLatNum >= -90 &&
      nearLatNum <= 90 &&
      nearLngNum >= -180 &&
      nearLngNum <= 180
    ) {
      const latDelta = radiusNum / 111; // approx km per degree latitude
      const lngDelta = radiusNum / (111 * Math.cos((nearLatNum * Math.PI) / 180));
      latFilter.gte = nearLatNum - latDelta;
      latFilter.lte = nearLatNum + latDelta;
      lngFilter.gte = nearLngNum - lngDelta;
      lngFilter.lte = nearLngNum + lngDelta;
      latFilter.not = null;
      lngFilter.not = null;
    }

    if (Object.keys(latFilter).length) where.lat = latFilter;
    if (Object.keys(lngFilter).length) where.lng = lngFilter;

    // Get total count for pagination
    const total = await prisma.report.count({ where });

    const sortValue = (sort || "newest").toString().toLowerCase();
    let orderBy = { createdAt: "desc" };
    if (sortValue === "oldest") orderBy = { createdAt: "asc" };
    if (sortValue === "most-voted") orderBy = { votes: { _count: "desc" } };

    const reports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        institution: true,
        category: true,
        images: { orderBy: { createdAt: "asc" } },
      },
      orderBy,
      skip,
      take: limitNum,
    });

    const reportsWithVotes = await addVoteCounts(reports);

    res.json({
      data: reportsWithVotes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

/**
 * POST създаване на репорт (задължително логнат)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      imageUrls,
      images,
      categoryId,
      lat,
      lng,
      institutionId,
      address,
      location,
    } = req.body;

    const sanitizedTitle = sanitizeText(title);
    const sanitizedDescription = description ? sanitizeText(description) : null;
    const sanitizedAddress = sanitizeText(address ?? location);
    const addressValue = sanitizedAddress || null;

    // Задължителни полета
    if (!sanitizedTitle || !categoryId || !institutionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const categoryIdNum = Number(categoryId);
    const institutionIdNum = Number(institutionId);
    if (Number.isNaN(categoryIdNum) || Number.isNaN(institutionIdNum)) {
      return res.status(400).json({ error: "Invalid category or institution" });
    }

    const latProvided = lat !== undefined && lat !== null && lat !== "";
    const lngProvided = lng !== undefined && lng !== null && lng !== "";
    let latNum = null;
    let lngNum = null;

    if (latProvided || lngProvided) {
      if (!latProvided || !lngProvided) {
        return res.status(400).json({ error: "Both latitude and longitude are required" });
      }
      latNum = parseFloat(lat);
      lngNum = parseFloat(lng);
      if (
        isNaN(latNum) ||
        isNaN(lngNum) ||
        latNum < -90 ||
        latNum > 90 ||
        lngNum < -180 ||
        lngNum > 180
      ) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
    }

    const normalizedTitle = normalizeText(sanitizedTitle);
    const normalizedAddress = normalizeText(addressValue);
    const hasLocationInfo = normalizedAddress || (latNum !== null && lngNum !== null);

    const rawImageUrls = []
      .concat(Array.isArray(imageUrls) ? imageUrls : [])
      .concat(Array.isArray(images) ? images : [])
      .concat(imageUrl ? [imageUrl] : []);
    const cleanedImageUrls = rawImageUrls
      .map((url) => (url ? url.toString().trim() : ""))
      .filter(Boolean)
      .filter((url, idx, arr) => arr.indexOf(url) === idx);

    if (hasLocationInfo) {
      const lookbackDate = new Date(
        Date.now() - DUPLICATE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
      );

      const candidates = await prisma.report.findMany({
        where: {
          status: { in: ["Pending", "Sent"] },
          institutionId: institutionIdNum,
          categoryId: categoryIdNum,
          createdAt: { gte: lookbackDate },
        },
        select: {
          id: true,
          title: true,
          address: true,
          lat: true,
          lng: true,
        },
      });

      const isDuplicate = candidates.some((candidate) => {
        if (normalizeText(candidate.title) !== normalizedTitle) return false;

        const addressMatch =
          normalizedAddress &&
          candidate.address &&
          normalizeText(candidate.address) === normalizedAddress;

        const coordMatch =
          latNum !== null &&
          lngNum !== null &&
          candidate.lat !== null &&
          candidate.lng !== null &&
          Math.abs(candidate.lat - latNum) <= DUPLICATE_COORD_THRESHOLD &&
          Math.abs(candidate.lng - lngNum) <= DUPLICATE_COORD_THRESHOLD;

        return addressMatch || coordMatch;
      });

      if (isDuplicate) {
        return res.status(409).json({
          error: "A similar report already exists in this area. Consider upvoting it instead.",
        });
      }
    }

    const report = await prisma.report.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription || null,
        imageUrl: cleanedImageUrls[0] || imageUrl || null,
        lat: latNum,
        lng: lngNum,
        address: addressValue,
        categoryId: categoryIdNum,
        institutionId: institutionIdNum,
        userId: req.user.id,
        images:
          cleanedImageUrls.length > 0
            ? {
                create: cleanedImageUrls.map((url) => ({ url })),
              }
            : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        institution: true,
        category: true,
        images: { orderBy: { createdAt: "asc" } },
      },
    });

    res.json(report);
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ error: "Failed to create report" });
  }
});

// Static routes MUST come BEFORE /:id to avoid being caught by the param route

// GET /api/reports/active
router.get("/active", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: {
          in: ["Sent", "Pending"],
        },
      },
      include: {
        institution: true,
        category: true,
        images: { orderBy: { createdAt: "asc" } },
      },
    });

    res.json(reports);
  } catch (err) {
    console.error("Error loading active reports:", err);
    res.status(500).json({ error: "Failed to load active reports" });
  }
});

// GET /api/reports/map
router.get("/map", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: { in: ["Pending", "Sent"] },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        institution: true,
        category: true,
        images: { orderBy: { createdAt: "asc" } },
        _count: {
          select: { comments: true, subscriptions: true },
        },
      },
    });

    res.json(reports);
  } catch (err) {
    console.error("MAP ERROR:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// GET /api/reports/stats
// If authenticated, returns user-specific stats. Otherwise, returns global stats.
router.get("/stats", async (req, res) => {
  try {
    // Try to get user from token if provided
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = await import("jsonwebtoken");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "secret");
        userId = decoded.id;
      } catch {
        // Invalid token, return global stats
      }
    }

    const where = userId ? { userId } : {};

    const total = await prisma.report.count({ where });
    const pending = await prisma.report.count({ where: { ...where, status: "Pending" } });
    const sent = await prisma.report.count({ where: { ...where, status: "Sent" } });
    const finished = await prisma.report.count({ where: { ...where, status: "Finished" } });

    res.json({
      total,
      byStatus: {
        PENDING: pending,
        SENT: sent,
        FINISHED: finished,
      },
      // Keep old format for backward compatibility
      pending,
      sent,
      finished,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

/**
 * GET /api/reports/:id/similar
 * Returns similar reports based on category, institution, text overlap, and proximity.
 */
router.get("/:id/similar", async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (Number.isNaN(reportId)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 4));

    const baseReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        categoryId: true,
        institutionId: true,
      },
    });

    if (!baseReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    const orFilters = [];
    if (baseReport.categoryId) {
      orFilters.push({ categoryId: baseReport.categoryId });
    }
    if (baseReport.institutionId) {
      orFilters.push({ institutionId: baseReport.institutionId });
    }

    const addressTokens = tokenizeText(baseReport.address).slice(0, 3);
    addressTokens.forEach((token) => {
      orFilters.push({ address: { contains: token, mode: "insensitive" } });
    });

    const candidates = await prisma.report.findMany({
      where: {
        id: { not: reportId },
        ...(orFilters.length ? { OR: orFilters } : {}),
      },
      include: {
        institution: true,
        category: true,
        images: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    const scored = candidates
      .map((candidate) => ({
        report: candidate,
        score: computeSimilarityScore(baseReport, candidate),
      }))
      .filter((item) => item.score > 0 || !orFilters.length)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.report.createdAt) - new Date(a.report.createdAt);
      })
      .slice(0, limit)
      .map((item) => item.report);

    const scoredWithVotes = await addVoteCounts(scored);

    res.json(scoredWithVotes);
  } catch (err) {
    console.error("Error fetching similar reports:", err);
    res.status(500).json({ error: "Failed to load similar reports" });
  }
});

/**
 * PATCH update report (owner/admin, pending only)
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (Number.isNaN(reportId)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (report.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to edit this report" });
    }

    if (report.status !== "Pending") {
      return res.status(400).json({ error: "Only pending reports can be edited" });
    }

    const {
      title,
      description,
      imageUrl,
      imageUrls,
      images,
      categoryId,
      institutionId,
      address,
      lat,
      lng,
    } = req.body;

    const data = {};

    if (title !== undefined) {
      const sanitizedTitle = sanitizeText(title);
      if (!sanitizedTitle) {
        return res.status(400).json({ error: "Title cannot be empty" });
      }
      data.title = sanitizedTitle;
    }

    if (description !== undefined) {
      if (description === null) {
        data.description = null;
      } else {
        const sanitizedDescription = sanitizeText(description);
        data.description = sanitizedDescription ? sanitizedDescription : null;
      }
    }

    const hasImageUrlArray = Array.isArray(imageUrls) || Array.isArray(images);
    const hasImageUrlValue = imageUrl !== undefined;
    let nextImageUrls = null;

    if (hasImageUrlArray || hasImageUrlValue) {
      const rawImageUrls = []
        .concat(Array.isArray(imageUrls) ? imageUrls : [])
        .concat(Array.isArray(images) ? images : [])
        .concat(imageUrl ? [imageUrl] : []);

      nextImageUrls = rawImageUrls
        .map((url) => (url ? url.toString().trim() : ""))
        .filter(Boolean)
        .filter((url, idx, arr) => arr.indexOf(url) === idx);

      data.imageUrl = nextImageUrls[0] || null;
    }

    if (address !== undefined) {
      if (address === null) {
        data.address = null;
      } else {
        const sanitizedAddress = sanitizeText(address);
        data.address = sanitizedAddress ? sanitizedAddress : null;
      }
    }

    if (categoryId !== undefined) {
      const parsed = Number(categoryId);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ error: "Invalid category" });
      }
      data.categoryId = parsed;
    }

    if (institutionId !== undefined) {
      const parsed = Number(institutionId);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ error: "Invalid institution" });
      }
      data.institutionId = parsed;
    }

    const latProvided = lat !== undefined;
    const lngProvided = lng !== undefined;

    if (latProvided || lngProvided) {
      const latEmpty = lat === null || lat === "";
      const lngEmpty = lng === null || lng === "";

      if (latEmpty || lngEmpty) {
        if (latEmpty && lngEmpty) {
          data.lat = null;
          data.lng = null;
        } else {
          return res.status(400).json({ error: "Both latitude and longitude are required" });
        }
      } else {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        if (Number.isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
          return res.status(400).json({ error: "Invalid latitude" });
        }
        if (Number.isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
          return res.status(400).json({ error: "Invalid longitude" });
        }
        data.lat = parsedLat;
        data.lng = parsedLng;
      }
    }

    if (!Object.keys(data).length && nextImageUrls === null) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) {
        await tx.report.update({
          where: { id: reportId },
          data,
        });
      }

      if (nextImageUrls !== null) {
        await tx.reportImage.deleteMany({
          where: { reportId },
        });

        if (nextImageUrls.length > 0) {
          await tx.reportImage.createMany({
            data: nextImageUrls.map((url) => ({ reportId, url })),
          });
        }
      }

      return tx.report.findUnique({
        where: { id: reportId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
            },
          },
          institution: true,
          category: true,
          images: { orderBy: { createdAt: "asc" } },
        },
      });
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating report:", err);
    res.status(500).json({ error: "Failed to update report" });
  }
});

/**
 * GET comments for a report
 */
router.get("/:id/comments", async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (Number.isNaN(reportId)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    const comments = await prisma.comment.findMany({
      where: { reportId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

/**
 * POST create a comment on a report (auth required)
 */
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (Number.isNaN(reportId)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    const { content } = req.body;
    const sanitizedContent = sanitizeText(content);
    if (!sanitizedContent) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, title: true, userId: true, institutionId: true },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (req.user.role === "INSTITUTION") {
      let institutionId = req.user.institutionId;
      if (!institutionId) {
        const institutionUser = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { institutionId: true },
        });
        institutionId = institutionUser?.institutionId || null;
      }

      if (!institutionId || report.institutionId !== institutionId) {
        return res
          .status(403)
          .json({ error: "Institutions can only respond to their own reports" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        reportId,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    const subscriptionUsers = await prisma.subscription.findMany({
      where: { reportId },
      select: { userId: true },
    });

    const recipientIds = new Set(
      subscriptionUsers.map((sub) => sub.userId)
    );

    if (report.userId && report.userId !== req.user.id) {
      recipientIds.add(report.userId);
    }

    recipientIds.delete(req.user.id);

    const notifications = Array.from(recipientIds).map((userId) => ({
      userId,
      title: "New comment on a report",
      body: report.title,
      type: "COMMENT",
      reportId,
    }));

    await createNotifications(notifications);

    res.json(comment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

/**
 * DELETE comment (owner/admin)
 */
router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const commentId = Number(req.params.commentId);
    if (Number.isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

/**
 * GET subscription status for a report (auth)
 */
router.get("/:id/subscription", authMiddleware, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (Number.isNaN(reportId)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_reportId: {
          userId: req.user.id,
          reportId,
        },
      },
    });

    res.json({ subscribed: !!subscription });
  } catch (err) {
    console.error("Error loading subscription:", err);
    res.status(500).json({ error: "Failed to load subscription" });
  }
});

/**
 * POST subscribe to report (auth)
 */
router.post("/:id/subscribe", authMiddleware, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (Number.isNaN(reportId)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    await prisma.subscription.upsert({
      where: {
        userId_reportId: {
          userId: req.user.id,
          reportId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        reportId,
      },
    });

    res.json({ subscribed: true });
  } catch (err) {
    console.error("Error subscribing to report:", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

/**
 * DELETE unsubscribe from report (auth)
 */
router.delete("/:id/subscribe", authMiddleware, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (Number.isNaN(reportId)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    await prisma.subscription.deleteMany({
      where: {
        userId: req.user.id,
        reportId,
      },
    });

    res.json({ subscribed: false });
  } catch (err) {
    console.error("Error unsubscribing from report:", err);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

/**
 * GET репорт по ID - This MUST come AFTER all static routes
 */
router.get("/:id", async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        institution: true,
        category: true,
      },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const voteCutoff = getVoteCutoff();
    const [upvotes, downvotes] = await Promise.all([
      prisma.vote.count({
        where: { reportId: report.id, type: "UP", createdAt: { gte: voteCutoff } },
      }),
      prisma.vote.count({
        where: { reportId: report.id, type: "DOWN", createdAt: { gte: voteCutoff } },
      }),
    ]);

    res.json({
      ...report,
      upvotes,
      downvotes,
      commentsCount: report._count?.comments ?? 0,
      subscriptionsCount: report._count?.subscriptions ?? 0,
    });
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

/**
 * DELETE репорт (само собственикът може да изтрие)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Check ownership
    if (report.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this report" });
    }

    await prisma.report.delete({
      where: { id: reportId },
    });

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;
