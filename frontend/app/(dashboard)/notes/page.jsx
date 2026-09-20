"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  File,
  FileText,
  FileUp,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Plus,
  Presentation,
  Send,
  Trash2,
  UploadCloud,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {apiFetch} from "@/hooks/lib/api/apifetch";
/* =========================================================
   CONFIG
========================================================= */

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ACCEPTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".ppt",
  ".pptx",
];

/* =========================================================
   HELPERS
========================================================= */

const formatBytes = (bytes = 0) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  const formatted = value.toFixed(index === 0 ? 0 : 1);
  return `${formatted} ${units[index]}`;
};

const getFileType = (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (file.type?.startsWith("image/")) return "image";
  if (file.type === "application/pdf" || extension === "pdf") return "pdf";
  if (
    file.type?.includes("powerpoint") ||
    extension === "ppt" ||
    extension === "pptx"
  ) {
    return "presentation";
  }
  return "file";
};

const getFileIcon = (type) => {
  switch (type) {
    case "image":
      return ImageIcon;
    case "pdf":
      return FileText;
    case "presentation":
      return Presentation;
    default:
      return File;
  }
};

const resolveFileUrl = (url) => {
  if (!url) return null;
  // Absolute URL
  if (/^https?:\/\//i.test(url)) return url;
  try {
    if (!API_URL) return url;
    return new URL(url, API_URL).toString();
  } catch {
    return url;
  }
};

const getDownloadName = (name = "download") => {
  const cleaned = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
  return cleaned || "download";
};

const isImageFile = (file) => {
  if (!file) return false;
  const type = file.file_type || file.type || "";
  return type.startsWith("image/");
};

/* =========================================================
   DOWNLOAD FILE
========================================================= */

const downloadFile = async (file) => {
  const url = resolveFileUrl(file?.url);
  if (!url) {
    throw new Error("This file does not have a valid download URL.");
  }

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Unable to download ${file.original_name || "file"}.`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = getDownloadName(file.original_name || "file");
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Defer revocation so Firefox/Safari don't cancel the download.
  setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
};

/* =========================================================
   LOCAL FILE
========================================================= */

const createLocalFile = (file) => ({
  id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(36)
    .slice(2)}`,
  file,
  name: file.name,
  size: file.size,
  type: getFileType(file),
  previewUrl: file.type?.startsWith("image/")
    ? URL.createObjectURL(file)
    : null,
  progress: 0,
  status: "waiting",
  error: null,
});

/* =========================================================
   FILE PREVIEW (for upload grid)
========================================================= */

