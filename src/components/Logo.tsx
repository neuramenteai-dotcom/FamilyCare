import { Link } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 group ${className}`} aria-label="Family Care home">
      <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-soft group-hover:scale-105 transition-transform">
        <HeartHandshake className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight leading-none">
        Family<span className="text-primary"> Care</span>
      </span>
    </Link>
  );
}
