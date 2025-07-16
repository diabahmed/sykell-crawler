"use client";

import HeroWave from "@/components/dynamic-wave-canvas-background";
import { LandingHeader } from "@/components/landing-header";
import { HeroLanding } from "@/components/landing-hero";
import sykellLogo from "../public/sykell_logo.png";

export default function App() {
  return (
    <>
      <HeroWave />
      <LandingHeader
        logo={{
          src: sykellLogo,
          alt: "Sykell GmbH Logo",
          companyName: "Sykell GmbH",
        }}
        loginText="Login"
        loginHref="/login"
      />
      <HeroLanding
        title="Crawl the web."
        description="A highly efficient web crawler built in Go for the Sykell challenge."
        callToActions={[
          {
            text: "Get Started",
            href: "/register",
            variant: "primary",
          },
        ]}
        titleSize="medium"
      />
    </>
  );
}
