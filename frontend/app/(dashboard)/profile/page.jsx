// "use client";

// import { useMemo, useState } from "react";
// import Image from "next/image";
// import {
//   BookOpen,
//   CheckCircle2,
//   ChevronRight,
//   Clock3,
//   Download,
//   FileText,
//   Heart,
//   MessageCircle,
//   MoreHorizontal,
//   Pencil,
//   Send,
//   Users,
//   GraduationCap,
//   ClipboardList,
//   Upload,
//   X,
// } from "lucide-react";

// /*
// |--------------------------------------------------------------------------
// | Demo user
// |--------------------------------------------------------------------------
// | Replace this with your real /auth/me/ response.
// |
// | Example:
// |
// | const [user, setUser] = useState(null)
// |
// */

// const studentUser = {
//   id: 3,
//   username: "kiran kc",
//   email: "kiran@example.com",
//   role: "student",
//   profile_image: null,
//   bio: "BSc CSIT student • Learning AI & Computer Science",
// };

// const teacherUser = {
//   id: 5,
//   username: "Ram Sharma",
//   email: "ram@example.com",
//   role: "teacher",
//   profile_image: null,
//   bio: "Physics Teacher • Gyan Deep College",
// };

// /*
// |--------------------------------------------------------------------------
// | Demo data
// |--------------------------------------------------------------------------
// */

// const studentNotes = [
//   {
//     id: 1,
//     title: "Full Wave Rectifier",
//     subject: "Physics",
//     description:
//       "Complete notes covering center-tapped full wave rectifier and working principle.",
//     type: "PDF",
//     likes: 24,
//     comments: 6,
//     downloads: 18,
//     date: "2 days ago",
//   },
//   {
//     id: 2,
//     title: "Semiconductor",
//     subject: "Physics",
//     description:
//       "Basic concepts of intrinsic and extrinsic semiconductors.",
//     type: "PDF",
//     likes: 18,
//     comments: 3,
//     downloads: 12,
//     date: "5 days ago",
//   },
//   {
//     id: 3,
//     title: "C Programming Functions",
//     subject: "Programming in C",
//     description:
//       "Functions, parameters, return values and function prototypes.",
//     type: "PDF",
//     likes: 32,
//     comments: 9,
//     downloads: 26,
//     date: "1 week ago",
//   },
//   {
//     id: 4,
//     title: "AC and DC",
//     subject: "Physics",
//     description:
//       "Difference between alternating current and direct current.",
//     type: "PDF",
//     likes: 14,
//     comments: 2,
//     downloads: 9,
//     date: "1 week ago",
//   },
//   {
//     id: 5,
//     title: "Calculus Basics",
//     subject: "Mathematics",
//     description:
//       "Important derivative and integration formulas.",
//     type: "PDF",
//     likes: 29,
//     comments: 7,
//     downloads: 22,
//     date: "2 weeks ago",
//   },
//   {
//     id: 6,
//     title: "Information Technology",
//     subject: "IT",
//     description:
//       "Introduction to information technology and computer systems.",
//     type: "PDF",
//     likes: 11,
//     comments: 1,
//     downloads: 7,
//     date: "2 weeks ago",
//   },
// ];

// const submittedAssignments = [
//   {
//     id: 1,
//     title: "Full Wave Rectifier",
//     subject: "Physics",
//     teacher: "Mr. Sharma",
//     submittedAt: "Sep 19, 2026",
//     status: "submitted",
//     grade: null,
//   },
//   {
//     id: 2,
//     title: "C Functions Assignment",
//     subject: "Programming in C",
//     teacher: "Mrs. Karki",
//     submittedAt: "Sep 17, 2026",
//     status: "graded",
//     grade: "18/20",
//   },
//   {
//     id: 3,
//     title: "Derivative Problems",
//     subject: "Mathematics",
//     teacher: "Mr. Thapa",
//     submittedAt: "Sep 14, 2026",
//     status: "graded",
//     grade: "17/20",
//   },
//   {
//     id: 4,
//     title: "Computer Network Basics",
//     subject: "IT",
//     teacher: "Mr. Sharma",
//     submittedAt: "Sep 10, 2026",
//     status: "late",
//     grade: null,
//   },
// ];

