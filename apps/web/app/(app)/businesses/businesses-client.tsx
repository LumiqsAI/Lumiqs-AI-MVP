"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Plus, ArrowRight, Globe, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Business } from "@/types";
import { STAGE_LABELS, formatDate } from "@/lib/utils";

export function BusinessesClient({ initialBusinesses }: { initialBusinesses: Business[] }) {
  return (
    <div className="w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 xl:mx-0 2xl:mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Businesses</h1>
          <p className="text-slate-400 mt-1">Manage your business workspaces.</p>
        </div>
        <Link href="/businesses/new">
          <Button><Plus className="h-4 w-4" /> New Business</Button>
        </Link>
      </div>

      {!initialBusinesses.length ? (
        <div className="text-center py-24">
          <Building2 className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-2">No businesses yet</h2>
          <p className="text-slate-400 mb-6">Create your first business workspace to get started.</p>
          <Link href="/businesses/new"><Button size="lg">Create Business</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialBusinesses.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:border-white/15 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                        {b.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{b.name}</h3>
                        <p className="text-xs text-slate-500">{formatDate(b.createdAt)}</p>
                      </div>
                    </div>
                    <Badge variant="info">{STAGE_LABELS[b.stage]}</Badge>
                  </div>

                  {b.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{b.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    {b.industry && (
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{b.industry}</span>
                    )}
                    {b.country && (
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{b.country}</span>
                    )}
                    {b.teamSize && (
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{b.teamSize}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/businesses/${b.id}/ai`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        Open <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/businesses/${b.id}/settings`}>
                      <Button variant="outline" size="sm">Settings</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
