"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Mail,
  Phone,
  Search,
  User,
  Users,
  X,
} from "lucide-react";

import { Teacher } from "@/hooks/lib/api/userfetch";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* --------------------------------- helpers -------------------------------- */

const getInitial = (name, fallback = "T") => {
  return name?.trim()?.charAt(0)?.toUpperCase() || fallback;
};

const formatPhone = (phone) => {
  return phone?.trim() || "Not provided";
};

/* ---------------------------------- avatar -------------------------------- */

function Avatar({ src, name, size = 44, fallback = "T" }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size / 2.6,
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={`${name || "Teacher"} profile picture`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span aria-hidden>
          {getInitial(name, fallback)}
        </span>
      )}
    </div>
  );
}

/* --------------------------------- badge ---------------------------------- */

function RoleBadge({ role }) {
  if (!role) return null;

  return (
    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary">
      {role}
    </span>
  );
}

/* ------------------------------ copyable value ---------------------------- */

function CopyableValue({ value, label, icon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();

    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label.toLowerCase()}`}
      className="group/copy -mx-1 flex min-w-0 items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted/60"
    >
      <span className="shrink-0 text-muted-foreground">
        {icon}
      </span>

      <span className="truncate text-sm">
        {value || "Not provided"}
      </span>

      <span
        className={`ml-1 text-[10px] uppercase tracking-wide text-muted-foreground transition-opacity ${
          copied
            ? "opacity-100"
            : "opacity-0 group-hover/copy:opacity-60"
        }`}
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

/* --------------------------------- search --------------------------------- */

function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-80">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search teachers..."
        className="pl-9 pr-9"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------- table row -------------------------------- */

function TeacherRow({ teacher, onSelect }) {
  return (
    <tr
      tabIndex={0}
      role="button"
      aria-label={`View details for ${teacher.username}`}
      onClick={() => onSelect(teacher)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(teacher);
        }
      }}
      className="group cursor-pointer border-b outline-none transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40"
    >
      {/* Teacher */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={teacher.profile_picture}
            name={teacher.username}
            fallback="T"
          />

          <div className="min-w-0">
            <p className="truncate font-medium">
              {teacher.username}
            </p>

            <p className="text-xs text-muted-foreground">
              ID #{teacher.id}
            </p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4">
        <CopyableValue
          value={teacher.email}
          label="Email"
          icon={<Mail className="h-4 w-4" />}
        />
      </td>

      {/* Phone */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />

          <span className="text-sm text-muted-foreground">
            {formatPhone(teacher.phone_number)}
          </span>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <RoleBadge role={teacher.role} />
      </td>

      {/* Details */}
      <td className="px-6 py-4 text-right">
        <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          View details
        </span>
      </td>
    </tr>
  );
}

/* --------------------------------- dialog --------------------------------- */

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <div className="mt-1 break-words text-sm font-medium">
          {value}
        </div>
      </div>
    </div>
  );
}

function TeacherDialog({ teacher, onClose }) {
  return (
    <Dialog
      open={!!teacher}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-2xl p-0">
        {teacher && (
          <>
            {/* Profile header */}
            <div className="bg-muted/30 px-6 pb-7 pt-8 sm:px-8">
              <DialogHeader>
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    src={teacher.profile_picture}
                    name={teacher.username}
                    size={112}
                    fallback="T"
                  />

                  <DialogTitle className="mt-4 text-2xl">
                    {teacher.username}
                  </DialogTitle>

                  <DialogDescription className="capitalize">
                    {teacher.role || "Teacher"}
                  </DialogDescription>
                </div>
              </DialogHeader>
            </div>

            {/* Details */}
            <div className="space-y-3 px-6 py-6 sm:px-8 sm:py-8">
              <DetailRow
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value={teacher.email}
              />

              <DetailRow
                icon={<Phone className="h-5 w-5" />}
                label="Phone number"
                value={formatPhone(teacher.phone_number)}
              />

              <DetailRow
                icon={<User className="h-5 w-5" />}
                label="Username"
                value={teacher.username}
              />

              <DetailRow
                icon={<Users className="h-5 w-5" />}
                label="Teacher ID"
                value={
                  <div className="flex items-center justify-between gap-3">
                    <span>#{teacher.id}</span>

                    <RoleBadge role={teacher.role} />
                  </div>
                }
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- page ----------------------------------- */

const TeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await Teacher();

        console.log("Fetched teachers:", data);

        if (!cancelled) {
          setTeachers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);

        if (!cancelled) {
          setError("Unable to load teachers. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTeachers();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------- filtering ------------------------------ */

  const filteredTeachers = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      return (
        teacher.username?.toLowerCase().includes(search) ||
        teacher.email?.toLowerCase().includes(search) ||
        String(teacher.id).includes(search) ||
        teacher.phone_number?.toLowerCase().includes(search)
      );
    });
  }, [teachers, query]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Teachers
              </h1>

              <p className="text-sm text-muted-foreground">
                View your teachers and their contact information
              </p>
            </div>
          </div>

          {!loading && teachers.length > 0 && (
            <SearchBar
              value={query}
              onChange={setQuery}
            />
          )}
        </header>

        {/* Loading */}
        {loading && (
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
            </div>

            <h2 className="text-lg font-semibold">
              Something went wrong
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && teachers.length === 0 && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>

            <h2 className="text-lg font-semibold">
              No teachers found
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no teachers to display.
            </p>
          </div>
        )}

        {/* No search results */}
        {!loading &&
          !error &&
          teachers.length > 0 &&
          filteredTeachers.length === 0 && (
            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed">
              <Search className="mb-4 h-7 w-7 text-muted-foreground" />

              <h2 className="text-lg font-semibold">
                No teachers found
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                No teachers match "{query}".
              </p>

              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => setQuery("")}
              >
                Clear search
              </Button>
            </div>
          )}

        {/* Teachers table */}
        {!loading &&
          !error &&
          filteredTeachers.length > 0 && (
            <>
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left text-sm font-semibold">
                        <th className="px-6 py-4">
                          Teacher
                        </th>

                        <th className="px-6 py-4">
                          Email
                        </th>

                        <th className="px-6 py-4">
                          Phone number
                        </th>

                        <th className="px-6 py-4">
                          Role
                        </th>

                        <th className="px-6 py-4 text-right">
                          <span className="sr-only">
                            Actions
                          </span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTeachers.map((teacher) => (
                        <TeacherRow
                          key={teacher.id}
                          teacher={teacher}
                          onSelect={setSelectedTeacher}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Count */}
              <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
                <span>
                  Showing {filteredTeachers.length} of{" "}
                  {teachers.length}{" "}
                  {teachers.length === 1
                    ? "teacher"
                    : "teachers"}
                </span>

                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuery("")}
                    className="h-7 text-xs"
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            </>
          )}

        {/* Teacher details */}
        <TeacherDialog
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      </div>
    </div>
  );
};

export default TeacherPage;