// const completedAssignments = [
//   {
//     id: 1,
//     title: "C Functions Assignment",
//     subject: "Programming in C",
//     completedAt: "Sep 17, 2026",
//     grade: "18/20",
//   },
//   {
//     id: 2,
//     title: "Derivative Problems",
//     subject: "Mathematics",
//     completedAt: "Sep 14, 2026",
//     grade: "17/20",
//   },
//   {
//     id: 3,
//     title: "Information Technology",
//     subject: "IT",
//     completedAt: "Sep 8, 2026",
//     grade: "19/20",
//   },
// ];

// const teacherAssignments = [
//   {
//     id: 1,
//     title: "Full Wave Rectifier",
//     subject: "Physics",
//     dueDate: "Sep 25, 2026",
//     students: 32,
//     submitted: 24,
//     graded: 18,
//     status: "active",
//   },
//   {
//     id: 2,
//     title: "Semiconductor Questions",
//     subject: "Physics",
//     dueDate: "Sep 22, 2026",
//     students: 32,
//     submitted: 19,
//     graded: 12,
//     status: "active",
//   },
//   {
//     id: 3,
//     title: "AC and DC",
//     subject: "Physics",
//     dueDate: "Sep 18, 2026",
//     students: 30,
//     submitted: 27,
//     graded: 27,
//     status: "completed",
//   },
// ];

// const teacherNotes = [
//   {
//     id: 1,
//     title: "Semiconductor",
//     subject: "Physics",
//     description:
//       "Introduction to semiconductor materials and their applications.",
//     type: "PDF",
//     likes: 43,
//     comments: 11,
//     downloads: 37,
//     date: "1 day ago",
//   },
//   {
//     id: 2,
//     title: "Diodes",
//     subject: "Physics",
//     description:
//       "PN junction diode, biasing and characteristics.",
//     type: "PDF",
//     likes: 36,
//     comments: 8,
//     downloads: 31,
//     date: "4 days ago",
//   },
//   {
//     id: 3,
//     title: "Rectifier",
//     subject: "Physics",
//     description:
//       "Detailed explanation of rectification and applications.",
//     type: "PDF",
//     likes: 51,
//     comments: 14,
//     downloads: 45,
//     date: "1 week ago",
//   },
// ];

// /*
// |--------------------------------------------------------------------------
// | Helpers
// |--------------------------------------------------------------------------
// */

// function getInitials(name = "") {
//   return name
//     .split(" ")
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((word) => word[0]?.toUpperCase())
//     .join("");
// }

// function formatRole(role) {
//   return role === "teacher" ? "Teacher" : "Student";
// }

// /*
// |--------------------------------------------------------------------------
// | Main Component
// |--------------------------------------------------------------------------
// */

// export default function ProfilePage() {
//   /*
//    * Change this to:
//    *
//    * const user = studentUser
//    *
//    * to preview student.
//    *
//    * Or:
//    *
//    * const user = teacherUser
//    *
//    * to preview teacher.
//    */

//   const [user] = useState(studentUser);

//   const isTeacher = user.role === "teacher";

//   const [activeTab, setActiveTab] = useState(
//     isTeacher ? "notes" : "notes"
//   );

//   const [likedNotes, setLikedNotes] = useState([]);

//   const [showEditProfile, setShowEditProfile] = useState(false);

//   const tabs = useMemo(() => {
//     if (isTeacher) {
//       return [
//         {
//           id: "notes",
//           label: "Notes",
//           icon: FileText,
//         },
//         {
//           id: "assignments",
//           label: "Assignments",
//           icon: ClipboardList,
//         },
//       ];
//     }

//     return [
//       {
//         id: "notes",
//         label: "Notes",
//         icon: FileText,
//       },
//       {
//         id: "submitted",
//         label: "Submitted",
//         icon: Send,
//       },
//       {
//         id: "completed",
//         label: "Completed",
//         icon: CheckCircle2,
//       },
//     ];
//   }, [isTeacher]);

