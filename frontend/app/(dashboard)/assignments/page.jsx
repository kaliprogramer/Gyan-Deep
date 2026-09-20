"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Eye,
  ExternalLink,
  File,
  FileArchive,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  FileWarning,
  Loader2,
  MoreVertical,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";

import { apiFetch } from "@/hooks/lib/api/apifetch";
import { getMe } from "@/hooks/lib/api/auth";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "http://localhost:8000";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".zip",
  ".rar",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".mp4",
  ".webm",
  ".py",
  ".js",
  ".jsx",
  ".html",
  ".css",
  ".c",
  ".cpp",
  ".java",
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* =========================================================
   URL HELPERS
========================================================= */

function buildApiUrl(url) {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_URL}${url}`;
  }

  return `${API_URL}/${url}`;
}

/* =========================================================
   FILE HELPERS
========================================================= */

function resolveFileUrl(file) {
  if (!file) return "";

  if (typeof file === "string") {
    return buildApiUrl(file);
  }

  if (typeof file === "object") {
    return buildApiUrl(
      file.url ||
        file.file_url ||
        file.download_url ||
        file.file ||
        file.path ||
        file.src ||
        ""
    );
  }

  return "";
}

function getFileName(file) {
  if (!file) return "File";

  if (typeof file === "string") {
    try {
      const clean = file.split("?")[0];

      return decodeURIComponent(
        clean.split("/").pop() || "File"
      );
    } catch {
      return "File";
    }
  }

  if (typeof file === "object") {
    return (
      file.name ||
      file.filename ||
      file.original_name ||
      file.file_name ||
      getFileName(file.file) ||
      "File"
    );
  }

  return "File";
}

function getExtension(file) {
  const name = getFileName(file).toLowerCase();

  if (!name.includes(".")) return "";

  return `.${name.split(".").pop()}`;
}

function formatBytes(bytes) {
  if (
    bytes === undefined ||
    bytes === null ||
    bytes === "" ||
    Number.isNaN(Number(bytes))
  ) {
    return "";
  }

  const value = Number(bytes);

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getFileIcon(file) {
  const ext = getExtension(file);

  if (
    [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)
  ) {
    return FileImage;
  }

  if (
    [".mp4", ".webm", ".mov", ".avi"].includes(ext)
  ) {
    return FileVideo;
  }

  if (
    [".xls", ".xlsx", ".csv"].includes(ext)
  ) {
    return FileSpreadsheet;
  }

  if (
    [".zip", ".rar", ".7z"].includes(ext)
  ) {
    return FileArchive;
  }

  if (
    [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".c",
      ".cpp",
      ".java",
      ".html",
      ".css",
    ].includes(ext)
  ) {
    return FileCode2;
  }

  if (
    [
      ".pdf",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".txt",
    ].includes(ext)
  ) {
    return FileText;
  }

  return File;
}

function isImageFile(file) {
  return [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
  ].includes(getExtension(file));
}

/* =========================================================
   DATE HELPERS
========================================================= */

function formatDate(date) {
  if (!date) return "No date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "Unknown date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* =========================================================
   GENERAL HELPERS
========================================================= */

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.assignments)) {
    return value.assignments;
  }

  if (Array.isArray(value?.submissions)) {
    return value.submissions;
  }

  if (Array.isArray(value?.students)) {
    return value.students;
  }

  return [];
}

function getAssignmentId(assignment) {
  return assignment?.id ?? assignment?.pk;
}

function getAssignmentTitle(assignment) {
  return (
    assignment?.title ||
    assignment?.name ||
    assignment?.assignment_title ||
    "Untitled Assignment"
  );
}

function getAssignmentDescription(assignment) {
  return (
    assignment?.description ||
    assignment?.instructions ||
    assignment?.details ||
    ""
  );
}

function getAssignmentDueDate(assignment) {
  return (
    assignment?.due_date ||
    assignment?.deadline ||
    assignment?.dueDate ||
    assignment?.submission_deadline ||
    null
  );
}

function getAssignmentFiles(assignment) {
  const files =
    assignment?.files ||
    assignment?.attachments ||
    assignment?.assignment_files ||
    [];

  if (Array.isArray(files)) {
    return files;
  }

  return files ? [files] : [];
}

function getSubmissionFiles(submission) {
  if (!submission) return [];

  const files =
    submission?.files ||
    submission?.attachments ||
    submission?.submission_files ||
    submission?.uploaded_files ||
    submission?.file ||
    [];

  if (Array.isArray(files)) {
    return files;
  }

  return files ? [files] : [];
}

function getSubmissionDate(submission) {
  return (
    submission?.submitted_at ||
    submission?.created_at ||
    submission?.updated_at ||
    submission?.submission_date ||
    null
  );
}

function getSubmissionId(submission) {
  return submission?.id ?? submission?.pk;
}

function getSubmissionText(submission) {
  return (
    submission?.text ||
    submission?.content ||
    submission?.answer ||
    submission?.comment ||
    submission?.description ||
    ""
  );
}

function getDueStatus(dueDate) {
  if (!dueDate) {
    return {
      label: "No deadline",
      className:
        "text-muted-foreground bg-muted",
    };
  }

  const date = new Date(dueDate);

  if (Number.isNaN(date.getTime())) {
    return {
      label: formatDate(dueDate),
      className:
        "text-muted-foreground bg-muted",
    };
  }

  const now = new Date();

  if (date < now) {
    return {
      label: "Past due",
      className:
        "text-red-600 bg-red-50 dark:bg-red-950/30",
    };
  }

  const difference =
    date.getTime() - now.getTime();

  const days = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  if (days <= 1) {
    return {
      label: "Due soon",
      className:
        "text-orange-600 bg-orange-50 dark:bg-orange-950/30",
    };
  }

  return {
    label: formatDate(date),
    className:
      "text-muted-foreground bg-muted",
  };
}

/* =========================================================
   STUDENT HELPERS
========================================================= */

/*
 * IMPORTANT:
 *
 * Your backend currently returns:
 *
 * student: 3
 *
 * instead of:
 *
 * student: {
 *   id: 3,
 *   username: "...",
 *   email: "...",
 *   profile_image: "..."
 * }
 *
 * These helpers allow both formats.
 */

function getRawStudentValue(submission) {
  if (!submission) return null;

  return (
    submission?.student ??
    submission?.student_id ??
    submission?.user ??
    submission?.user_id ??
    submission?.submitted_by ??
    submission?.submitted_by_id ??
    submission?.owner ??
    null
  );
}

function getStudentId(submission) {
  const rawStudent = getRawStudentValue(submission);

  if (
    typeof rawStudent === "number" ||
    typeof rawStudent === "string"
  ) {
    const numericId = Number(rawStudent);

    if (!Number.isNaN(numericId)) {
      return numericId;
    }
  }

  if (rawStudent && typeof rawStudent === "object") {
    const id =
      rawStudent?.id ??
      rawStudent?.pk ??
      rawStudent?.user_id;

    const numericId = Number(id);

    if (!Number.isNaN(numericId)) {
      return numericId;
    }
  }

  const fallbackId =
    submission?.student_id ??
    submission?.user_id ??
    submission?.submitted_by_id;

  if (
    fallbackId !== undefined &&
    fallbackId !== null
  ) {
    const numericId = Number(fallbackId);

    if (!Number.isNaN(numericId)) {
      return numericId;
    }
  }

  return null;
}

function getStudentObject(submission, studentDirectory = {}) {
  if (!submission) return {};

  /*
   * First check if backend already returned
   * a complete nested student object.
   */

  const possibleStudent =
    submission?.student_details ||
    submission?.student_detail ||
    submission?.student_user ||
    submission?.user_details ||
    submission?.user_detail ||
    submission?.submitted_by_details ||
    submission?.profile;

  if (
    possibleStudent &&
    typeof possibleStudent === "object" &&
    !Array.isArray(possibleStudent)
  ) {
    return possibleStudent;
  }

  const rawStudent = getRawStudentValue(submission);

  /*
   * Backend sometimes sends:
   *
   * student: {
   *   id: 3,
   *   username: "Kiran"
   * }
   */

  if (
    rawStudent &&
    typeof rawStudent === "object" &&
    !Array.isArray(rawStudent)
  ) {
    return rawStudent;
  }

  /*
   * Backend sends:
   *
   * student: 3
   *
   * Find ID 3 inside the student directory.
   */

  const studentId = getStudentId(submission);

  if (
    studentId !== null &&
    studentDirectory?.[studentId]
  ) {
    return studentDirectory[studentId];
  }

  return {};
}

function getStudentName(
  submission,
  studentDirectory = {}
) {
  const student = getStudentObject(
    submission,
    studentDirectory
  );

  return (
    student?.name ||
    student?.full_name ||
    student?.fullName ||
    student?.username ||
    student?.display_name ||
    student?.displayName ||
    submission?.student_name ||
    submission?.user_name ||
    submission?.submitted_by_name ||
    "Student"
  );
}

function getStudentEmail(
  submission,
  studentDirectory = {}
) {
  const student = getStudentObject(
    submission,
    studentDirectory
  );

  return (
    student?.email ||
    student?.email_address ||
    submission?.student_email ||
    submission?.user_email ||
    submission?.submitted_by_email ||
    submission?.email ||
    ""
  );
}

function getStudentProfileImage(
  submission,
  studentDirectory = {}
) {
  const student = getStudentObject(
    submission,
    studentDirectory
  );

  const image =
    student?.profile_image ||
    student?.profileImage ||
    student?.profile_picture ||
    student?.profilePicture ||
    student?.avatar ||
    student?.avatar_url ||
    student?.image ||
    student?.image_url ||
    student?.photo ||
    submission?.student_profile_image ||
    submission?.profile_image ||
    submission?.avatar ||
    "";

  return buildApiUrl(image);
}

/* =========================================================
   FILE CARD
========================================================= */

function FileCard({
  file,
  removable = false,
  onRemove,
  preview = true,
}) {
  const Icon = getFileIcon(file);

  const url = resolveFileUrl(file);
  const name = getFileName(file);

  const size =
    typeof file === "object"
      ? file?.size ||
        file?.file_size ||
        file?.filesize
      : null;

  const image =
    preview &&
    isImageFile(file) &&
    url;

  return (
    <div className="group overflow-hidden rounded-xl border bg-background">
      {image ? (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={url}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-28 items-center justify-center bg-muted/40">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-center gap-3 p-3">
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {name}
          </p>

          {size ? (
            <p className="text-xs text-muted-foreground">
              {formatBytes(size)}
            </p>
          ) : (
            <p className="text-xs uppercase text-muted-foreground">
              {getExtension(file).replace(".", "") ||
                "FILE"}
            </p>
          )}
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Open file"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ASSIGNMENT FILES
========================================================= */

function AssignmentFiles({ files }) {
  if (!files?.length) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-muted-foreground" />

        <p className="text-sm font-semibold">
          Attached files ({files.length})
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file, index) => (
          <FileCard
            key={`${getFileName(file)}-${index}`}
            file={file}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   SUBMISSION FILES
========================================================= */

function SubmissionFiles({ submission }) {
  const files = getSubmissionFiles(
    submission
  );

  if (!files.length) {
    return (
      <div className="rounded-xl border border-dashed p-5 text-center">
        <FileWarning className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />

        <p className="text-sm text-muted-foreground">
          No files attached to this submission.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {files.map((file, index) => (
        <FileCard
          key={`${getFileName(file)}-${index}`}
          file={file}
          preview
        />
      ))}
    </div>
  );
}

/* =========================================================
   SUBMISSION DIALOG
========================================================= */

function SubmissionDialog({
  assignment,
  submission,
  onClose,
  onSubmit,
  loading,
}) {
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    setText(
      getSubmissionText(submission)
    );

    setFiles([]);
  }, [submission]);

  const addFiles = (incoming) => {
    const selected = Array.from(
      incoming || []
    );

    const valid = [];
    const errors = [];

    selected.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.name} is larger than 20 MB.`
        );

        return;
      }

      const extension =
        `.${file.name.split(".").pop().toLowerCase()}`;

      if (
        ACCEPTED_EXTENSIONS.length &&
        !ACCEPTED_EXTENSIONS.includes(
          extension
        )
      ) {
        errors.push(
          `${file.name} is not a supported file type.`
        );

        return;
      }

      valid.push(file);
    });

    if (errors.length) {
      window.alert(
        errors.join("\n")
      );
    }

    setFiles((current) => [
      ...current,
      ...valid,
    ]);
  };

  const removeFile = (index) => {
    setFiles((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    await onSubmit({
      assignment,
      files,
      text,
      existingSubmission:
        submission,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <div className="flex items-start justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">
              {submission
                ? "Edit submission"
                : "Submit assignment"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {getAssignmentTitle(
                assignment
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Your answer
            </label>

            <textarea
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              placeholder="Write something about your submission..."
              className="min-h-32 w-full resize-y rounded-xl border bg-background px-4 py-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            />
          </div>

          {submission &&
            getSubmissionFiles(
              submission
            ).length > 0 && (
              <div>
                <p className="mb-3 text-sm font-medium">
                  Existing submitted files
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {getSubmissionFiles(
                    submission
                  ).map((file, index) => (
                    <FileCard
                      key={`${getFileName(
                        file
                      )}-${index}`}
                      file={file}
                    />
                  ))}
                </div>
              </div>
            )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">
                Add files
              </label>

              <span className="text-xs text-muted-foreground">
                Max 20 MB per file
              </span>
            </div>

            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(
                  event.target.files
                );

                event.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed p-8 transition hover:bg-muted/50"
            >
              <Upload className="mb-3 h-8 w-8 text-muted-foreground" />

              <span className="text-sm font-medium">
                Click to upload files
              </span>

              <span className="mt-1 text-xs text-muted-foreground">
                PDF, Word, PowerPoint, images,
                ZIP and code files
              </span>
            </button>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                New files ({files.length})
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {files.map(
                  (file, index) => (
                    <FileCard
                      key={`${file.name}-${index}`}
                      file={file}
                      removable
                      onRemove={() =>
                        removeFile(index)
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}

            {submission
              ? "Update submission"
              : "Submit assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ASSIGNMENT FORM
========================================================= */

function AssignmentFormDialog({
  assignment,
  onClose,
  onSave,
  loading,
}) {
  const [title, setTitle] =
    useState(
      assignment
        ? getAssignmentTitle(
            assignment
          )
        : ""
    );

  const [description, setDescription] =
    useState(
      assignment
        ? getAssignmentDescription(
            assignment
          )
        : ""
    );

  const [dueDate, setDueDate] =
    useState(() => {
      const value =
        getAssignmentDueDate(
          assignment
        );

      if (!value) return "";

      try {
        const date = new Date(value);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return "";
        }

        const offset =
          date.getTimezoneOffset();

        const localDate =
          new Date(
            date.getTime() -
              offset * 60000
          );

        return localDate
          .toISOString()
          .slice(0, 16);
      } catch {
        return "";
      }
    });

  const [files, setFiles] =
    useState([]);

  const inputRef =
    useRef(null);

  const addFiles = (incoming) => {
    const selected =
      Array.from(
        incoming || []
      );

    const valid = [];
    const errors = [];

    selected.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.name} is larger than 20 MB.`
        );

        return;
      }

      valid.push(file);
    });

    if (errors.length) {
      window.alert(
        errors.join("\n")
      );
    }

    setFiles((current) => [
      ...current,
      ...valid,
    ]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      window.alert(
        "Please enter an assignment title."
      );

      return;
    }

    await onSave({
      title: title.trim(),
      description:
        description.trim(),
      dueDate,
      files,
      assignment,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">
              {assignment
                ? "Edit assignment"
                : "Create assignment"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add instructions and optional files.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Assignment title
            </label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Example: Complete Chapter 3 exercises"
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Write assignment instructions..."
              className="min-h-32 w-full resize-y rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Due date
            </label>

            <input
              type="datetime-local"
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value
                )
              }
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Assignment files
            </label>

            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(
                  event.target.files
                );

                event.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed p-7 text-sm transition hover:bg-muted/50"
            >
              <Upload className="h-5 w-5" />

              Upload assignment files
            </button>
          </div>

          {files.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {files.map(
                (file, index) => (
                  <FileCard
                    key={`${file.name}-${index}`}
                    file={file}
                    removable
                    onRemove={() =>
                      setFiles(
                        (current) =>
                          current.filter(
                            (_, i) =>
                              i !== index
                          )
                      )
                    }
                  />
                )
              )}
            </div>
          )}

          {assignment &&
            getAssignmentFiles(
              assignment
            ).length > 0 && (
              <div>
                <p className="mb-3 text-sm font-medium">
                  Existing assignment files
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {getAssignmentFiles(
                    assignment
                  ).map(
                    (
                      file,
                      index
                    ) => (
                      <FileCard
                        key={`${getFileName(
                          file
                        )}-${index}`}
                        file={file}
                      />
                    )
                  )}
                </div>
              </div>
            )}
        </div>

        <div className="flex justify-end gap-3 border-t p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {assignment
              ? "Save changes"
              : "Create assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STUDENT ASSIGNMENT CARD
========================================================= */

function StudentAssignmentCard({
  assignment,
  submission,
  onSubmit,
  onDeleteSubmission,
  onRefresh,
}) {
  const [open, setOpen] =
    useState(false);

  const dueDate =
    getAssignmentDueDate(
      assignment
    );

  const dueStatus =
    getDueStatus(dueDate);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">
              {getAssignmentTitle(
                assignment
              )}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1",
                  dueStatus.className
                )}
              >
                <Calendar className="h-3.5 w-3.5" />

                {dueStatus.label}
              </span>

              {submission && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-green-600 dark:bg-green-950/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />

                  Submitted
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setOpen(
                (value) => !value
              )
            }
            className="rounded-lg p-2 hover:bg-muted"
          >
            {open ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {getAssignmentDescription(
          assignment
        ) && (
          <p
            className={cn(
              "mt-4 text-sm leading-6 text-muted-foreground",
              !open &&
                "line-clamp-2"
            )}
          >
            {getAssignmentDescription(
              assignment
            )}
          </p>
        )}

        {open && (
          <>
            <AssignmentFiles
              files={getAssignmentFiles(
                assignment
              )}
            />

            {submission && (
              <div className="mt-6 rounded-xl bg-muted/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      Your submission
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted{" "}
                      {formatDateTime(
                        getSubmissionDate(
                          submission
                        )
                      )}
                    </p>
                  </div>

                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>

                {getSubmissionText(
                  submission
                ) && (
                  <p className="mb-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {getSubmissionText(
                      submission
                    )}
                  </p>
                )}

                <SubmissionFiles
                  submission={
                    submission
                  }
                />
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onSubmit(
                    assignment,
                    submission
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {submission ? (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit submission
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit assignment
                  </>
                )}
              </button>

              {submission && (
                <button
                  type="button"
                  onClick={() =>
                    onDeleteSubmission(
                      assignment,
                      submission
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />

                  Delete submission
                </button>
              )}

              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                <RefreshCw className="h-4 w-4" />

                Refresh
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TEACHER SUBMISSIONS
========================================================= */

function TeacherSubmissions({
  assignment,
  state,
  onLoad,
  studentDirectory,
}) {
  const submissions =
    state?.submissions || [];

  return (
    <div className="mt-5 rounded-2xl border bg-muted/20">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />

            <h4 className="font-semibold">
              Student submissions
            </h4>
          </div>

          {!state?.loading &&
            !state?.error && (
              <p className="mt-1 text-xs text-muted-foreground">
                {submissions.length}{" "}
                submission
                {submissions.length ===
                1
                  ? ""
                  : "s"}{" "}
                found
              </p>
            )}
        </div>

        <button
          type="button"
          onClick={() =>
            onLoad(assignment)
          }
          disabled={state?.loading}
          className="rounded-lg p-2 hover:bg-muted disabled:opacity-50"
          title="Refresh submissions"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              state?.loading &&
                "animate-spin"
            )}
          />
        </button>
      </div>

      <div className="p-4">
        {state?.loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />

            Loading student submissions...
          </div>
        )}

        {!state?.loading &&
          state?.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">
                    Could not load submissions
                  </p>

                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {state.error}
                  </p>
                </div>
              </div>
            </div>
          )}

        {!state?.loading &&
          !state?.error &&
          submissions.length === 0 && (
            <div className="py-10 text-center">
              <Users className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />

              <p className="font-medium">
                No student submissions
                found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Students who submit this
                assignment will appear here.
              </p>
            </div>
          )}

        {!state?.loading &&
          !state?.error &&
          submissions.length > 0 && (
            <div className="space-y-4">
              {submissions.map(
                (
                  submission,
                  index
                ) => (
                  <StudentSubmissionCard
                    key={
                      getSubmissionId(
                        submission
                      ) ||
                      `${getStudentId(
                        submission
                      )}-${index}`
                    }
                    submission={
                      submission
                    }
                    studentDirectory={
                      studentDirectory
                    }
                  />
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}

/* =========================================================
   STUDENT SUBMISSION CARD
========================================================= */

function StudentSubmissionCard({
  submission,
  studentDirectory,
}) {
  const [open, setOpen] =
    useState(true);

  const studentName =
    getStudentName(
      submission,
      studentDirectory
    );

  const studentEmail =
    getStudentEmail(
      submission,
      studentDirectory
    );

  const studentImage =
    getStudentProfileImage(
      submission,
      studentDirectory
    );

  const submittedAt =
    getSubmissionDate(
      submission
    );

  const text =
    getSubmissionText(
      submission
    );

  const files =
    getSubmissionFiles(
      submission
    );

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) => !value
          )
        }
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/30"
      >
        {/* PROFILE IMAGE */}

        {studentImage ? (
          <img
            src={studentImage}
            alt={studentName}
            className="h-10 w-10 shrink-0 rounded-full border object-cover"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";

              const fallback =
                event.currentTarget
                  .nextElementSibling;

              if (fallback) {
                fallback.style.display =
                  "flex";
              }
            }}
          />
        ) : null}

        {/* FALLBACK AVATAR */}

        <div
          className={cn(
            "h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10",
            studentImage
              ? "hidden"
              : "flex"
          )}
        >
          <User className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {studentName}
          </p>

          {studentEmail && (
            <p className="truncate text-xs text-muted-foreground">
              {studentEmail}
            </p>
          )}
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">
            Submitted
          </p>

          <p className="text-xs font-medium">
            {formatDateTime(
              submittedAt
            )}
          </p>
        </div>

        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t p-4">
          {text && (
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Student answer
              </p>

              <div className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-6">
                {text}
              </div>
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />

              <p className="text-sm font-semibold">
                Submitted files ({files.length})
              </p>
            </div>

            <SubmissionFiles
              submission={
                submission
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TEACHER ASSIGNMENT CARD
========================================================= */

function TeacherAssignmentCard({
  assignment,
  submissionState,
  onLoadSubmissions,
  onEdit,
  onDelete,
  studentDirectory,
}) {
  const [open, setOpen] =
    useState(false);

  const dueDate =
    getAssignmentDueDate(
      assignment
    );

  const submissionsCount =
    assignment?.submissions_count ??
    assignment?.submission_count ??
    assignment?.submissionsCount ??
    null;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">
              {getAssignmentTitle(
                assignment
              )}
            </h3>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {dueDate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />

                  Due{" "}
                  {formatDate(
                    dueDate
                  )}
                </span>
              )}

              {submissionsCount !==
                null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />

                  {submissionsCount}{" "}
                  submitted
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpen(
                  (value) => !value
                )
              }
              className="rounded-lg p-2 hover:bg-muted"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {open && (
              <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border bg-background p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);

                    onEdit(
                      assignment
                    );
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Edit3 className="h-4 w-4" />

                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);

                    onDelete(
                      assignment
                    );
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />

                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {getAssignmentDescription(
          assignment
        ) && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {getAssignmentDescription(
              assignment
            )}
          </p>
        )}

        <AssignmentFiles
          files={getAssignmentFiles(
            assignment
          )}
        />

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onLoadSubmissions(
                assignment
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Eye className="h-4 w-4" />

            View student submissions
          </button>

          <button
            type="button"
            onClick={() =>
              onEdit(assignment)
            }
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Edit3 className="h-4 w-4" />

            Edit
          </button>
        </div>

        {submissionState?.open && (
          <TeacherSubmissions
            assignment={assignment}
            state={
              submissionState
            }
            onLoad={
              onLoadSubmissions
            }
            studentDirectory={
              studentDirectory
            }
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AssignmentsPage() {
  const [user, setUser] =
    useState(null);

  const [assignments, setAssignments] =
    useState([]);

  const [
    loadingAssignments,
    setLoadingAssignments,
  ] = useState(true);

  const [pageError, setPageError] =
    useState("");

  const [
    submissionDialog,
    setSubmissionDialog,
  ] = useState(null);

  const [
    assignmentDialog,
    setAssignmentDialog,
  ] = useState(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    teacherSubmissionStates,
    setTeacherSubmissionStates,
  ] = useState({});

  /*
   * This stores:
   *
   * {
   *   3: {
   *     id: 3,
   *     username: "Kiran KC",
   *     email: "...",
   *     profile_image: "..."
   *   }
   * }
   */

  const [
    studentDirectory,
    setStudentDirectory,
  ] = useState({});

  const [
    loadingStudents,
    setLoadingStudents,
  ] = useState(false);

  const [
    activeFilter,
    setActiveFilter,
  ] = useState("all");

  /* =======================================================
     LOAD USER
  ======================================================= */

  const loadUser =
    useCallback(async () => {
      try {
        const currentUser =
          await getMe();

        setUser(
          currentUser
        );

        return currentUser;
      } catch (error) {
        console.error(
          "Authentication error:",
          error
        );

        window.location.href =
          "/auth/login";

        return null;
      }
    }, []);

  /* =======================================================
     LOAD STUDENT DIRECTORY
     
     IMPORTANT FIX:
     
     Backend returns:
     
       student: 3
     
     So we load:
     
       /auth/users/students/
     
     and create an ID -> student map.
  ======================================================= */

  const loadStudentDirectory =
    useCallback(async () => {
      try {
        setLoadingStudents(
          true
        );

        const data =
          await apiFetch(
            "/auth/users/students/",
            {
              method: "GET",
            }
          );

        const students =
          normalizeArray(data);

        const directory = {};

        students.forEach(
          (student) => {
            if (!student) {
              return;
            }

            const id =
              student?.id ??
              student?.pk ??
              student?.user_id;

            if (
              id !== undefined &&
              id !== null
            ) {
              directory[
                Number(id)
              ] = student;
            }
          }
        );

        setStudentDirectory(
          directory
        );

        console.log(
          "Student directory:",
          directory
        );

        return directory;
      } catch (error) {
        console.error(
          "Student directory loading error:",
          error
        );

        /*
         * Do not break the assignments page
         * if the student directory fails.
         */

        return {};
      } finally {
        setLoadingStudents(
          false
        );
      }
    }, []);

  /* =======================================================
     LOAD ASSIGNMENTS
  ======================================================= */

  const loadAssignments =
    useCallback(async () => {
      try {
        setLoadingAssignments(
          true
        );

        setPageError("");

        const data =
          await apiFetch(
            "/api/assignments/",
            {
              method: "GET",
            }
          );

        const list =
          normalizeArray(data);

        setAssignments(list);
      } catch (error) {
        console.error(
          "Assignment loading error:",
          error
        );

        if (
          error?.message ===
          "Session expired. Please login again."
        ) {
          window.location.href =
            "/auth/login";

          return;
        }

        setPageError(
          error?.message ||
            "Unable to load assignments."
        );
      } finally {
        setLoadingAssignments(
          false
        );
      }
    }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const currentUser =
          await getMe();

        if (cancelled) {
          return;
        }

        setUser(
          currentUser
        );

        await loadAssignments();

        /*
         * Only teachers need the student directory
         * for the submission page.
         */

        const role = String(
          currentUser?.role ||
            currentUser?.user_type ||
            currentUser?.account_type ||
            ""
        ).toLowerCase();

        if (
          role === "teacher"
        ) {
          await loadStudentDirectory();
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Initialization error:",
          error
        );

        window.location.href =
          "/auth/login";
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [
    loadAssignments,
    loadStudentDirectory,
  ]);

  /* =======================================================
     ROLE
  ======================================================= */

  const isTeacher =
    useMemo(() => {
      const role =
        user?.role ||
        user?.user_type ||
        user?.account_type ||
        "";

      return (
        String(role).toLowerCase() ===
        "teacher"
      );
    }, [user]);

  const isStudent =
    !isTeacher;

  /* =======================================================
     STUDENT SUBMISSION FINDER
  ======================================================= */

  const getStudentSubmission =
    useCallback(
      (assignment) => {
        if (!assignment) {
          return null;
        }

        return (
          assignment?.my_submission ||
          assignment?.mySubmission ||
          assignment?.submission ||
          assignment?.student_submission ||
          null
        );
      },
      []
    );

  /* =======================================================
     LOAD TEACHER SUBMISSIONS
  ======================================================= */

  const loadTeacherSubmissions =
    useCallback(
      async (assignment) => {
        const assignmentId =
          getAssignmentId(
            assignment
          );

        if (!assignmentId) {
          return;
        }

        /*
         * If student directory has not loaded yet,
         * try loading it before showing submissions.
         */

        if (
          Object.keys(
            studentDirectory
          ).length === 0
        ) {
          await loadStudentDirectory();
        }

        setTeacherSubmissionStates(
          (current) => ({
            ...current,
            [assignmentId]: {
              ...(current[
                assignmentId
              ] || {}),
              open: true,
              loading: true,
              error: "",
            },
          })
        );

        try {
          const data =
            await apiFetch(
              `/api/assignments/${assignmentId}/submission/`,
              {
                method: "GET",
              }
            );

          let submissions = [];

          if (Array.isArray(data)) {
            submissions = data;
          } else if (
            Array.isArray(
              data?.results
            )
          ) {
            submissions =
              data.results;
          } else if (
            Array.isArray(
              data?.submissions
            )
          ) {
            submissions =
              data.submissions;
          } else if (
            Array.isArray(
              data?.data
            )
          ) {
            submissions =
              data.data;
          } else if (
            data &&
            typeof data ===
              "object" &&
            (
              data.id ||
              data.pk ||
              data.student ||
              data.user ||
              data.submitted_by ||
              data.files ||
              data.file
            )
          ) {
            submissions = [
              data,
            ];
          }

          console.log(
            "Teacher submissions:",
            submissions
          );

          /*
           * Debug:
           *
           * This should show:
           *
           * student: 3
           *
           * Then the Student Directory
           * will resolve ID 3.
           */

          submissions.forEach(
            (submission) => {
              console.log(
                "Submission student:",
                submission?.student
              );

              console.log(
                "Resolved student:",
                getStudentObject(
                  submission,
                  studentDirectory
                )
              );
            }
          );

          setTeacherSubmissionStates(
            (current) => ({
              ...current,
              [assignmentId]: {
                open: true,
                loading: false,
                error: "",
                submissions,
              },
            })
          );
        } catch (error) {
          console.error(
            "Teacher submission loading error:",
            error
          );

          setTeacherSubmissionStates(
            (current) => ({
              ...current,
              [assignmentId]: {
                ...(current[
                  assignmentId
                ] || {}),
                open: true,
                loading: false,
                error:
                  error?.message ||
                  "Unable to load student submissions.",
                submissions: [],
              },
            })
          );
        }
      },
      [
        studentDirectory,
        loadStudentDirectory,
      ]
    );

  /* =======================================================
     STUDENT SUBMIT
  ======================================================= */

  const handleStudentSubmit =
    async ({
      assignment,
      files,
      text,
      existingSubmission,
    }) => {
      const assignmentId =
        getAssignmentId(
          assignment
        );

      if (!assignmentId) {
        window.alert(
          "Assignment ID is missing."
        );

        return;
      }

      try {
        setActionLoading(
          true
        );

        const formData =
          new FormData();

        if (text.trim()) {
          formData.append(
            "text",
            text.trim()
          );
        }

        files.forEach(
          (file) => {
            formData.append(
              "files",
              file
            );
          }
        );

        if (
          existingSubmission
        ) {
          await apiFetch(
            `/api/assignments/${assignmentId}/submission/`,
            {
              method: "PATCH",
              body: formData,
            }
          );
        } else {
          await apiFetch(
            `/api/assignments/${assignmentId}/submit/`,
            {
              method: "POST",
              body: formData,
            }
          );
        }

        setSubmissionDialog(
          null
        );

        await loadAssignments();
      } catch (error) {
        console.error(
          "Submission error:",
          error
        );

        window.alert(
          error?.message ||
            "Unable to submit assignment."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =======================================================
     DELETE STUDENT SUBMISSION
  ======================================================= */

  const handleDeleteSubmission =
    async (
      assignment,
      submission
    ) => {
      const assignmentId =
        getAssignmentId(
          assignment
        );

      if (!assignmentId) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete your submission?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        await apiFetch(
          `/api/assignments/${assignmentId}/submission/`,
          {
            method: "DELETE",
          }
        );

        await loadAssignments();
      } catch (error) {
        console.error(
          "Delete submission error:",
          error
        );

        window.alert(
          error?.message ||
            "Unable to delete submission."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =======================================================
     CREATE ASSIGNMENT
  ======================================================= */

  const handleCreateAssignment =
    async ({
      title,
      description,
      dueDate,
      files,
    }) => {
      try {
        setActionLoading(
          true
        );

        const formData =
          new FormData();

        formData.append(
          "title",
          title
        );

        formData.append(
          "description",
          description
        );

        if (dueDate) {
          formData.append(
            "due_date",
            dueDate
          );
        }

        files.forEach(
          (file) => {
            formData.append(
              "files",
              file
            );
          }
        );

        await apiFetch(
          "/api/assignments/",
          {
            method: "POST",
            body: formData,
          }
        );

        setAssignmentDialog(
          null
        );

        await loadAssignments();
      } catch (error) {
        console.error(
          "Create assignment error:",
          error
        );

        window.alert(
          error?.message ||
            "Unable to create assignment."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =======================================================
     UPDATE ASSIGNMENT
  ======================================================= */

  const handleUpdateAssignment =
    async ({
      assignment,
      title,
      description,
      dueDate,
      files,
    }) => {
      const assignmentId =
        getAssignmentId(
          assignment
        );

      if (!assignmentId) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        const formData =
          new FormData();

        formData.append(
          "title",
          title
        );

        formData.append(
          "description",
          description
        );

        if (dueDate) {
          formData.append(
            "due_date",
            dueDate
          );
        }

        files.forEach(
          (file) => {
            formData.append(
              "files",
              file
            );
          }
        );

        await apiFetch(
          `/api/assignments/${assignmentId}/`,
          {
            method: "PATCH",
            body: formData,
          }
        );

        setAssignmentDialog(
          null
        );

        await loadAssignments();
      } catch (error) {
        console.error(
          "Update assignment error:",
          error
        );

        window.alert(
          error?.message ||
            "Unable to update assignment."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =======================================================
     DELETE ASSIGNMENT
  ======================================================= */

  const handleDeleteAssignment =
    async (assignment) => {
      const assignmentId =
        getAssignmentId(
          assignment
        );

      if (!assignmentId) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete "${getAssignmentTitle(
            assignment
          )}"?\n\nThis action cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        await apiFetch(
          `/api/assignments/${assignmentId}/`,
          {
            method: "DELETE",
          }
        );

        setAssignments(
          (current) =>
            current.filter(
              (item) =>
                getAssignmentId(
                  item
                ) !==
                assignmentId
            )
        );

        setTeacherSubmissionStates(
          (current) => {
            const next = {
              ...current,
            };

            delete next[
              assignmentId
            ];

            return next;
          }
        );
      } catch (error) {
        console.error(
          "Delete assignment error:",
          error
        );

        window.alert(
          error?.message ||
            "Unable to delete assignment."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredAssignments =
    useMemo(() => {
      if (
        activeFilter ===
        "all"
      ) {
        return assignments;
      }

      if (
        activeFilter ===
        "submitted"
      ) {
        return assignments.filter(
          (assignment) =>
            Boolean(
              getStudentSubmission(
                assignment
              )
            )
        );
      }

      if (
        activeFilter ===
        "pending"
      ) {
        return assignments.filter(
          (assignment) =>
            !getStudentSubmission(
              assignment
            )
        );
      }

      return assignments;
    }, [
      activeFilter,
      assignments,
      getStudentSubmission,
    ]);

  /* =======================================================
     STUDENT STATS
  ======================================================= */

  const studentStats =
    useMemo(() => {
      if (!isStudent) {
        return {
          total:
            assignments.length,
          submitted: 0,
          pending: 0,
        };
      }

      const submitted =
        assignments.filter(
          (assignment) =>
            Boolean(
              getStudentSubmission(
                assignment
              )
            )
        ).length;

      return {
        total:
          assignments.length,
        submitted,
        pending:
          assignments.length -
          submitted,
      };
    }, [
      assignments,
      getStudentSubmission,
      isStudent,
    ]);

  /* =======================================================
     OPEN STUDENT SUBMISSION DIALOG
  ======================================================= */

  const openSubmissionDialog =
    (
      assignment,
      submission
    ) => {
      setSubmissionDialog({
        assignment,
        submission:
          submission || null,
      });
    };

  /* =======================================================
     OPEN ASSIGNMENT DIALOG
  ======================================================= */

  const openCreateDialog =
    () => {
      setAssignmentDialog({
        assignment: null,
      });
    };

  const openEditDialog =
    (assignment) => {
      setAssignmentDialog({
        assignment,
      });
    };

  /* =======================================================
     SAVE ASSIGNMENT
  ======================================================= */

  const handleSaveAssignment =
    async (payload) => {
      if (payload.assignment) {
        await handleUpdateAssignment(
          payload
        );
      } else {
        await handleCreateAssignment(
          payload
        );
      }
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Assignments
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  {isTeacher
                    ? "Create assignments and review student submissions."
                    : "View your assignments and submit your work."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                loadAssignments
              }
              disabled={
                loadingAssignments
              }
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  loadingAssignments &&
                    "animate-spin"
                )}
              />

              Refresh
            </button>

            {isTeacher && (
              <button
                type="button"
                onClick={
                  openCreateDialog
                }
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4" />

                New assignment
              </button>
            )}
          </div>
        </div>

        {/* ERROR */}

        {pageError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div className="min-w-0 flex-1">
              <p className="font-medium text-red-700 dark:text-red-400">
                Unable to load assignments
              </p>

              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {pageError}
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadAssignments
              }
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:text-red-400"
            >
              Try again
            </button>
          </div>
        )}

        {/* STUDENT STATS */}

        {isStudent &&
          !loadingAssignments && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total assignments
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {
                        studentStats.total
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-primary/10 p-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Submitted
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {
                        studentStats.submitted
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-100 p-3 dark:bg-green-950/30">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {
                        studentStats.pending
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-950/30">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* STUDENT FILTER */}

        {isStudent && (
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["pending", "Pending"],
              [
                "submitted",
                "Submitted",
              ],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      value
                    )
                  }
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition",
                    activeFilter ===
                      value
                      ? "bg-primary text-primary-foreground"
                      : "border bg-background hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              )
            )}
          </div>
        )}

        {/* LOADING */}

        {loadingAssignments && (
          <div className="flex min-h-80 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />

              <p className="text-sm">
                Loading assignments...
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}

        {!loadingAssignments &&
          !pageError &&
          filteredAssignments.length ===
            0 && (
            <div className="rounded-2xl border border-dashed p-12 text-center">
              <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

              <h2 className="text-lg font-semibold">
                {isTeacher
                  ? "No assignments yet"
                  : activeFilter ===
                    "submitted"
                  ? "No submitted assignments"
                  : activeFilter ===
                    "pending"
                  ? "No pending assignments"
                  : "No assignments available"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {isTeacher
                  ? "Create your first assignment to give students something to work on."
                  : "Assignments created by your teachers will appear here."}
              </p>

              {isTeacher && (
                <button
                  type="button"
                  onClick={
                    openCreateDialog
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />

                  Create assignment
                </button>
              )}
            </div>
          )}

        {/* ASSIGNMENTS */}

        {!loadingAssignments &&
          filteredAssignments.length >
            0 && (
            <div className="space-y-4">
              {filteredAssignments.map(
                (
                  assignment,
                  index
                ) => {
                  const assignmentId =
                    getAssignmentId(
                      assignment
                    ) || index;

                  if (isTeacher) {
                    return (
                      <TeacherAssignmentCard
                        key={
                          assignmentId
                        }
                        assignment={
                          assignment
                        }
                        submissionState={
                          teacherSubmissionStates[
                            assignmentId
                          ]
                        }
                        onLoadSubmissions={
                          loadTeacherSubmissions
                        }
                        onEdit={
                          openEditDialog
                        }
                        onDelete={
                          handleDeleteAssignment
                        }
                        studentDirectory={
                          studentDirectory
                        }
                      />
                    );
                  }

                  const submission =
                    getStudentSubmission(
                      assignment
                    );

                  return (
                    <StudentAssignmentCard
                      key={
                        assignmentId
                      }
                      assignment={
                        assignment
                      }
                      submission={
                        submission
                      }
                      onSubmit={
                        openSubmissionDialog
                      }
                      onDeleteSubmission={
                        handleDeleteSubmission
                      }
                      onRefresh={
                        loadAssignments
                      }
                    />
                  );
                }
              )}
            </div>
          )}
      </div>

      {/* STUDENT SUBMISSION MODAL */}

      {submissionDialog && (
        <SubmissionDialog
          assignment={
            submissionDialog.assignment
          }
          submission={
            submissionDialog.submission
          }
          onClose={() =>
            setSubmissionDialog(
              null
            )
          }
          onSubmit={
            handleStudentSubmit
          }
          loading={
            actionLoading
          }
        />
      )}

      {/* TEACHER ASSIGNMENT MODAL */}

      {assignmentDialog && (
        <AssignmentFormDialog
          assignment={
            assignmentDialog.assignment
          }
          onClose={() =>
            setAssignmentDialog(
              null
            )
          }
          onSave={
            handleSaveAssignment
          }
          loading={
            actionLoading
          }
        />
      )}

      {/* GLOBAL ACTION LOADING */}

      {actionLoading && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[60]">
          <div className="flex items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" />

            Saving...
          </div>
        </div>
      )}
    </div>
  );
}