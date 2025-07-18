"use client";

import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar";
import { useAuthStore } from "@/store/auth-store";
import { RiLogoutBoxLine, RiSlowDownLine } from "@remixicon/react";
import { useRouter } from "next/navigation";

// This is sample data.
const data = {
  navMain: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: RiSlowDownLine,
          isActive: true,
        },
      ],
    },
  ],
};

function SidebarLogo() {
  const id = React.useId();
  return (
    <div className="flex gap-2 px-2 group-data-[collapsible=icon]:px-0 transition-[padding] duration-200 ease-in-out">
      <Link className="group/logo inline-flex" href="/">
        <span className="sr-only">Logo</span>
        <svg
          width="58"
          height="36"
          viewBox="0 0 58 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-9 group-data-[collapsible=icon]:size-8 transition-[width,height] duration-200 ease-in-out"
        >
          <path
            fill={`url(#${id})`}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20 18C20 19.1046 19.1046 20 18 20C16.8954 20 16 19.1046 16 18C16 16.8954 16.8954 16 18 16C19.1046 16 20 16.8954 20 18Z"
          ></path>
          <path
            fill={`url(#${id})`}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M42 18C42 19.1046 41.1046 20 40 20C38.8954 20 38 19.1046 38 18C38 16.8954 38.8954 16 40 16C41.1046 16 42 16.8954 42 18Z"
          ></path>
          <path
            fill={`url(#${id})`}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M40 2.0365e-06C40.676 2.1547e-06 41.3433 0.0372686 42 0.109859V2.12379C41.3448 2.04209 40.6773 2 40 2C36.4618 2 33.1937 3.14743 30.5447 5.09135C31.0263 5.55951 31.4819 6.0544 31.9089 6.57362C34.1936 4.95312 36.9866 4 40.0001 4C40.6791 4 41.3468 4.04834 42 4.14177V6.16591C41.3496 6.0568 40.6815 6 40.0001 6C37.4273 6 35.0454 6.80868 33.0921 8.18644C33.4572 8.74673 33.7919 9.3286 34.0939 9.92973C35.7486 8.71698 37.7913 8 40 8C40.685 8 41.3538 8.06886 42 8.20003V10.252C41.3608 10.0875 40.6906 10 40 10C38.0673 10 36.2962 10.6843 34.9131 11.8253C35.1679 12.5233 35.3809 13.2415 35.5487 13.9768C36.6467 12.7628 38.2343 12 40.0001 12C40.7013 12 41.3745 12.1203 42 12.3414V14.5351C41.4117 14.1948 40.7286 14 40.0001 14C37.7909 14 36.0001 15.7909 36.0001 18C36.0001 20.2091 37.7909 22 40.0001 22C42.2092 22 44.0001 20.2091 44.0001 18L44 17.9791V0.446033C52.016 2.26495 58.0001 9.43365 58.0001 18C58.0001 27.9411 49.9412 36 40.0001 36C35.8576 36 32.0419 34.6006 29 32.2488C25.9583 34.6002 22.1414 36 18 36C17.324 36 16.6567 35.9627 16 35.8901V33.8762C16.6552 33.9579 17.3227 34 18 34C21.5383 34 24.8064 32.8525 27.4554 30.9086C26.9738 30.4405 26.5182 29.9456 26.0912 29.4264C23.8065 31.0469 21.0135 32 18.0001 32C17.321 32 16.6532 31.9517 16 31.8582V29.8341C16.6504 29.9432 17.3186 30 18.0001 30C20.5729 30 22.9548 29.1913 24.908 27.8136C24.543 27.2533 24.2082 26.6714 23.9062 26.0703C22.2515 27.283 20.2088 28 18.0001 28C17.3151 28 16.6462 27.9311 16 27.7999V25.7479C16.6393 25.9125 17.3094 26 18.0001 26C19.9328 26 21.7039 25.3157 23.0871 24.1747C22.8322 23.4767 22.6193 22.7585 22.4514 22.0232C21.3534 23.2372 19.7658 24 18.0001 24C17.2988 24 16.6256 23.8797 16 23.6586V21.4648C16.5884 21.8052 17.2715 22 18.0001 22C20.2092 22 22.0001 20.2091 22.0001 18C22.0001 15.7909 20.2092 14 18.0001 14C15.7909 14 14.0001 15.7909 14.0001 18L14 35.554C5.98405 33.7351 0 26.5663 0 18C0 8.05887 8.05893 0 18.0001 0C22.1425 0 25.9582 1.39934 29.0001 3.75111C32.0417 1.3998 35.8585 0 40 2.0365e-06ZM46 3.16303V5.34723C50.7299 7.59414 54.0001 12.4152 54.0001 18C54.0001 25.732 47.732 32 40.0001 32C32.2681 32 26.0001 25.732 26.0001 18C26.0001 13.5817 22.4183 10 18.0001 10C13.5818 10 10.0001 13.5817 10.0001 18C10.0001 20.0289 10.7553 21.8814 12.0001 23.2916V18C12.0001 14.6863 14.6863 12 18.0001 12C21.3138 12 24.0001 14.6863 24.0001 18C24.0001 26.8366 31.1635 34 40.0001 34C48.8366 34 56 26.8366 56 18C56 11.2852 51.8637 5.53658 46 3.16303ZM12.0001 26.0007L12 28.3946C8.41322 26.3197 6.00005 22.4417 6.00005 18C6.00005 11.3726 11.3726 6 18.0001 6C24.6275 6 30.0001 11.3726 30.0001 18C30.0001 23.5228 34.4772 28 40.0001 28C45.5229 28 50.0001 23.5228 50.0001 18C50 14.7284 48.4289 11.8237 46.0001 9.99929V7.60538C49.5869 9.68023 52.0001 13.5583 52.0001 18C52.0001 24.6274 46.6275 30 40.0001 30C33.3726 30 28.0001 24.6274 28.0001 18C28.0001 12.4772 23.5229 8 18.0001 8C12.4772 8 8.00007 12.4772 8.00007 18C8.00007 21.2716 9.57117 24.1763 12.0001 26.0007ZM4.00005 18C4.00005 23.5848 7.27013 28.4058 12 30.6527V32.837C6.13636 30.4634 2.00005 24.7148 2.00005 18C2.00005 9.16344 9.1635 2 18.0001 2C26.8366 2 34.0001 9.16344 34.0001 18C34.0001 21.3137 36.6863 24 40.0001 24C43.3138 24 46.0001 21.3137 46.0001 18L46.0001 12.7084C47.2448 14.1186 48 15.9711 48.0001 18C48.0001 22.4183 44.4183 26 40.0001 26C35.5818 26 32.0001 22.4183 32.0001 18C32.0001 10.268 25.732 4 18.0001 4C10.2681 4 4.00005 10.268 4.00005 18Z"
          ></path>
          <defs>
            <linearGradient
              id={id}
              x1="18"
              x2="18"
              y1="2"
              y2="34"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#F4F4F5" />
              <stop offset="1" stopColor="#A1A1AA" />
            </linearGradient>
          </defs>
        </svg>
      </Link>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="h-16 max-md:mt-2 mb-2 justify-center">
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className="-mt-2">
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/65">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button group-data-[collapsible=icon]:px-[5px]! font-medium gap-3 h-9 [&>svg]:size-auto"
                      tooltip={item.title}
                      isActive={item.isActive}
                    >
                      <a href={item.url}>
                        {item.icon && (
                          <item.icon
                            className="text-muted-foreground/65 group-data-[active=true]/menu-button:text-primary"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-t border-border mx-2 -mt-px" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
            >
              <RiLogoutBoxLine
                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                size={22}
                aria-hidden="true"
              />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