//   const toggleLike = (noteId) => {
//     setLikedNotes((current) =>
//       current.includes(noteId)
//         ? current.filter((id) => id !== noteId)
//         : [...current, noteId]
//     );
//   };

//   return (
//     <div className="min-h-screen bg-background text-foreground">
//       <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

//         {/* =========================================================
//             PROFILE HEADER
//         ========================================================= */}

//         <section className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">

//           {/* Decorative background */}
//           <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />

//           <div className="relative px-5 pb-6 pt-8 sm:px-8">

//             <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

//               {/* Profile picture */}
//               <div className="shrink-0">
//                 {user.profile_image ? (
//                   <Image
//                     src={user.profile_image}
//                     alt={user.username}
//                     width={120}
//                     height={120}
//                     className="h-28 w-28 rounded-full border-4 border-background object-cover shadow-lg sm:h-32 sm:w-32"
//                   />
//                 ) : (
//                   <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-background bg-primary text-3xl font-bold text-primary-foreground shadow-lg sm:h-32 sm:w-32">
//                     {getInitials(user.username)}
//                   </div>
//                 )}
//               </div>

//               {/* Profile information */}
//               <div className="min-w-0 flex-1">

//                 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

//                   <div>
//                     <div className="flex flex-wrap items-center gap-2">
//                       <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
//                         {user.username}
//                       </h1>

//                       <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
//                         <GraduationCap className="h-3.5 w-3.5" />
//                         {formatRole(user.role)}
//                       </span>
//                     </div>

//                     <p className="mt-1 text-sm text-muted-foreground">
//                       @{user.username.replace(/\s+/g, "").toLowerCase()}
//                     </p>
//                   </div>

//                   <button
//                     onClick={() => setShowEditProfile(true)}
//                     className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-medium transition hover:bg-muted"
//                   >
//                     <Pencil className="h-4 w-4" />
//                     Edit profile
//                   </button>
//                 </div>

//                 {/* Bio */}
//                 <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
//                   {user.bio}
//                 </p>

//                 {/* Stats */}
//                 <div className="mt-6 grid max-w-xl grid-cols-3 gap-2 sm:flex sm:gap-8">

//                   <Stat
//                     value={
//                       isTeacher
//                         ? teacherNotes.length
//                         : studentNotes.length
//                     }
//                     label="Notes"
//                   />

//                   {isTeacher ? (
//                     <Stat
//                       value={teacherAssignments.length}
//                       label="Assignments"
//                     />
//                   ) : (
//                     <>
//                       <Stat
//                         value={submittedAssignments.length}
//                         label="Submitted"
//                       />

//                       <Stat
//                         value={completedAssignments.length}
//                         label="Completed"
//                       />
//                     </>
//                   )}
//                 </div>

//                 {/* Account info */}
//                 <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
//                   <span>{user.email}</span>

//                   <span className="flex items-center gap-1">
//                     <BookOpen className="h-3.5 w-3.5" />
//                     Gyan Deep College
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* =========================================================
//             TABS
//         ========================================================= */}

//         <section className="mt-6 border-b">
//           <div className="flex overflow-x-auto scrollbar-none">

//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               const active = activeTab === tab.id;

//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`relative flex min-w-[120px] items-center justify-center gap-2 px-5 py-4 text-sm font-medium transition ${
//                     active
//                       ? "text-foreground"
//                       : "text-muted-foreground hover:text-foreground"
//                   }`}
//                 >
//                   <Icon className="h-4 w-4" />
//                   {tab.label}

//                   {active && (
//                     <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-foreground" />
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </section>

//         {/* =========================================================
//             CONTENT
//         ========================================================= */}

//         <section className="py-6">

//           {/* STUDENT NOTES */}
//           {!isTeacher && activeTab === "notes" && (
//             <NotesGrid
//               notes={studentNotes}
//               likedNotes={likedNotes}
//               onLike={toggleLike}
//             />
//           )}

//           {/* STUDENT SUBMISSIONS */}
//           {!isTeacher && activeTab === "submitted" && (
//             <SubmissionList assignments={submittedAssignments} />
//           )}

