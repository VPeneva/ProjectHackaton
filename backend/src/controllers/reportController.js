import prisma from "../db/client.js";

export const createReport = async (req, res) => {
  const { title, description, lat, lng, category } = req.body;
  const userId = req.user.id;

  try {
    const report = await prisma.report.create({
      data: { title, description, lat: parseFloat(lat), lng: parseFloat(lng), category, userId }
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to create report" });
  }
};
export const getReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: { user: true }
    });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};
