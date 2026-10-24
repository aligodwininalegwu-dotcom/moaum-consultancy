"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
import { saveShop, setShopStatus, type ShopInput } from "@/server/admin-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { CAMPUS_LABEL, CAMPUSES, SHOP_CATEGORIES, SHOP_STATUSES, STATUS_LABEL } from "@/lib/constants";

const blank: ShopInput = {
  code: "",
  campus: "WESTERN",
  block: "",
  location: "",
  category: "Retail",
  sizeSqm: 12,
  annualRent: 250000,
  status: "AVAILABLE",
  features: "Electricity (prepaid meter)",
  description: "",
};

/** Add / edit dialog for the shops register. */
export function ShopEditor({ shop }: { shop?: ShopInput & { id: string } }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<ShopInput>(shop ?? blank);
  const [pending, startTransition] = React.useTransition();
  const set = (k: keyof ShopInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setValues(shop ?? blank); }}>
      <DialogTrigger asChild>
        {shop ? (
          <Button size="icon" variant="ghost" aria-label={`Edit ${shop.code}`}><Pencil /></Button>
        ) : (
          <Button><Plus /> Add shop</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{shop ? `Edit shop ${shop.code}` : "Add a shop"}</DialogTitle>
        </DialogHeader>
        <form method="post"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const res = await saveShop({ ...values, id: shop?.id });
              if (res.ok) {
                toast.success(res.message);
                setOpen(false);
                router.refresh();
              } else toast.error(res.error);
            });
          }}
        >
          <Field label="Code" htmlFor="code" hint="WC-/EC- + block letter + number">
            <Input id="code" value={values.code} onChange={set("code")} placeholder="WC-A04" />
          </Field>
          <Field label="Campus" htmlFor="campus">
            <NativeSelect id="campus" value={values.campus} onChange={set("campus")}>
              {CAMPUSES.map((c) => <option key={c} value={c}>{CAMPUS_LABEL[c]}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Block" htmlFor="block"><Input id="block" value={values.block} onChange={set("block")} /></Field>
          <Field label="Location" htmlFor="location"><Input id="location" value={values.location} onChange={set("location")} /></Field>
          <Field label="Category" htmlFor="category">
            <NativeSelect id="category" value={values.category} onChange={set("category")}>
              {SHOP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Status" htmlFor="status">
            <NativeSelect id="status" value={values.status} onChange={set("status")}>
              {SHOP_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Size (m²)" htmlFor="sizeSqm"><Input id="sizeSqm" type="number" step="0.5" value={values.sizeSqm as number} onChange={set("sizeSqm")} /></Field>
          <Field label="Annual rent (₦)" htmlFor="annualRent"><Input id="annualRent" type="number" step="1000" value={values.annualRent as number} onChange={set("annualRent")} /></Field>
          <Field label="Features" htmlFor="features" hint="Comma-separated" className="sm:col-span-2">
            <Input id="features" value={values.features} onChange={set("features")} />
          </Field>
          <Field label="Description" htmlFor="description" className="sm:col-span-2">
            <Textarea id="description" rows={3} value={values.description} onChange={set("description")} />
          </Field>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save shop</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Inline status changer for a row in the shops table. */
export function ShopStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  return (
    <NativeSelect
      aria-label="Shop status"
      className="h-9 w-40 text-xs"
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          const res = await setShopStatus(id, e.target.value);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      {SHOP_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
    </NativeSelect>
  );
}