//           {/* STUDENT COMPLETED */}
//           {!isTeacher && activeTab === "completed" && (
//             <CompletedList assignments={completedAssignments} />
//           )}

//           {/* TEACHER NOTES */}
//           {isTeacher && activeTab === "notes" && (
//             <NotesGrid
//               notes={teacherNotes}
//               likedNotes={likedNotes}
//               onLike={toggleLike}
//             />
//           )}

//           {/* TEACHER ASSIGNMENTS */}
//           {isTeacher && activeTab === "assignments" && (
//             <TeacherAssignmentList assignments={teacherAssignments} />
//           )}
//         </section>
//       </main>

//       {/* =========================================================
//           EDIT PROFILE MODAL
//       ========================================================= */}

//       {showEditProfile && (
//         <EditProfileModal
//           user={user}
//           onClose={() => setShowEditProfile(false)}
//         />
//       )}
//     </div>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Stat
// |--------------------------------------------------------------------------
// */

// function Stat({ value, label }) {
//   return (
//     <div className="text-center sm:text-left">
//       <div className="text-xl font-bold">{value}</div>
//       <div className="text-xs text-muted-foreground sm:text-sm">
//         {label}
//       </div>
//     </div>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Notes Grid
// |--------------------------------------------------------------------------
// */

// function NotesGrid({ notes, likedNotes, onLike }) {
//   if (!notes.length) {
//     return <EmptyState title="No notes yet" />;
//   }

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//       {notes.map((note) => (
//         <NoteCard
//           key={note.id}
//           note={note}
//           liked={likedNotes.includes(note.id)}
//           onLike={() => onLike(note.id)}
//         />
//       ))}
//     </div>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Note Card
// |--------------------------------------------------------------------------
// */

// function NoteCard({ note, liked, onLike }) {
//   return (
//     <article className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg">

//       {/* Preview */}
//       <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted">

//         <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

//         <div className="relative flex flex-col items-center gap-3">
//           <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-sm">
//             <FileText className="h-8 w-8 text-primary" />
//           </div>

//           <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold shadow-sm">
//             {note.type}
//           </span>
//         </div>

//         <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-sm transition group-hover:opacity-100">
//           <MoreHorizontal className="h-4 w-4" />
//         </button>
//       </div>

//       {/* Information */}
//       <div className="p-4">

//         <div className="mb-2 flex items-center justify-between gap-3">
//           <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
//             {note.subject}
//           </span>

//           <span className="text-xs text-muted-foreground">
//             {note.date}
//           </span>
//         </div>

//         <h3 className="line-clamp-1 font-semibold">
//           {note.title}
//         </h3>

//         <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
//           {note.description}
//         </p>

//         {/* Actions */}
//         <div className="mt-4 flex items-center justify-between border-t pt-3">

//           <div className="flex items-center gap-4">

//             <button
//               onClick={onLike}
//               className={`flex items-center gap-1.5 text-xs transition ${
//                 liked
//                   ? "text-red-500"
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               <Heart
//                 className={`h-4 w-4 ${
//                   liked ? "fill-current" : ""
//                 }`}
//               />
//               {note.likes + (liked ? 1 : 0)}
//             </button>

//             <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
//               <MessageCircle className="h-4 w-4" />
//               {note.comments}
//             </button>

//             <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
//               <Download className="h-4 w-4" />
//               {note.downloads}
//             </button>
//           </div>

//           <button className="text-xs font-medium text-primary hover:underline">
//             View
//           </button>
//         </div>
//       </div>
//     </article>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Student Submission List
// |--------------------------------------------------------------------------
// */

// function SubmissionList({ assignments }) {
//   if (!assignments.length) {
//     return <EmptyState title="No assignments submitted yet" />;
//   }

//   return (
//     <div className="mx-auto max-w-4xl space-y-3">
//       {assignments.map((assignment) => (
//         <div
//           key={assignment.id}
//           className="group rounded-2xl border bg-card p-4 transition hover:shadow-md sm:p-5"
//         >
//           <div className="flex items-start gap-4">

//             <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:flex">
//               <Send className="h-5 w-5 text-primary" />
//             </div>

