import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobDetailsClient } from "@/components/jobs/JobDetailsClient";

export const revalidate = 0;

interface JobPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;

  const job = await prisma.printJob.findUnique({
    where: { id },
  });

  if (!job) {
    notFound();
  }

  return <JobDetailsClient job={job} />;
}
