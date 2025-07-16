"use client";

import { cn } from "@/lib/utils";
import { bricolageGrotesque } from "@/public/fonts/fonts";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

interface LandingHeaderProps {
  logo?: {
    src: StaticImageData | string;
    alt: string;
    companyName: string;
  };
  loginText?: string;
  loginHref?: string;
}

export function LandingHeader({
  logo,
  loginText,
  loginHref,
}: LandingHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-6 z-50 mx-auto w-full max-w-screen-lg px-4">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-4 sm:p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">{logo?.companyName}</span>
            {logo && (
              <Image
                alt={logo.alt}
                src={logo.src}
                className="h-6 sm:h-8 w-auto filter invert brightness-0"
                width={60}
                height={60}
                priority
              />
            )}
          </Link>
        </div>
        {loginText && loginHref && (
          <div className="lg:flex lg:flex-1 lg:justify-end">
            <Link
              href={loginHref}
              className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <div
                className={cn(
                  bricolageGrotesque.className,
                  "relative after:absolute after:bg-primary after:bottom-0 after:left-0 after:h-px after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300"
                )}
              >
                {loginText}
              </div>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
