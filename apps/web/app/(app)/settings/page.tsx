"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-white mb-8">Settings</h1>
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              {user?.imageUrl && <img src={user.imageUrl} alt="Avatar" className="w-12 h-12 rounded-full" />}
              <div>
                <p className="font-medium text-white">{user?.fullName || "—"}</p>
                <p className="text-sm text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Manage your account settings through Clerk.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
