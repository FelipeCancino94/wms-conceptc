"use client";

import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ChartPieIcon, DocumentChartBarIcon, PresentationChartLineIcon, ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import InfoAppVersion from "../InfoAppVersion/InfoAppVersion";
import { signOut, useSession } from "next-auth/react";

export default function AppHeader() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between px-4 py-2 app-header">
      <div className="flex flex-col items-center justify-center">
        <Image src="/concept-c-logo.webp" alt="logo" width={150} height={60} />
        <InfoAppVersion />
      </div>
      <nav>
        <ul className="flex items-center justify-center gap-4">
          <li className="px-4 py-2">
            <Link href="/" className="px-4 py-2">Gestion d&apos;entrepôt</Link>
          </li>
          <li className="px-4 py-2">
            <Link href="/replenishment-lists" className="px-4 py-2">Listes de réapprovisionnement</Link>
          </li>
          <li className="hidden px-4 py-2">
            <Link href="/warehouses" className="hidden px-4 py-2">Warehouses</Link>
          </li>
          <li className="px-4 py-2">
            <Link href="/map-bin" className="px-4 py-2">Suivi d&apos;occupation des bins</Link>
          </li>
          <li className="px-4 py-2">
            <HoverCard openDelay={10}>
              <HoverCardTrigger className="flex items-center justify-around gap-1">
                Rapports
                <ChevronDownIcon className="size-4 text-[rgb(var(--color-base))]" />
              </HoverCardTrigger>
              <HoverCardContent className="w-full">
                <ul className="flex flex-col sub-menu">
                  <li className="hover:bg-[rgba(var(--color-base),0.3)] flex items-center justify-start rounded-lg transition-all p-2">
                    <div className="p-2 border rounded-lg icon border-[rgb(var(--color-base))]">
                      <ChartPieIcon className="size-6 text-[rgb(var(--color-base))]" />
                    </div>
                    <Link href="/upsell-stats" className="px-4 py-2">Statistiques de l&apos;app Upsell</Link>
                  </li>
                  <li className="hover:bg-[rgba(var(--color-base),0.3)] flex items-center justify-start rounded-lg transition-all p-2">
                    <div className="p-2 border rounded-lg icon border-[rgb(var(--color-base))]">
                      <DocumentChartBarIcon className="size-6 text-[rgb(var(--color-base))]" />
                    </div>
                    <Link href="/exports" className="px-4 py-2">Exportation des données</Link>
                  </li>
                  <li className="hover:bg-[rgba(var(--color-base),0.3)] flex items-center justify-start rounded-lg transition-all p-2">
                    <div className="p-2 border rounded-lg icon border-[rgb(var(--color-base))]">
                      <PresentationChartLineIcon className="size-6 text-[rgb(var(--color-base))]" />
                    </div>
                    <Link href="/skusavvy" className="px-4 py-2">Rapports de Skusavvy</Link>
                  </li>
                </ul>
              </HoverCardContent>
            </HoverCard>
          </li>
        </ul>
      </nav>
      <div className="flex">
        {
          session
            ? <button
                type="button"
                onClick={() => signOut({ redirectTo: "/" })}
                className="c-hover cursor-pointer link text-[rgb(var(--color-text-primary))] flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
              >
                Se déconnecter
                <UserCircleIcon className="size-6 text-[rgb(var(--color-base))]" />
              </button>
            : <Link href="/login" className="c-hover cursor-pointer link text-[rgb(var(--color-text-primary))] flex items-center justify-center gap-2 px-4 py-2 rounded-lg">
                Connexion
                <UserCircleIcon className="size-6 text-[rgb(var(--color-base))]" />
              </Link>
        }
      </div>
    </div>
  )
}