function FilePreview({ item }) {
  const Icon = getFileIcon(item.type);

  if (item.type === "image" && item.previewUrl) {
    return (
      <div className="relative h-36 w-full overflow-hidden rounded-xl bg-muted">
        <img
          src={item.previewUrl}
          alt={item.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-2 bottom-2 rounded-lg bg-black/60 px-2 py-1.5 text-xs text-white backdrop-blur">
          <p className="truncate">{item.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-36 w-full flex-col items-center justify-center rounded-xl bg-muted/60">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-background shadow-sm">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <span className="max-w-[85%] truncate text-sm font-medium">
        {item.name}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">
        {item.type === "pdf"
          ? "PDF document"
          : item.type === "presentation"
            ? "PowerPoint presentation"
            : formatBytes(item.size)}
      </span>
    </div>
  );
}

/* =========================================================
   UPLOAD FILE CARD
========================================================= */

function UploadFileCard({ item, onRemove }) {
  return (
    <div className="group relative rounded-2xl border bg-card p-3 shadow-sm transition hover:shadow-md">
      <div className="relative">
        <FilePreview item={item} />

        {item.status === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-sm">
            <div className="w-[75%]">
              <div className="mb-2 flex items-center justify-between text-xs font-medium">
                <span>Uploading...</span>
                <span>{item.progress}%</span>
              </div>
              <Progress value={item.progress} />
            </div>
          </div>
        )}

        {item.status === "success" && (
          <div className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
        )}

        {item.status === "error" && (
          <div className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(item.size)}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => onRemove(item.id)}
          disabled={item.status === "uploading"}
          aria-label={`Remove ${item.name}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {item.error && (
        <p className="mt-2 text-xs leading-5 text-destructive">{item.error}</p>
      )}
    </div>
  );
}

/* =========================================================
   COMMENT ITEM
========================================================= */

function CommentItem({ comment }) {
  console.log("CommentItem comment:", comment);
  const avatar = comment?.user_profile_picture;

  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
        {avatar ? (
          <img
            src={resolveFileUrl(avatar)}
            alt={comment.uploaded_by_name || "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1 rounded-2xl bg-muted/60 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">
            {comment.user_name || "User"}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {comment.created_at
              ? new Date(comment.created_at).toLocaleDateString()
              : ""}
          </span>
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
          {comment.text || comment.comment || ""}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FACEBOOK-STYLE IMAGE GRID
========================================================= */

function NoteImageGrid({ images, onOpen }) {
  const count = images.length;
  if (!count) return null;

  const Tile = ({ file, className = "", overlay = null }) => (
    <button
      type="button"
      onClick={() => onOpen(images.indexOf(file))}
      className={`group relative overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      <img
        src={resolveFileUrl(file.url)}
        alt={file.original_name || "Image"}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        loading="lazy"
        draggable={false}
      />
      {overlay}
    </button>
  );

  // 1 image — full width
  if (count === 1) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border">
        <Tile file={images[0]} className="h-full w-full" />
      </div>
    );
  }

  // 2 images — side by side
  if (count === 2) {
    return (
      <div className="grid aspect-video grid-cols-2 gap-1 overflow-hidden rounded-2xl border">
        {images.map((file) => (
          <Tile key={file.id} file={file} className="h-full w-full" />
        ))}
      </div>
    );
  }

  // 3 images — 1 big left, 2 stacked right
  if (count === 3) {
    return (
      <div className="grid aspect-video grid-cols-2 gap-1 overflow-hidden rounded-2xl border">
        <Tile file={images[0]} className="row-span-2 h-full w-full" />
        <Tile file={images[1]} className="h-full w-full" />
        <Tile file={images[2]} className="h-full w-full" />
      </div>
    );
  }

  // 4+ images — 2x2 with +N overlay on the last tile
  const visible = images.slice(0, 4);
  const remaining = count - 4;

  return (
    <div className="grid aspect-video grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-2xl border">
      {visible.map((file, i) => {
        const isLast = i === 3 && remaining > 0;
        return (
          <Tile
            key={file.id}
            file={file}
            className="h-full w-full"
            overlay={
              isLast ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-semibold text-white">
                  +{remaining}
                </div>
              ) : null
            }
          />
        );
      })}
    </div>
  );
}

/* =========================================================
   IMAGE SLIDER (professional lightbox)
========================================================= */

