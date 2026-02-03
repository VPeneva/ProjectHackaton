import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.report.deleteMany();
  await prisma.category.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data");

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@admin.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN"
    }
  });
  console.log("Created admin:", admin.email);

  // Create regular user
  const user = await prisma.user.create({
    data: {
      email: "user@user.com",
      password: userPassword,
      name: "Regular User",
      role: "USER"
    }
  });
  console.log("Created user:", user.email);

  // Create institutions
  const institutions = await Promise.all([
    prisma.institution.create({ data: { name: "Roads & Infrastructure" } }),
    prisma.institution.create({ data: { name: "Parks & Recreation" } }),
    prisma.institution.create({ data: { name: "Water & Utilities" } }),
    prisma.institution.create({ data: { name: "Public Safety" } }),
  ]);
  console.log("Created", institutions.length, "institutions");

  // Create categories for each institution
  const categories = await Promise.all([
    // Roads & Infrastructure
    prisma.category.create({ data: { name: "Potholes", institutionId: institutions[0].id } }),
    prisma.category.create({ data: { name: "Street Lights", institutionId: institutions[0].id } }),
    prisma.category.create({ data: { name: "Traffic Signs", institutionId: institutions[0].id } }),
    // Parks & Recreation
    prisma.category.create({ data: { name: "Playground Equipment", institutionId: institutions[1].id } }),
    prisma.category.create({ data: { name: "Park Maintenance", institutionId: institutions[1].id } }),
    // Water & Utilities
    prisma.category.create({ data: { name: "Water Leak", institutionId: institutions[2].id } }),
    prisma.category.create({ data: { name: "Sewer Issue", institutionId: institutions[2].id } }),
    // Public Safety
    prisma.category.create({ data: { name: "Broken Sidewalk", institutionId: institutions[3].id } }),
    prisma.category.create({ data: { name: "Graffiti", institutionId: institutions[3].id } }),
  ]);
  console.log("Created", categories.length, "categories");

  // Sofia, Bulgaria coordinates for realistic locations
  const locations = [
    { lat: 42.6977, lng: 23.3219, address: "Sofia City Center" },
    { lat: 42.6953, lng: 23.3300, address: "Vitosha Boulevard" },
    { lat: 42.7000, lng: 23.3150, address: "NDK Area" },
    { lat: 42.6850, lng: 23.3180, address: "South Park" },
    { lat: 42.7100, lng: 23.3250, address: "Central Railway Station" },
    { lat: 42.6920, lng: 23.3400, address: "Mladost District" },
    { lat: 42.7050, lng: 23.3100, address: "Lions Bridge" },
    { lat: 42.6880, lng: 23.3350, address: "Paradise Mall Area" },
  ];

  // Create reports for regular user
  const userReports = [
    {
      title: "Large pothole on main street",
      description: "There's a dangerous pothole that has been getting bigger over the past month. Several cars have already damaged their tires.",
      status: "Pending",
      categoryId: categories[0].id, // Potholes
      institutionId: null,
      ...locations[0]
    },
    {
      title: "Street light not working",
      description: "The street light has been out for two weeks. The area is very dark at night and feels unsafe.",
      status: "Sent",
      categoryId: categories[1].id, // Street Lights
      institutionId: institutions[0].id,
      ...locations[1]
    },
    {
      title: "Broken swing in children's playground",
      description: "One of the swings in the playground is broken and poses a safety hazard for children.",
      status: "Pending",
      categoryId: categories[3].id, // Playground Equipment
      institutionId: null,
      ...locations[3]
    },
    {
      title: "Water leak on sidewalk",
      description: "There's been water leaking from somewhere underground for days. It's creating a puddle and wasting water.",
      status: "Finished",
      categoryId: categories[5].id, // Water Leak
      institutionId: institutions[2].id,
      ...locations[2]
    },
  ];

  // Create reports for admin user
  const adminReports = [
    {
      title: "Missing stop sign at intersection",
      description: "The stop sign at this intersection was knocked down and hasn't been replaced. Very dangerous for drivers.",
      status: "Pending",
      categoryId: categories[2].id, // Traffic Signs
      institutionId: null,
      ...locations[4]
    },
    {
      title: "Park benches need repair",
      description: "Several benches in the park have broken slats and need to be repaired or replaced.",
      status: "Sent",
      categoryId: categories[4].id, // Park Maintenance
      institutionId: institutions[1].id,
      ...locations[5]
    },
    {
      title: "Sewer smell in residential area",
      description: "There's a strong sewer smell coming from the drain on this street. It's been ongoing for a week.",
      status: "Sent",
      categoryId: categories[6].id, // Sewer Issue
      institutionId: institutions[2].id,
      ...locations[6]
    },
    {
      title: "Cracked sidewalk near school",
      description: "The sidewalk near the elementary school has large cracks that are tripping hazards for children.",
      status: "Finished",
      categoryId: categories[7].id, // Broken Sidewalk
      institutionId: institutions[3].id,
      ...locations[7]
    },
    {
      title: "Graffiti on public building",
      description: "Vandals have spray painted graffiti on the side of the community center. Needs cleaning.",
      status: "Pending",
      categoryId: categories[8].id, // Graffiti
      institutionId: null,
      ...locations[0]
    },
  ];

  // Insert user reports
  const createdUserReports = [];
  for (const report of userReports) {
    const created = await prisma.report.create({
      data: {
        ...report,
        userId: user.id,
      }
    });
    createdUserReports.push(created);
  }
  console.log("Created", createdUserReports.length, "reports for regular user");

  // Insert admin reports
  const createdAdminReports = [];
  for (const report of adminReports) {
    const created = await prisma.report.create({
      data: {
        ...report,
        userId: admin.id,
      }
    });
    createdAdminReports.push(created);
  }
  console.log("Created", createdAdminReports.length, "reports for admin user");

  // Add some votes to make it realistic
  const allReports = [...createdUserReports, ...createdAdminReports];

  // Admin votes on user's reports
  for (let i = 0; i < createdUserReports.length; i++) {
    await prisma.vote.create({
      data: {
        type: i % 2 === 0 ? "UP" : "DOWN",
        userId: admin.id,
        reportId: createdUserReports[i].id,
      }
    });
  }

  // User votes on admin's reports
  for (let i = 0; i < createdAdminReports.length; i++) {
    await prisma.vote.create({
      data: {
        type: i % 3 !== 0 ? "UP" : "DOWN",
        userId: user.id,
        reportId: createdAdminReports[i].id,
      }
    });
  }
  console.log("Created votes for reports");

  // Create some contact messages
  await prisma.contactMessage.createMany({
    data: [
      {
        name: "John Doe",
        email: "john@example.com",
        message: "Great app! I've been able to report several issues in my neighborhood.",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        message: "How long does it typically take for reports to be addressed?",
      },
      {
        name: "Bob Wilson",
        email: "bob@example.com",
        message: "I'd like to volunteer to help with community cleanup efforts.",
      },
    ]
  });
  console.log("Created contact messages");

  // Create sample conversations
  const conversation1 = await prisma.conversation.create({
    data: {
      subject: "Question about report status",
      status: "Open",
      userId: user.id,
      messages: {
        create: [
          {
            content: "Hi, I submitted a report about a pothole last week and wanted to check on its status. When can I expect it to be addressed?",
            senderId: user.id,
            isFromAdmin: false,
          },
          {
            content: "Hello! Thank you for reaching out. I can see your report has been received and is currently being reviewed by our team. We typically process reports within 5-7 business days.",
            senderId: admin.id,
            isFromAdmin: true,
          },
          {
            content: "That's great to hear! Will I receive a notification when it's been addressed?",
            senderId: user.id,
            isFromAdmin: false,
          },
        ]
      }
    }
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      subject: "How to upload photos to reports",
      status: "Closed",
      userId: user.id,
      messages: {
        create: [
          {
            content: "I'm having trouble uploading photos to my reports. The button doesn't seem to work on my phone.",
            senderId: user.id,
            isFromAdmin: false,
          },
          {
            content: "I'm sorry to hear you're having trouble! Could you tell me what browser you're using? Some older browsers may have compatibility issues.",
            senderId: admin.id,
            isFromAdmin: true,
          },
          {
            content: "I'm using Safari on my iPhone.",
            senderId: user.id,
            isFromAdmin: false,
          },
          {
            content: "Thank you for that information. We've identified and fixed the issue with Safari. Please try again and let us know if you're still experiencing problems!",
            senderId: admin.id,
            isFromAdmin: true,
          },
          {
            content: "It works now! Thank you so much for the quick fix!",
            senderId: user.id,
            isFromAdmin: false,
          },
        ]
      }
    }
  });

  const conversation3 = await prisma.conversation.create({
    data: {
      subject: "Suggestion for new feature",
      status: "Open",
      userId: user.id,
      messages: {
        create: [
          {
            content: "I love the app! I have a suggestion - it would be great if we could track the progress of reports on a timeline. That way we could see when each step happened.",
            senderId: user.id,
            isFromAdmin: false,
          },
        ]
      }
    }
  });

  console.log("Created", 3, "conversations with messages");

  console.log("\n========================================");
  console.log("Seed completed successfully!");
  console.log("========================================");
  console.log("\nTest Accounts:");
  console.log("  Admin: admin@admin.com / admin123");
  console.log("  User:  user@user.com / user123");
  console.log("\nCreated:");
  console.log("  - 2 users (1 admin, 1 regular)");
  console.log("  - 4 institutions");
  console.log("  - 9 categories");
  console.log("  - 9 reports (4 by user, 5 by admin)");
  console.log("  - Multiple votes");
  console.log("  - 3 contact messages");
  console.log("  - 3 conversations with messages");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
