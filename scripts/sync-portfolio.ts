import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { projectsData } from "../src/data/projects";
import { ProjectCategory } from "@prisma/client";

async function main() {
  console.log("Syncing 5 real portfolio projects to Neon database...");

  // Delete previous dummy projects
  await prisma.portfolioProject.deleteMany({
    where: {
      slug: {
        notIn: projectsData.map((p) => p.slug),
      },
    },
  });

  for (const p of projectsData) {
    await prisma.portfolioProject.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        category: p.category as ProjectCategory,
        clientName: p.clientName,
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl,
        coverImage: p.coverImage,
        images: p.images,
        technologies: p.technologies,
        challenge: p.challenge,
        solution: p.solution,
        features: p.features,
        sampleMetrics: p.sampleMetrics,
        sortOrder: p.sortOrder,
        isFeatured: p.isFeatured,
        isPublished: p.isPublished,
      },
      create: {
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        category: p.category as ProjectCategory,
        clientName: p.clientName,
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl,
        coverImage: p.coverImage,
        images: p.images,
        technologies: p.technologies,
        challenge: p.challenge,
        solution: p.solution,
        features: p.features,
        sampleMetrics: p.sampleMetrics,
        sortOrder: p.sortOrder,
        isFeatured: p.isFeatured,
        isPublished: p.isPublished,
      },
    });
  }

  const count = await prisma.portfolioProject.count();
  console.log(`✓ Neon DB PortfolioProject count: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