function ImageSlider({ images, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)),
  );
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");

  const current = images[index];

  const goNext = useCallback(() => {
    if (!images.length) return;
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    if (!images.length) return;
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const handleDownload = async (file) => {
    try {
      setError("");
      setDownloadingId(file.id);
      await downloadFile(file);
    } catch (err) {
      setError(err?.message || "Unable to download file.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {current.original_name || "Image"}
          </p>
          <p className="text-xs text-white/60">
            {index + 1} of {images.length}
            {current.file_size ? ` · ${formatBytes(current.file_size)}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => handleDownload(current)}
            disabled={downloadingId === current.id}
          >
            {downloadingId === current.id ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-6">
        {images.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <img
          key={current.id || current.url}
          src={resolveFileUrl(current.url)}
          alt={current.original_name || "Note image"}
          className="max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl"
          draggable={false}
        />

        {images.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-destructive px-4 py-2 text-sm text-white shadow-lg">
            {error}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="border-t border-white/10 px-4 py-3">
          <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={img.id || img.url || i}
                type="button"
                onClick={() => setIndex(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === index
                    ? "border-white"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
                aria-label={`Go to image ${i + 1}`}
              >
                <img
                  src={resolveFileUrl(img.url)}
                  alt={img.original_name || `Thumbnail ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   NOTE CARD
========================================================= */

function NoteCard({ note, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderStart, setSliderStart] = useState(0);

  const files = useMemo(
    () => (Array.isArray(note.files) ? note.files : []),
    [note.files],
  );
  const comments = useMemo(
    () => (Array.isArray(note.comments) ? note.comments : []),
    [note.comments],
  );

  const imageFiles = useMemo(() => files.filter(isImageFile), [files]);
  const nonImageFiles = useMemo(
    () => files.filter((f) => !isImageFile(f)),
    [files],
  );

  const totalFiles = files.length;
  const isLiked = note.liked ?? note.is_liked ?? false;

  /* =========================================================
     COMMENT SUBMIT
  ========================================================= */

  const submitComment = async (e) => {
    e?.preventDefault?.();

    const text = comment.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      setCommentError("");
      await onComment(note.id, text);
      setComment("");
    } catch (error) {
      console.error("Comment error:", error);
      setCommentError(
        error?.message || "Unable to add your comment. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  /* =========================================================
     DOWNLOAD SINGLE
  ========================================================= */

  const handleDownload = async (file) => {
    if (!file?.url || downloadingId) return;

    try {
      setDownloadError("");
      setDownloadingId(file.id);
      await downloadFile(file);
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(
        error?.message ||
          `Unable to download ${file.original_name || "this file"}.`,
      );
    } finally {
      setDownloadingId(null);
    }
  };

  /* =========================================================
     DOWNLOAD ALL
  ========================================================= */

  const downloadAll = async () => {
    if (!files.length || downloadingId === "all") return;

    const downloadableFiles = files.filter((file) => file?.url);
    if (!downloadableFiles.length) {
      setDownloadError("No downloadable files were found.");
      return;
    }

    try {
      setDownloadError("");
      setDownloadingId("all");

      for (const file of downloadableFiles) {
        try {
          await downloadFile(file);
          await new Promise((resolve) => setTimeout(resolve, 250));
        } catch (error) {
          console.error(`Failed to download ${file.original_name}`, error);
        }
      }
    } finally {
      setDownloadingId(null);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <Card className="overflow-hidden border shadow-sm transition hover:shadow-md">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                {note.uploaded_by_profile_picture ? (
                  <img
                    src={note.uploaded_by_profile_picture}
                    alt={note.uploaded_by_name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0">
                <CardTitle className="truncate text-lg">{note.title}</CardTitle>
                <CardDescription className="mt-1">
                  {note.uploaded_by_name || "Unknown user"}
                  {note.created_at && (
                    <> · {new Date(note.created_at).toLocaleDateString()}</>
                  )}
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Download all files"
              onClick={downloadAll}
              disabled={downloadingId === "all" || totalFiles === 0}
              title="Download all files"
            >
              {downloadingId === "all" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
            </Button>
          </div>

          {note.description && (
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {note.description}
            </p>
          )}
        </CardHeader>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <CardContent className="space-y-4">
          {/* ---------------- FACEBOOK-STYLE IMAGE GRID ---------------- */}

          {imageFiles.length > 0 && (
            <NoteImageGrid
              images={imageFiles}
              onOpen={(index) => {
                setSliderStart(index);
                setSliderOpen(true);
              }}
            />
          )}

          {/* ---------------- FILE LIST (non-image) ---------------- */}

          {nonImageFiles.length > 0 && (
            <div className="space-y-2">
              {nonImageFiles.map((file) => {
                const isPdf = file.file_type === "application/pdf";
                const isPpt = file.file_type?.includes("powerpoint");
                const Icon = isPdf ? FileText : isPpt ? Presentation : File;
                const isDownloading = downloadingId === file.id;

                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        title={file.original_name}
                      >
                        {file.original_name || "Unnamed file"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.file_size)}
                      </p>
                    </div>

                    {file.url && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => handleDownload(file)}
                        disabled={isDownloading || downloadingId === "all"}
                        aria-label={`Download ${file.original_name || "file"}`}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------- DOWNLOAD ERROR ---------------- */}

          {downloadError && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="min-w-0 flex-1">{downloadError}</p>
              <button
                type="button"
                className="shrink-0 opacity-70 hover:opacity-100"
                onClick={() => setDownloadError("")}
                aria-label="Dismiss download error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ---------------- ACTIONS ---------------- */}

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={
                isLiked
                  ? "text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  : ""
              }
              onClick={() => onLike(note.id)}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`}
              />
              {note.likes_count || 0}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowComments((value) => !value);
                setCommentError("");
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {note.comments_count ?? comments.length}
              {showComments ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </Button>
          </div>

          {/* ---------------- COMMENTS ---------------- */}

          {showComments && (
            <div className="space-y-4 border-t pt-4">
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {comments.map((item) => (
                  <CommentItem key={item.id} comment={item} />
                ))}

                {!comments.length && (
                  <div className="rounded-xl border border-dashed p-6 text-center">
                    <MessageCircle className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No comments yet. Start the discussion.
                    </p>
                  </div>
                )}
              </div>

              {commentError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="min-w-0 flex-1">{commentError}</p>
                  <button
                    type="button"
                    onClick={() => setCommentError("")}
                    className="shrink-0 opacity-70 hover:opacity-100"
                    aria-label="Dismiss comment error"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <form onSubmit={submitComment} className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    value={comment}
                    onChange={(event) => {
                      setComment(event.target.value);
                      if (commentError) setCommentError("");
                    }}
                    placeholder="Write a comment..."
                    maxLength={1000}
                    disabled={sending}
                    aria-label="Write a comment"
                  />
                  <p className="mt-1 text-right text-[11px] text-muted-foreground">
                    {comment.length}/1000
                  </p>
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!comment.trim() || sending}
                  aria-label="Send comment"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          IMAGE SLIDER DIALOG
      ===================================================== */}

      {sliderOpen && imageFiles.length > 0 && (
        <ImageSlider
          images={imageFiles}
          initialIndex={sliderStart}
          onClose={() => setSliderOpen(false)}
        />
      )}
    </>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function NotesPage() {
  const inputRef = useRef(null);
  const xhrRef = useRef(null);

  /* ---------------- NOTES ---------------- */
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState("");

  /* ---------------- MODAL ---------------- */
  const [open, setOpen] = useState(false);

  /* ---------------- FORM ---------------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  /* ---------------- UPLOAD ---------------- */
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  /* =========================================================
     LOAD NOTES
  ========================================================= */

const loadNotes = useCallback(async () => {
  try {
    setLoadingNotes(true);
    setNotesError("");

    const data = await apiFetch("/api/notes/", {
      method: "GET",
    });

    const noteList = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : [];

    setNotes(noteList);
  } catch (error) {
    console.error("Load notes error:", error);

    setNotesError(
      error instanceof Error
        ? error.message
        : "Unable to load notes."
    );
  } finally {
    setLoadingNotes(false);
  }
}, []);

useEffect(() => {
  loadNotes();
}, [loadNotes]);

console.log("Notes loaded:", notes);

  /* =========================================================
     CLEANUP PREVIEW URLS + XHR ON UNMOUNT
  ========================================================= */

  useEffect(() => {
    return () => {
      // Abort in-flight upload
      try {
        xhrRef.current?.abort?.();
      } catch {
        /* noop */
      }
    };
  }, []);

  const revokePreviewUrls = useCallback((items) => {
    items.forEach((item) => {
      if (item?.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          /* noop */
        }
      }
    });
  }, []);

  /* =========================================================
     ADD FILES
  ========================================================= */

  const addFiles = useCallback((selectedFiles) => {
    const incoming = Array.from(selectedFiles || []);
    if (!incoming.length) return;

    setFiles((previous) => {
      const existing = new Set(
        previous.map(
          (item) => `${item.name}-${item.size}-${item.file.lastModified}`,
        ),
      );

      const accepted = [];

      for (const file of incoming) {
        const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const validType =
          ACCEPTED_TYPES.includes(file.type) ||
          ACCEPTED_EXTENSIONS.includes(extension);
        const key = `${file.name}-${file.size}-${file.lastModified}`;

        if (existing.has(key)) continue;

        if (!validType) {
          const item = createLocalFile(file);
          item.status = "error";
          item.error =
            "This file type is not supported. Use PDF, PPT, PPTX, JPG, PNG, WEBP, or GIF.";
          accepted.push(item);
          existing.add(key);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          const item = createLocalFile(file);
          item.status = "error";
          item.error = "Maximum file size is 25 MB.";
          accepted.push(item);
          existing.add(key);
          continue;
        }

        accepted.push(createLocalFile(file));
        existing.add(key);
      }

      return [...previous, ...accepted];
    });
  }, []);

  /* =========================================================
     DROP / INPUT
  ========================================================= */

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (uploading) return;
      setDragActive(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles, uploading],
  );

  const handleFileInput = (event) => {
    if (uploading) return;
    addFiles(event.target.files);
    event.target.value = "";
  };

  /* =========================================================
     REMOVE / CLEAR FILES
  ========================================================= */

  const removeFile = (id) => {
    if (uploading) return;
    setFiles((previous) => {
      const target = previous.find((item) => item.id === id);
      if (target?.previewUrl) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {
          /* noop */
        }
      }
      return previous.filter((item) => item.id !== id);
    });
  };

  const clearFiles = () => {
    if (uploading) return;
    revokePreviewUrls(files);
    setFiles([]);
  };

  /* =========================================================
     DERIVED
  ========================================================= */

  const validFiles = useMemo(
    () => files.filter((item) => item.status !== "error"),
    [files],
  );

  const totalSize = useMemo(
    () => validFiles.reduce((sum, item) => sum + item.size, 0),
    [validFiles],
  );

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = useCallback(() => {
    revokePreviewUrls(files);
    setFiles([]);
    setTitle("");
    setDescription("");
    setOverallProgress(0);
    setDragActive(false);
    if (inputRef.current) inputRef.current.value = "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, revokePreviewUrls]);

  /* =========================================================
     UPLOAD NOTE
  ========================================================= */

  const handleUpload = async () => {
    if (uploading) return;
    if (!title.trim()) return;
    if (!validFiles.length) return;

    try {
      setUploading(true);
      setOverallProgress(0);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      validFiles.forEach((item) => formData.append("files", item.file));

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.open("POST", `${API_URL}/api/notes/`);
        xhr.withCredentials = true;

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const progress = Math.round((event.loaded / event.total) * 100);
          setOverallProgress(progress);
          setFiles((previous) =>
            previous.map((item) => {
              if (item.status === "error") return item;
              return {
                ...item,
                status: progress < 100 ? "uploading" : "success",
                progress,
              };
            }),
          );
        };

        xhr.onload = () => {
          xhrRef.current = null;
          let data = {};
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            data = {};
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(
              new Error(
                data?.detail || data?.message || "Unable to upload note.",
              ),
            );
          }
        };

        xhr.onerror = () => {
          xhrRef.current = null;
          reject(new Error("Network error while uploading."));
        };
        xhr.onabort = () => {
          xhrRef.current = null;
          reject(new Error("Upload cancelled."));
        };

        xhr.send(formData);
      });

      setOverallProgress(100);
      await loadNotes();
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((previous) =>
        previous.map((item) =>
          item.status !== "success"
            ? {
                ...item,
                status: "error",
                error: error?.message || "Upload failed.",
              }
            : item,
        ),
      );
    } finally {
      setUploading(false);
    }
  };

  /* =========================================================
     LIKE
  ========================================================= */

  const handleLike = async (noteId) => {
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}/like/`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || "Unable to update like.",
        );
      }

      setNotes((previous) =>
        previous.map((note) => {
          if (note.id !== noteId) return note;
          const liked = data?.liked ?? data?.is_liked ?? !note.liked;
          const likesCount =
            data?.likes_count ??
            (liked
              ? (note.likes_count || 0) + 1
              : Math.max((note.likes_count || 0) - 1, 0));
          return {
            ...note,
            liked,
            is_liked: liked,
            likes_count: likesCount,
          };
        }),
      );
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  /* =========================================================
     COMMENT
  ========================================================= */

  const handleComment = async (noteId, text) => {
    const cleanText = (text || "").trim();

    if (!cleanText) {
      throw new Error("Comment cannot be empty.");
    }

    const response = await fetch(`${API_URL}/api/notes/${noteId}/comments/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      // Send BOTH keys so it works regardless of backend serializer.
      body: JSON.stringify({ text: cleanText, comment: cleanText }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let message = data?.detail || data?.message || "Unable to add comment.";

      if (Array.isArray(data?.text) && data.text.length) {
        message = data.text[0];
      }
      if (Array.isArray(data?.comment) && data.comment.length) {
        message = data.comment[0];
      }

      throw new Error(message);
    }

    setNotes((previous) =>
      previous.map((note) => {
        if (note.id !== noteId) return note;
        const oldComments = Array.isArray(note.comments) ? note.comments : [];
        return {
          ...note,
          comments: [...oldComments, data],
          comments_count: data?.comments_count ?? oldComments.length + 1,
        };
      }),
    );
  };

  /* =========================================================
     MODAL
  ========================================================= */

  const handleModalChange = (value) => {
    if (uploading) return;
    setOpen(value);
    if (!value) resetForm();
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Notes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Study materials shared by your classmates.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            className="shrink-0 self-start sm:self-auto"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>

        {/* DIALOG */}
        <Dialog open={open} onOpenChange={handleModalChange}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add a new note</DialogTitle>
              <DialogDescription>
                Upload study materials for your classmates.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* TITLE */}
              <div className="space-y-2">
                <label htmlFor="note-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="note-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Physics Chapter 3 Notes"
                  maxLength={255}
                  disabled={uploading}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <label
                  htmlFor="note-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <Textarea
                  id="note-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Briefly describe these notes..."
                  className="min-h-24 resize-none"
                  maxLength={2000}
                  disabled={uploading}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {description.length}/2000
                </p>
              </div>

              {/* DROPZONE */}
              <div
                role="button"
                tabIndex={uploading ? -1 : 0}
                aria-disabled={uploading}
                onClick={() => {
                  if (!uploading) inputRef.current?.click();
                }}
                onKeyDown={(event) => {
                  if (uploading) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  if (!uploading) setDragActive(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!uploading) setDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                className={`flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                } ${
                  uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  hidden
                  accept={ACCEPTED_EXTENSIONS.join(",")}
                  onChange={handleFileInput}
                  disabled={uploading}
                />

                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm">
                  <FileUp className="h-6 w-6 text-primary" />
                </div>

                <p className="font-semibold">
                  {dragActive ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {["PDF", "PPT", "PPTX", "JPG", "PNG", "WEBP"].map((type) => (
                    <span
                      key={type}
                      className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Maximum 25 MB per file
                </p>
              </div>

              {/* FILES */}
              {files.length > 0 && (
                <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">Selected files</h3>
                      <p className="text-sm text-muted-foreground">
                        {files.length} {files.length === 1 ? "file" : "files"} ·{" "}
                        {formatBytes(totalSize)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFiles}
                      disabled={uploading}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {files.map((item) => (
                      <UploadFileCard
                        key={item.id}
                        item={item}
                        onRemove={removeFile}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* PROGRESS */}
              {uploading && (
                <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Uploading...</span>
                    <span className="text-muted-foreground">
                      {overallProgress}%
                    </span>
                  </div>
                  <Progress value={overallProgress} />
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleModalChange(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={
                    uploading || !title.trim() || validFiles.length === 0
                  }
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Publish Note
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* COUNT */}
        {!loadingNotes && !notesError && notes.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </div>
        )}

        {/* LOADING */}
        {loadingNotes && (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading notes...</p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loadingNotes && notesError && (
          <Card>
            <CardContent className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
              <h3 className="font-semibold">Could not load notes</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {notesError}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={loadNotes}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* EMPTY */}
        {!loadingNotes && !notesError && notes.length === 0 && (
          <Card>
            <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No notes yet</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Start sharing study materials with your classmates.
              </p>
              <Button
                type="button"
                className="mt-5"
                onClick={() => setOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first note
              </Button>
            </CardContent>
          </Card>
        )}

        {/* NOTES */}
        {!loadingNotes && !notesError && notes.length > 0 && (
          <div className="space-y-5">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
