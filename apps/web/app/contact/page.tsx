"use client";

import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";
import { PublicShell } from "@/components/shared/public-site";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = String(formData.get("subject") || "Lumiqs inquiry");
    const body = [`Name: ${formData.get("name") || ""}`, `Email: ${formData.get("email") || ""}`, "", String(formData.get("message") || "")].join("\n");
    window.location.href = `mailto:support@lumiqs.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }
  return <PublicShell><main className="mx-auto grid max-w-7xl gap-16 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-28"><section><p className="text-xs font-semibold uppercase tracking-[.22em] text-indigo-300">Contact Lumiqs</p><h1 className="mt-5 text-5xl font-semibold tracking-tight text-white">Bring us the question behind the question.</h1><p className="mt-6 max-w-md text-lg leading-8 text-slate-400">Talk to us about product access, partnerships, support, or the decision workflow you are trying to improve.</p><a href="mailto:support@lumiqs.ai" className="mt-8 inline-flex items-center gap-3 text-sm text-indigo-200 hover:text-white"><Mail className="h-4 w-4" /> support@lumiqs.ai</a></section><section className="border border-white/10 bg-white/[.025] p-6 md:p-8">{sent ? <div className="py-16 text-center"><Send className="mx-auto h-8 w-8 text-indigo-300" /><h2 className="mt-5 text-xl font-semibold text-white">Your message is ready</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">Your email client should open with the details. If it did not, email support@lumiqs.ai directly.</p><a href="mailto:support@lumiqs.ai" className="mt-6 inline-flex rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white">Open email</a></div> : <form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm text-slate-400">Name<input required name="name" className="mt-2 w-full border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400" /></label><label className="text-sm text-slate-400">Email<input required type="email" name="email" className="mt-2 w-full border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400" /></label></div><label className="block text-sm text-slate-400">Subject<input required name="subject" className="mt-2 w-full border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400" /></label><label className="block text-sm text-slate-400">Message<textarea required name="message" rows={6} className="mt-2 w-full resize-y border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400" /></label><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400">Open email draft <Send className="h-4 w-4" /></button></form>}</section></main></PublicShell>;
}