//             <div className="min-w-0 flex-1">

//               <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
//                 <div>
//                   <div className="flex flex-wrap items-center gap-2">
//                     <h3 className="font-semibold">
//                       {assignment.title}
//                     </h3>

//                     <StatusBadge status={assignment.status} />
//                   </div>

//                   <p className="mt-1 text-sm text-muted-foreground">
//                     {assignment.subject} • {assignment.teacher}
//                   </p>
//                 </div>

//                 <button className="flex items-center gap-1 text-sm font-medium text-primary">
//                   View
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>

//               <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
//                 <span className="flex items-center gap-1.5">
//                   <Clock3 className="h-3.5 w-3.5" />
//                   Submitted {assignment.submittedAt}
//                 </span>

//                 {assignment.grade && (
//                   <span className="font-semibold text-foreground">
//                     Grade: {assignment.grade}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Completed Assignments
// |--------------------------------------------------------------------------
// */

// function CompletedList({ assignments }) {
//   if (!assignments.length) {
//     return <EmptyState title="No completed assignments yet" />;
//   }

//   return (
//     <div className="mx-auto max-w-4xl space-y-3">
//       {assignments.map((assignment) => (
//         <div
//           key={assignment.id}
//           className="flex items-center gap-4 rounded-2xl border bg-card p-4 sm:p-5"
//         >
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500/10">
//             <CheckCircle2 className="h-5 w-5 text-green-600" />
//           </div>

//           <div className="min-w-0 flex-1">
//             <h3 className="truncate font-semibold">
//               {assignment.title}
//             </h3>

//             <p className="mt-1 text-sm text-muted-foreground">
//               {assignment.subject} • Completed {assignment.completedAt}
//             </p>
//           </div>

//           <div className="hidden text-right sm:block">
//             <div className="text-sm font-semibold">
//               {assignment.grade}
//             </div>

//             <div className="text-xs text-muted-foreground">
//               Grade
//             </div>
//           </div>

//           <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
//         </div>
//       ))}
//     </div>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Teacher Assignments
// |--------------------------------------------------------------------------
// */

// function TeacherAssignmentList({ assignments }) {
//   if (!assignments.length) {
//     return <EmptyState title="No assignments created yet" />;
//   }

//   return (
//     <div className="mx-auto max-w-4xl space-y-4">
//       {assignments.map((assignment) => {
//         const submissionPercentage =
//           assignment.students > 0
//             ? Math.round(
//                 (assignment.submitted / assignment.students) * 100
//               )
//             : 0;

//         return (
//           <article
//             key={assignment.id}
//             className="rounded-2xl border bg-card p-5 shadow-sm"
//           >
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

//               <div className="flex gap-4">
//                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
//                   <ClipboardList className="h-5 w-5 text-primary" />
//                 </div>

//                 <div>
//                   <div className="flex flex-wrap items-center gap-2">
//                     <h3 className="font-semibold">
//                       {assignment.title}
//                     </h3>

//                     <span
//                       className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
//                         assignment.status === "completed"
//                           ? "bg-green-500/10 text-green-600"
//                           : "bg-blue-500/10 text-blue-600"
//                       }`}
//                     >
//                       {assignment.status === "completed"
//                         ? "Completed"
//                         : "Active"}
//                     </span>
//                   </div>

//                   <p className="mt-1 text-sm text-muted-foreground">
//                     {assignment.subject}
//                   </p>
//                 </div>
//               </div>

//               <button className="inline-flex items-center justify-center gap-1 text-sm font-medium text-primary">
//                 Manage
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>

//             {/* Progress */}
//             <div className="mt-5">
//               <div className="mb-2 flex items-center justify-between text-xs">
//                 <span className="text-muted-foreground">
//                   Submission progress
//                 </span>

//                 <span className="font-medium">
//                   {assignment.submitted}/{assignment.students}
//                 </span>
//               </div>

//               <div className="h-2 overflow-hidden rounded-full bg-muted">
//                 <div
//                   className="h-full rounded-full bg-primary transition-all"
//                   style={{
//                     width: `${submissionPercentage}%`,
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="mt-5 grid grid-cols-3 divide-x rounded-xl border bg-muted/30">

