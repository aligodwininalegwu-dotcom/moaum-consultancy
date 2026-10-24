"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Maximize2, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { CAMPUS_LABEL, SHOP_CATEGORIES, type Campus } from "@/lib/constants";
import { cn, formatNaira } from "@/lib/utils";

export type ShopData = {
  id: string;
  code: string;
  campus: string;
  block: string;
  location: string;
  category: string;
  sizeSqm: number;
  annualRent: number;
  status: string;
  features: string[];
  description: string;
};

export function ShopExplorer({
  shops,
  initialCampus,
  onApply,
}: {
  shops: ShopData[];
  initialCampus: Campus;
  onApply: (shop: ShopData) => void;
}) {
  const [campus, setCampus] = React.useState<Campus>(initialCampus);
  const [category, setCategory] = React.useState<string>("All");
  const [onlyAvailable, setOnlyAvailable] = React.useState(false);

  return (
    <Tabs value={campus} onValueChange={(v) => setCampus(v as Campus)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
          {(["WESTERN", "EASTERN"] as const).map((c) => {
            const available = shops.filter((s) => s.campus === c && s.status === "AVAILABLE").length;
            return (
              <TabsTrigger key={c} value={c} className="min-w-0 px-2 text-xs sm:px-4 sm:text-sm">
                {CAMPUS_LABEL[c]}
                <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[11px] text-gold-700 dark:text-gold-300">{available}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...SHOP_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                category === c ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40 hover:bg-secondary",
              )}
            >
              {c}
            </button>
          ))}
          <label className="ml-1 flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
            <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="h-4 w-4 accent-[#0A4D3C]" />
            Available only
          </label>
        </div>
      </div>

      {(["WESTERN", "EASTERN"] as const).map((c) => {
        const list = shops.filter(
          (s) => s.campus === c && (category === "All" || s.category === category) && (!onlyAvailable || s.status === "AVAILABLE"),
        );
        return (
          <TabsContent key={c} value={c}>
            <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {list.map((shop, i) => (
                  <motion.article
                    key={shop.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.04 } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    className="group flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg hover:shadow-forest-900/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-semibold tracking-wider text-gold-700 dark:text-gold-400">{shop.code}</p>
                        <h3 className="mt-1 font-semibold">{shop.category}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {shop.block} · {shop.location}
                        </p>
                      </div>
                      <StatusBadge status={shop.status} />
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{shop.description}</p>
                    <div className="mt-4 flex gap-4 text-sm">
                      <span className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5 text-muted-foreground" /> {shop.sizeSqm} m²</span>
                      <span className="flex items-center gap-1.5 font-semibold"><Wallet className="h-3.5 w-3.5 text-muted-foreground" /> {formatNaira(shop.annualRent)}<span className="font-normal text-muted-foreground">/yr</span></span>
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {shop.features.map((f) => (
                        <li key={f} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                          <Check className="h-3 w-3 text-forest-500" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-5">
                      <Button
                        className="w-full"
                        variant={shop.status === "AVAILABLE" ? "default" : "secondary"}
                        disabled={shop.status !== "AVAILABLE"}
                        onClick={() => onApply(shop)}
                      >
                        {shop.status === "AVAILABLE" ? "Apply for this shop" : "Not available"}
                      </Button>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
            {list.length === 0 && (
              <p className="rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                No shops match these filters on the {CAMPUS_LABEL[c]}.
              </p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
