import { Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/dashboard/shell";
import { MessageReadToggle } from "@/components/admin/user-row-actions";
import { Badge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMessages() {
  const messages = await prisma.contactMessage.findMany({ orderBy: [{ read: "asc" }, { createdAt: "desc" }] });

  return (
    <div>
      <PageTitle title="Messages" description="Enquiries from the contact form, including service and facility booking requests." />
      {messages.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <article key={m.id} className={cn("rounded-2xl border bg-card p-6", !m.read && "border-l-4 border-l-gold-500")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{m.subject}</h2>
                    <Badge variant="gold">{m.category}</Badge>
                    {!m.read && <Badge variant="info">New</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {m.name} · {formatDate(m.createdAt, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <MessageReadToggle id={m.id} read={m.read} />
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{m.message}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline dark:text-forest-300">
                  <Mail className="h-4 w-4" /> {m.email}
                </a>
                {m.phone && <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 text-muted-foreground"><Phone className="h-4 w-4" /> {m.phone}</a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
