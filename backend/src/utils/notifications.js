import prisma from "../db/client.js";

export const createNotification = async ({
  userId,
  title,
  body = null,
  type = "GENERAL",
  reportId = null,
}) => {
  if (!userId) return null;
  return prisma.notification.create({
    data: {
      userId,
      title,
      body,
      type,
      reportId: reportId || null,
    },
  });
};

export const createNotifications = async (notifications = []) => {
  const cleaned = notifications.filter((item) => item?.userId);
  if (!cleaned.length) return { count: 0 };
  return prisma.notification.createMany({
    data: cleaned.map((item) => ({
      userId: item.userId,
      title: item.title,
      body: item.body || null,
      type: item.type || "GENERAL",
      reportId: item.reportId || null,
    })),
  });
};

export const notifyAdmins = async ({ title, body = null, type = "ADMIN", reportId = null }) => {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (!admins.length) return { count: 0 };

  return prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title,
      body,
      type,
      reportId: reportId || null,
    })),
  });
};
