import prisma from "../db/client.js";

// GET /admin/reports (all or filtered)
export const getAdminReports = async (req, res) => {
  const { institutionId } = req.query;

  try {
    const reports = await prisma.report.findMany({
      where: institutionId ? { institutionId: Number(institutionId) } : {},
      include: {
        user: true,
        category: true,
        institution: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed loading admin reports" });
  }
};

// PATCH /admin/reports/:id/send
export const sendReport = async (req, res) => {
  const { id } = req.params;
  const { institutionId } = req.body;

  try {
    const updated = await prisma.report.update({
      where: { id: Number(id) },
      data: { institutionId: Number(institutionId) },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed sending report" });
  }
};

// PATCH /admin/reports/:id/resolve
export const resolveReport = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await prisma.report.update({
      where: { id: Number(id) },
      data: { status: "Finished" },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error resolving report" });
  }
};
