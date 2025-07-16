"use client";

import apiClient from "@/api/api";
import { RegisterForm, RegisterFormValues } from "@/components/register-form";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Background = () => (
  <>
    {/* Top gradient background */}
    <div
      aria-hidden="true"
      className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 min-h-screen"
    >
      <div
        style={{
          clipPath:
            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          background: `linear-gradient(to top right, oklch(0.596 0.145 163.225), oklch(0.6 0.118 184.704))`,
        }}
        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] min-h-screen"
      />
    </div>

    {/* Bottom gradient background */}
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] min-h-screen"
    >
      <div
        style={{
          clipPath:
            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          background: `linear-gradient(to top right, oklch(0.596 0.145 163.225), oklch(0.6 0.118 184.704))`,
        }}
        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] min-h-screen"
      />
    </div>
  </>
);

const ColoredOrbs = () => (
  <>
    <div
      className="w-[15rem] h-[15rem] absolute z-1 rounded-full bottom-0"
      style={{ background: "oklch(0.596 0.145 163.225)" }}
    ></div>
    <div
      className="w-[8rem] h-[5rem] absolute z-1 rounded-full bottom-0"
      style={{ background: "oklch(0.6 0.118 184.704)" }}
    ></div>
    <div
      className="w-[8rem] h-[5rem] absolute z-1 rounded-full bottom-0"
      style={{ background: "oklch(0.696 0.17 162.48)" }}
    ></div>
  </>
);

const StripedBackground = () => (
  <>
    <div className="w-full h-full z-2 absolute bg-linear-to-t from-transparent to-black"></div>
    <div className="flex absolute z-2  overflow-hidden backdrop-blur-2xl ">
      <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[oklch(0.596_0.145_163.225_/_0)] via-[oklch(0.21_0.006_285.885)] via-[69%] to-[oklch(0.6_0.118_184.704_/_0.3)] opacity-30 overflow-hidden"></div>
      <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[oklch(0.596_0.145_163.225_/_0)] via-[oklch(0.21_0.006_285.885)] via-[69%] to-[oklch(0.6_0.118_184.704_/_0.3)]  opacity-30 overflow-hidden"></div>
      <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[oklch(0.596_0.145_163.225_/_0)] via-[oklch(0.21_0.006_285.885)] via-[69%] to-[oklch(0.6_0.118_184.704_/_0.3)]  opacity-30 overflow-hidden"></div>
      <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[oklch(0.596_0.145_163.225_/_0)] via-[oklch(0.21_0.006_285.885)] via-[69%] to-[oklch(0.6_0.118_184.704_/_0.3)]  opacity-30 overflow-hidden"></div>
      <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[oklch(0.596_0.145_163.225_/_0)] via-[oklch(0.21_0.006_285.885)] via-[69%] to-[oklch(0.6_0.118_184.704_/_0.3)]  opacity-30 overflow-hidden"></div>
      <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[oklch(0.596_0.145_163.225_/_0)] via-[oklch(0.21_0.006_285.885)] via-[69%] to-[oklch(0.6_0.118_184.704_/_0.3)]  opacity-30 overflow-hidden"></div>
    </div>
  </>
);

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);

    try {
      await apiClient.post("/auth/register", values);
      toast.success("Registration successful!");
      router.push("/login");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        toast.error(err.response.data.error || "Registration failed.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-hidden relative">
      <Background />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-xl">
          <div className="w-full h-full z-2 absolute bg-gradient-to-t from-transparent to-black" />
          <StripedBackground />
          <ColoredOrbs />

          {/* Left side - Hero content */}
          <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-bl-3xl overflow-hidden">
            <h1 className="text-2xl md:text-3xl font-medium leading-tight z-10 tracking-tight relative">
              Crawl the web with efficiency and speed.
            </h1>
          </div>

          {/* Right side - Form */}
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
