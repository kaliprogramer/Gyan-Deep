"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/hooks/lib/utils";

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
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";

import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileText,
  User,
  Settings,
  ChevronDown,
  LogOut,
  Users,
  GraduationCap,
} from "lucide-react";

import {
  getMe,
  logout,
} from "@/hooks/lib/api/auth";

const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Assignments",
    url: "/assignments",
    icon: ClipboardCheck,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: FileText,
  },
  {
    title: "Classmates",
    url: "/classmates",
    icon: Users,
  },
  {
    title: "Teachers",
    url: "/teachers",
    icon: GraduationCap,
  },
];


const courses = [
  {
    title: "Physics",
    url: "/courses/physics",
  },
  {
    title: "Math",
    url: "/courses/math",
  },
  {
    title: "English",
    url: "/courses/english",
  },
  {
    title: "Programming in C",
    url: "/courses/programming-c",
  },
  {
    title: "Information Technology",
    url: "/courses/information-technology",
  },
];

const personalItems = [
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [coursesOpen, setCoursesOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // ========================================
  // FETCH USER
  // ========================================

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getMe();

        console.log("Current user:", userData);

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await logout();

      // Redirect to login
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);

      // Even if the backend logout fails,
      // send the user back to login.
      window.location.href = "/auth/login";
    } finally {
      setLoggingOut(false);
    }
  };

  // ========================================
  // USER DISPLAY DATA
  // ========================================

  const username = user?.username || "User";

  const firstLetter = username
    .trim()
    .charAt(0)
    .toUpperCase();

  const profilePicture = user?.profile_picture;

  const role = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Student";

  const email = user?.email || "Loading...";

  return (
    <Sidebar collapsible="icon">

      {/* ========================================
          HEADER
      ======================================== */}

      <SidebarHeader className="px-0">
        <div
          className="
            flex
            h-[76px]
            items-center
            gap-3
            px-5

            group-data-[collapsible=icon]:justify-center
            group-data-[collapsible=icon]:px-0
          "
        >

          {/* Logo */}

          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              overflow-hidden

              group-data-[collapsible=icon]:h-9
              group-data-[collapsible=icon]:w-9
            "
          >
            <Image
              src="/Logo.png"
              alt="Gyan-Deep Logo"
              width={80}
              height={80}
              priority
              className="
                h-14
                w-14
                object-contain
                scale-[1.35]

                group-data-[collapsible=icon]:h-9
                group-data-[collapsible=icon]:w-9
                group-data-[collapsible=icon]:scale-[1.1]
              "
            />
          </div>

          {/* Brand */}

          <div
            className="
              flex
              min-w-0
              flex-col

              group-data-[collapsible=icon]:hidden
            "
          >
            <h1 className="text-[17px] font-semibold leading-tight">
              Gyan-Deep
            </h1>

            <p className="mt-1 text-[13px] font-normal leading-tight text-muted-foreground">
              Learning Platform
            </p>
          </div>
        </div>

        {/* Separator */}

        <div
          className="
            mx-5
            border-b

            group-data-[collapsible=icon]:mx-2
          "
        />
      </SidebarHeader>

      {/* ========================================
          SIDEBAR CONTENT
      ======================================== */}

      <SidebarContent className="px-2">

        {/* ========================================
            MAIN MENU
        ======================================== */}

        <SidebarGroup className="pt-5">

          <SidebarGroupLabel
            className="
              px-3
              pb-2
              text-[12px]
              font-medium
              uppercase
              tracking-wide
              text-muted-foreground

              group-data-[collapsible=icon]:hidden
            "
          >
            Main
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">

              {/* Dashboard */}

              {mainItems.slice(0, 1).map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="
                    flex
                    w-full
                    justify-start

                    group-data-[collapsible=icon]:justify-center
                  "
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    className="
                      flex
                      h-11
                      w-full
                      items-center
                      gap-3
                      px-3
                      text-[15px]
                      font-normal

                      group-data-[collapsible=icon]:mx-auto
                      group-data-[collapsible=icon]:h-11
                      group-data-[collapsible=icon]:w-11
                      group-data-[collapsible=icon]:justify-center
                      group-data-[collapsible=icon]:gap-0
                      group-data-[collapsible=icon]:px-0
                    "
                  >
                    <item.icon className="size-[18px] shrink-0" />

                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* ========================================
                  COURSES
              ======================================== */}

              <SidebarMenuItem>

                <SidebarMenuButton
                  tooltip="Courses"
                  onClick={() => setCoursesOpen(!coursesOpen)}
                  className="
                    flex
                    h-11
                    w-full
                    items-center
                    gap-3
                    px-3
                    text-[15px]
                    font-normal

                    group-data-[collapsible=icon]:mx-auto
                    group-data-[collapsible=icon]:h-11
                    group-data-[collapsible=icon]:w-11
                    group-data-[collapsible=icon]:justify-center
                    group-data-[collapsible=icon]:gap-0
                    group-data-[collapsible=icon]:px-0
                  "
                >

                  <BookOpen className="size-[18px] shrink-0" />

                  <span
                    className="
                      flex-1
                      text-left

                      group-data-[collapsible=icon]:hidden
                    "
                  >
                    Courses
                  </span>

                  <ChevronDown
                    className={`
                      size-4
                      shrink-0
                      transition-transform
                      duration-200

                      group-data-[collapsible=icon]:hidden

                      ${coursesOpen
                        ? "rotate-180"
                        : "rotate-0"
                      }
                    `}
                  />

                </SidebarMenuButton>

                {/* Course Items */}

                {coursesOpen && (
                  <div
                    className="
                      mt-1
                      ml-5
                      border-l
                      pl-3

                      group-data-[collapsible=icon]:hidden
                    "
                  >
                    {courses.map((course) => (
                      <Link
                        key={course.title}
                        href={course.url}
                        className="
                          flex
                          min-h-10
                          items-center
                          rounded-md
                          px-3
                          text-[14px]
                          text-muted-foreground
                          transition-colors

                          hover:bg-accent
                          hover:text-accent-foreground
                        "
                      >
                        {course.title}
                      </Link>
                    ))}
                  </div>
                )}

              </SidebarMenuItem>

              {/* Assignments + Notes */}

              {mainItems.slice(1).map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="
                    flex
                    w-full
                    justify-start

                    group-data-[collapsible=icon]:justify-center
                  "
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    className="
                      flex
                      h-11
                      w-full
                      items-center
                      gap-3
                      px-3
                      text-[15px]
                      font-normal

                      group-data-[collapsible=icon]:mx-auto
                      group-data-[collapsible=icon]:h-11
                      group-data-[collapsible=icon]:w-11
                      group-data-[collapsible=icon]:justify-center
                      group-data-[collapsible=icon]:gap-0
                      group-data-[collapsible=icon]:px-0
                    "
                  >

                    <item.icon className="size-[18px] shrink-0" />

                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>

                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ========================================
            PERSONAL MENU
        ======================================== */}

        <SidebarGroup className="pt-5">

          <SidebarGroupLabel
            className="
              px-3
              pb-2
              text-[12px]
              font-medium
              uppercase
              tracking-wide
              text-muted-foreground

              group-data-[collapsible=icon]:hidden
            "
          >
            Personal
          </SidebarGroupLabel>

          <SidebarGroupContent>

            <SidebarMenu className="gap-1">

              {personalItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="
                    flex
                    w-full
                    justify-start

                    group-data-[collapsible=icon]:justify-center
                  "
                >

                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    className="
                      flex
                      h-11
                      w-full
                      items-center
                      gap-3
                      px-3
                      text-[15px]
                      font-normal

                      group-data-[collapsible=icon]:mx-auto
                      group-data-[collapsible=icon]:h-11
                      group-data-[collapsible=icon]:w-11
                      group-data-[collapsible=icon]:justify-center
                      group-data-[collapsible=icon]:gap-0
                      group-data-[collapsible=icon]:px-0
                    "
                  >

                    <item.icon className="size-[18px] shrink-0" />

                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>

                  </SidebarMenuButton>

                </SidebarMenuItem>
              ))}

            </SidebarMenu>

          </SidebarGroupContent>

        </SidebarGroup>

      </SidebarContent>

      {/* ========================================
          USER FOOTER
      ======================================== */}

      <SidebarFooter className="p-3">

        <div
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            bg-background
            p-2
            shadow-sm

            group-data-[collapsible=icon]:border-0
            group-data-[collapsible=icon]:bg-transparent
            group-data-[collapsible=icon]:p-0
            group-data-[collapsible=icon]:shadow-none
          "
        >

          {/* ========================================
              PROFILE PICTURE / INITIAL
          ======================================== */}

          <div
            className="
              relative
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              bg-muted
              text-sm
              font-semibold
              text-foreground
            "
          >

            {profilePicture ? (
              <Image
                src={profilePicture}
                alt={`${username} profile`}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <span>
                {firstLetter}
              </span>
            )}

          </div>

          {/* ========================================
              USER INFORMATION
          ======================================== */}

          <div
            className="
              min-w-0
              flex-1

              group-data-[collapsible=icon]:hidden
            "
          >

            {/* Name / Role */}

            <p className="truncate text-[13px] font-semibold leading-tight">
              {user ? username : "Loading..."}
            </p>

            {/* Email */}

            <p
              className="
                mt-1
                truncate
                text-[11px]
                leading-tight
                text-muted-foreground
              "
              title={email}
            >
              {user ? email : "Loading..."}
            </p>

          </div>

          {/* ========================================
              LOGOUT BUTTON
          ======================================== */}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            aria-label="Logout"
            className="
              h-9
              w-9
              shrink-0
              rounded-lg
              text-muted-foreground

              hover:bg-destructive/10
              hover:text-destructive

              group-data-[collapsible=icon]:hidden
            "
          >
            <LogOut className="size-[17px]" />
          </Button>

        </div>

        {/* Collapsed Sidebar Logout */}

        <div
          className="
            hidden

            group-data-[collapsible=icon]:flex
            group-data-[collapsible=icon]:justify-center
          "
        >

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            aria-label="Logout"
            className="
              h-10
              w-10
              rounded-lg
              text-muted-foreground

              hover:bg-destructive/10
              hover:text-destructive
            "
          >
            <LogOut className="size-[18px]" />
          </Button>

        </div>

      </SidebarFooter>

    </Sidebar>
  );
}