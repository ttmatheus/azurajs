'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const isEnglish = pathname?.includes("/docs/en");
  const isPortuguese = pathname?.includes("/docs/pt");

  if (!isEnglish && !isPortuguese) return null;

  const targetLang = isEnglish ? "pt" : "en";
  const targetPath = pathname?.replace(isEnglish ? "/en" : "/pt", `/${targetLang}`);
  const buttonText = isEnglish ? "🇧🇷 Ver em Português" : "🇺🇸 View in English";

  return (
    <Link
      href={targetPath || `/docs/${targetLang}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 border border-neutral-800"
    >
      {buttonText}
    </Link>
  );
}
