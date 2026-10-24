import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/dashboard/shell";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await requireUser("/dashboard/profile");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });

  return (
    <div className="max-w-2xl">
      <PageTitle title="Profile" description={`Member since ${formatDate(user.createdAt)} · ${user.email}`} />
      <ProfileForm
        defaults={{ name: user.name, phone: user.phone ?? "", matricNo: user.matricNo ?? "", department: user.department ?? "" }}
      />
    </div>
  );
}