//               <MiniStat
//                 icon={Users}
//                 value={assignment.students}
//                 label="Students"
//               />

//               <MiniStat
//                 icon={Send}
//                 value={assignment.submitted}
//                 label="Submitted"
//               />

//               <MiniStat
//                 icon={CheckCircle2}
//                 value={assignment.graded}
//                 label="Graded"
//               />
//             </div>

//             <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
//               <span>Due {assignment.dueDate}</span>

//               <span className="font-medium text-foreground">
//                 {submissionPercentage}% submitted
//               </span>
//             </div>
//           </article>
//         );
//       })}
//     </div>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Mini Stat
// |--------------------------------------------------------------------------
// */

// function MiniStat({ icon: Icon, value, label }) {
//   return (
//     <div className="flex flex-col items-center gap-1 py-3">
//       <Icon className="h-4 w-4 text-muted-foreground" />

//       <span className="text-sm font-semibold">
//         {value}
//       </span>

//       <span className="text-[10px] text-muted-foreground sm:text-xs">
//         {label}
//       </span>
//     </div>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Status Badge
// |--------------------------------------------------------------------------
// */

// function StatusBadge({ status }) {
//   const styles = {
//     submitted: "bg-blue-500/10 text-blue-600",
//     graded: "bg-green-500/10 text-green-600",
//     late: "bg-orange-500/10 text-orange-600",
//   };

//   const labels = {
//     submitted: "Submitted",
//     graded: "Graded",
//     late: "Late",
//   };

//   return (
//     <span
//       className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
//         styles[status] || "bg-muted text-muted-foreground"
//       }`}
//     >
//       {labels[status] || status}
//     </span>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Empty State
// |--------------------------------------------------------------------------
// */

// function EmptyState({ title }) {
//   return (
//     <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 text-center">
//       <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
//         <FileText className="h-6 w-6 text-muted-foreground" />
//       </div>

//       <h3 className="mt-4 font-semibold">
//         {title}
//       </h3>

//       <p className="mt-1 max-w-sm text-sm text-muted-foreground">
//         Content uploaded or created by this user will appear here.
//       </p>
//     </div>
//   );
// }

// /*
// |--------------------------------------------------------------------------
// | Edit Profile Modal
// |--------------------------------------------------------------------------
// */

// function EditProfileModal({ user, onClose }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

//       <div className="w-full max-w-lg overflow-hidden rounded-3xl border bg-background shadow-2xl">

//         {/* Header */}
//         <div className="flex items-center justify-between border-b px-5 py-4">
//           <div>
//             <h2 className="font-semibold">
//               Edit profile
//             </h2>

//             <p className="text-xs text-muted-foreground">
//               Update your Gyan Deep profile
//             </p>
//           </div>

//           <button
//             onClick={onClose}
//             className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="space-y-5 p-5">

//           {/* Avatar */}
//           <div className="flex items-center gap-4">
//             <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
//               {getInitials(user.username)}
//             </div>

//             <button className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted">
//               <Upload className="h-4 w-4" />
//               Change photo
//             </button>
//           </div>

//           {/* Name */}
//           <div>
//             <label className="mb-2 block text-sm font-medium">
//               Name
//             </label>

//             <input
//               defaultValue={user.username}
//               className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary"
//             />
//           </div>

//           {/* Bio */}
//           <div>
//             <label className="mb-2 block text-sm font-medium">
//               Bio
//             </label>

//             <textarea
//               defaultValue={user.bio}
//               rows={4}
//               className="w-full resize-none rounded-xl border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary"
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex justify-end gap-2">
//             <button
//               onClick={onClose}
//               className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted"
//             >
//               Cancel
//             </button>

//             <button
//               onClick={onClose}
//               className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
//             >
//               Save changes
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import React from 'react'

function underworking() {
  return (
    <div className='items-center justify-content'>

        <h1 className='text-3xl font-bold text-center mt-20'>Profile - This page is under working</h1>
    </div>
  )
}

export default underworking