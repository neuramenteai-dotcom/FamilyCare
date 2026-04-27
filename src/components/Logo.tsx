import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`} aria-label="CareTinder home">
      <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-soft group-hover:scale-105 transition-transform">
        <Heart className="h-5 w-5 fill-current" strokeWidth={2.5} />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        Care<span className="text-primary">Tinder</span>
      </span>
    </Link>
  );
}
