import { Link } from "@tanstack/react-router";
import logo from "@/assets/njaz-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label="نجاز — الصفحة الرئيسية">
      <img src={logo.url} alt="نجاز NJAZ" className="h-10 w-auto sm:h-12" width={180} height={90} />
    </Link>
  );
}
