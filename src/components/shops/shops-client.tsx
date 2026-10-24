"use client";

import * as React from "react";
import { ShopExplorer, type ShopData } from "@/components/shops/shop-explorer";
import { ShopApplicationForm } from "@/components/shops/shop-application-form";
import type { Campus } from "@/lib/constants";

/** Connects the shop cards to the application form below them. */
export function ShopsClient({
  shops,
  initialCampus,
  signedIn,
  defaultPhone,
}: {
  shops: ShopData[];
  initialCampus: Campus;
  signedIn: boolean;
  defaultPhone?: string;
}) {
  const [selected, setSelected] = React.useState<ShopData | null>(null);
  const formRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <ShopExplorer
        shops={shops}
        initialCampus={initialCampus}
        onApply={(shop) => {
          setSelected(shop);
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
      <div className="mt-20">
        <ShopApplicationForm ref={formRef} shops={shops} signedIn={signedIn} selected={selected} defaultPhone={defaultPhone} />
      </div>
    </>
  );
}
