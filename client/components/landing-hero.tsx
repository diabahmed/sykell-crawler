"use client";

import { cn } from "@/lib/utils";
import { bricolageGrotesque } from "@/public/fonts/fonts";
import { ArrowRight } from "lucide-react";
import { StaticImageData } from "next/image";
import Link from "next/link";
import { BlurFade } from "./magicui/blur-fade";
import { GlowEffect } from "./motion-primitives/glow-effect";
import { TextEffect } from "./motion-primitives/text-effect";
import { Button } from "./ui/button";

interface NavigationItem {
  name: string;
  href: string;
}

interface AnnouncementBanner {
  text: string;
  linkText: string;
  linkHref: string;
}

interface CallToAction {
  text: string;
  href: string;
  variant: "primary" | "secondary";
}

interface HeroLandingProps {
  // Logo and branding
  logo?: {
    src: StaticImageData | string;
    alt: string;
    companyName: string;
  };

  // Navigation
  navigation?: NavigationItem[];
  loginText?: string;
  loginHref?: string;

  // Hero content
  title: string;
  description: string;
  announcementBanner?: AnnouncementBanner;
  callToActions?: CallToAction[];

  // Styling options
  titleSize?: "small" | "medium" | "large";
  gradientColors?: {
    from: string;
    to: string;
  };

  // Additional customization
  className?: string;
}

export function HeroLanding(props: HeroLandingProps) {
  const { title, description, callToActions, titleSize, className } = {
    ...props,
  };

  const getTitleSizeClasses = () => {
    switch (titleSize) {
      case "small":
        return "text-2xl sm:text-3xl md:text-5xl";
      case "medium":
        return "text-2xl sm:text-4xl md:text-6xl";
      case "large":
      default:
        return "text-3xl sm:text-5xl md:text-7xl";
    }
  };

  return (
    <div
      className={`min-h-screen w-screen overflow-x-hidden relative ${
        className || ""
      }`}
    >
      <div className="relative isolate px-6 pt-4 overflow-hidden min-h-screen flex flex-col justify-center">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <TextEffect
              preset="fade-in-blur"
              speedReveal={1.1}
              speedSegment={0.3}
              className={cn(
                bricolageGrotesque.className,
                `${getTitleSizeClasses()} font-semibold tracking-tight text-balance text-foreground`
              )}
            >
              {title}
            </TextEffect>
            <TextEffect
              per="word"
              preset="blur"
              speedReveal={1.2}
              speedSegment={0.8}
              className={cn(
                bricolageGrotesque.className,
                "mt-3 text-sm sm:text-lg text-pretty text-muted-foreground"
              )}
            >
              {description}
            </TextEffect>

            {/* Call to action buttons */}
            {callToActions && callToActions.length > 0 && (
              <div className="mt-9 flex items-center justify-center gap-x-4 sm:gap-x-6">
                {callToActions.map((cta, index) => (
                  <div key={index} className="relative group">
                    <BlurFade delay={0.7} inView>
                      {/* Base glow effect */}
                      <GlowEffect
                        colors={[
                          "oklch(0.552 0.016 285.938)", // muted-foreground
                          "oklch(0.705 0.015 286.067)", // muted-foreground dark
                          "oklch(0.871 0.006 286.286)", // input/ring
                          "oklch(0.92 0.004 286.32)", // border
                        ]}
                        mode="colorShift"
                        blur="soft"
                        duration={3}
                        scale={0.9}
                        className="opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                      />

                      {/* Hover glow effect */}
                      <GlowEffect
                        colors={[
                          "oklch(0.705 0.015 286.067)", // muted-foreground dark
                          "oklch(0.552 0.016 285.938)", // muted-foreground
                          "oklch(0.442 0.017 285.786)", // ring dark
                          "oklch(0.29 0.009 285.83)", // input dark
                        ]}
                        mode="pulse"
                        blur="medium"
                        duration={2}
                        scale={1.1}
                        className="opacity-0 group-hover:opacity-80 transition-opacity duration-300"
                      />
                      <Button
                        className="relative inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm text-zinc-50 outline outline-1 outline-[#fff2f21f] z-10 transition-all duration-300 group-hover:scale-105"
                        variant={
                          cta.variant === "primary" ? "default" : "outline"
                        }
                        asChild
                      >
                        <Link href={cta.href}>
                          {cta.text} <ArrowRight className="h4 w-4" />
                        </Link>
                      </Button>
                    </BlurFade>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
