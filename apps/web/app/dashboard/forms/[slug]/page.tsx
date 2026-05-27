import { redirect } from "next/navigation";

export default async function FormIndex({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/dashboard/forms/${slug}/edit`);
}
