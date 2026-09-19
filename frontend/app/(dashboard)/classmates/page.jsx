"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Mail, Phone, Search, User, Users, X } from "lucide-react";

import { Student } from "@/hooks/lib/api/userfetch";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ---------------------------------- types --------------------------------- */


/* --------------------------------- helpers -------------------------------- */

const getInitial = (name) =>
  name?.trim()?.charAt(0)?.toUpperCase() ?? "U";

const formatPhone = (phone) => phone?.trim() || "Not provided";

/* ----------------------------------- hook --------------------------------- */

function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await Student();
        if (!cancelled) setStudents(data);
      } catch (err) {
        console.error("Failed to load classmates:", err);
        if (!cancelled) setError("Couldn't load your classmates. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { students, loading, error };
}

/* ------------------------------ sub-components ---------------------------- */

function Avatar({
  src,
  name,
  size = 44,
}) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted font-semibold"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {src ? (
        <Image
          src={src}
          alt={`${name ?? "User"} profile picture`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span aria-hidden>{getInitial(name)}</span>
      )}
    </div>
  );
}

function CopyableValue({
  value,
  label,
  icon,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label.toLowerCase()}`}
      className="group/copy flex min-w-0 items-center gap-2 rounded-md px-1 -mx-1 py-0.5 text-left transition-colors hover:bg-muted/60"
    >
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="truncate text-sm">{value}</span>
      <span
        className={`ml-1 text-[10px] uppercase tracking-wide text-muted-foreground transition-opacity ${
          copied ? "opacity-100" : "opacity-0 group-hover/copy:opacity-60"
        }`}
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

function StudentRow({
  student,
  onSelect,
}) {
  return (
    <tr
      tabIndex={0}
      role="button"
      aria-label={`View details for ${student.username}`}
      onClick={() => onSelect(student)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(student);
        }
      }}
      className="group cursor-pointer border-b outline-none transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar src={student.profile_picture} name={student.username} />
          <div className="min-w-0">
            <p className="truncate font-medium">{student.username}</p>
            <p className="text-xs text-muted-foreground">ID #{student.id}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <CopyableValue
          value={student.email}
          label="Email"
          icon={<Mail className="h-4 w-4" />}
        />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {formatPhone(student.phone_number)}
          </span>
        </div>
      </td>

      <td className="px-6 py-4">
        <RoleBadge role={student.role} />
      </td>

      <td className="px-6 py-4 text-right">
        <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          View details
        </span>
      </td>
    </tr>
  );
}

function RoleBadge({ role }) {
  if (!role) return null;
  return (
    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary">
      {role}
    </span>
  );
}

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-1 text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

function StudentDialog({
  student,
  onClose,
}) {
  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-2xl p-0">
        {student && (
          <>
            <div className="relative bg-muted/30 px-6 pb-7 pt-8 sm:px-8">
              <DialogHeader>
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    src={student.profile_picture}
                    name={student.username}
                    size={112}
                  />
                  <DialogTitle className="mt-4 text-2xl">
                    {student.username}
                  </DialogTitle>
                  <DialogDescription className="capitalize">
                    {student.role ?? "Student"}
                  </DialogDescription>
                </div>
              </DialogHeader>
            </div>

            <div className="space-y-3 px-6 py-6 sm:px-8 sm:py-8">
              <DetailRow
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value={student.email}
              />
              <DetailRow
                icon={<Phone className="h-5 w-5" />}
                label="Phone number"
                value={formatPhone(student.phone_number)}
              />
              <DetailRow
                icon={<User className="h-5 w-5" />}
                label="Username"
                value={student.username}
              />
              <DetailRow
                icon={<Users className="h-5 w-5" />}
                label="Student ID"
                value={
                  <span className="flex items-center justify-between gap-3">
                    <span>#{student.id}</span>
                    <RoleBadge role={student.role} />
                  </span>
                }
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function ClassmatesPage() {
  const { students, loading, error } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState(
    null,
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.username?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        String(s.id).includes(q),
    );
  }, [students, query]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Classmates</h1>
              <p className="text-sm text-muted-foreground">
                View and connect with your classmates
              </p>
            </div>
          </div>

          {!loading && students.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or ID"
                className="pl-9 pr-9"
                aria-label="Search classmates"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </header>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border bg-card">
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <EmptyState title="Something went wrong" description={error} />
        )}

        {/* Empty */}
        {!loading && !error && students.length === 0 && (
          <EmptyState
            title="No classmates found"
            description="There are no students to display yet."
          />
        )}

        {/* No search matches */}
        {!loading &&
          !error &&
          students.length > 0 &&
          filtered.length === 0 && (
            <EmptyState
              title="No matches"
              description={`No classmates match "${query}".`}
            />
          )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-sm font-semibold">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone number</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      onSelect={setSelectedStudent}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-3 text-xs text-muted-foreground">
              <span>
                Showing {filtered.length} of {students.length}{" "}
                {students.length === 1 ? "student" : "students"}
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
          </div>
        )}

        {/* Detail dialog */}
        <StudentDialog
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      </div>
    </div>
  );
}