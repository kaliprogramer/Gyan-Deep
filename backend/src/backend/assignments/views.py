from django.db import transaction

from rest_framework import status
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Assignment,
    AssignmentFile,
    AssignmentSubmission,
    AssignmentSubmissionFile,
)

from .serializers import (
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
)


# ============================================================
# ASSIGNMENT LIST + CREATE
# ============================================================

class AssignmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get(self, request):
        assignments = (
            Assignment.objects
            .select_related("created_by")
            .prefetch_related(
                "files",
                "submissions",
                "submissions__files",
            )
            .order_by("-created_at")
        )

        serializer = AssignmentSerializer(
            assignments,
            many=True,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def post(self, request):
        # Only teachers can create assignments
        if request.user.role != "teacher":
            return Response(
                {
                    "detail": "Only teachers can create assignments."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        title = request.data.get(
            "title",
            "",
        ).strip()

        description = request.data.get(
            "description",
            "",
        )

        subject = request.data.get(
            "subject",
            "",
        ).strip()

        due_date = request.data.get(
            "due_date",
        )

        files = request.FILES.getlist(
            "files"
        )

        if not title:
            return Response(
                {
                    "detail": "Title is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not subject:
            return Response(
                {
                    "detail": "Subject is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment = Assignment.objects.create(
            title=title,
            description=description,
            subject=subject,
            due_date=due_date or None,
            created_by=request.user,
        )

        for uploaded_file in files:
            AssignmentFile.objects.create(
                assignment=assignment,
                file=uploaded_file,
                original_name=uploaded_file.name,
                file_type=(
                    uploaded_file.content_type or ""
                ),
                file_size=uploaded_file.size,
            )

        serializer = AssignmentSerializer(
            assignment,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# ASSIGNMENT DETAIL
# ============================================================

class AssignmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_object(self, pk):
        try:
            return (
                Assignment.objects
                .select_related("created_by")
                .prefetch_related("files")
                .get(pk=pk)
            )
        except Assignment.DoesNotExist:
            return None

    def get(self, request, pk):
        assignment = self.get_object(pk)

        if not assignment:
            return Response(
                {
                    "detail": "Assignment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AssignmentSerializer(
            assignment,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        return self.update_assignment(
            request,
            pk,
        )

    def patch(self, request, pk):
        return self.update_assignment(
            request,
            pk,
        )

    @transaction.atomic
    def update_assignment(
        self,
        request,
        pk,
    ):
        assignment = self.get_object(pk)

        if not assignment:
            return Response(
                {
                    "detail": "Assignment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the teacher who created the assignment
        # can edit it.
        if request.user != assignment.created_by:
            return Response(
                {
                    "detail": (
                        "You can only edit your own assignments."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        title = request.data.get(
            "title",
            assignment.title,
        )

        description = request.data.get(
            "description",
            assignment.description,
        )

        subject = request.data.get(
            "subject",
            assignment.subject,
        )

        due_date = request.data.get(
            "due_date",
            assignment.due_date,
        )

        assignment.title = str(title).strip()
        assignment.description = description
        assignment.subject = str(subject).strip()
        assignment.due_date = due_date or None

        assignment.save()

        # Add newly uploaded assignment files
        files = request.FILES.getlist(
            "files"
        )

        for uploaded_file in files:
            AssignmentFile.objects.create(
                assignment=assignment,
                file=uploaded_file,
                original_name=uploaded_file.name,
                file_type=(
                    uploaded_file.content_type or ""
                ),
                file_size=uploaded_file.size,
            )

        serializer = AssignmentSerializer(
            assignment,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        assignment = self.get_object(pk)

        if not assignment:
            return Response(
                {
                    "detail": "Assignment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user != assignment.created_by:
            return Response(
                {
                    "detail": (
                        "You can only delete your own assignments."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# STUDENT SUBMIT ASSIGNMENT
# ============================================================

class AssignmentSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_assignment(self, pk):
        try:
            return (
                Assignment.objects
                .select_related("created_by")
                .get(pk=pk)
            )
        except Assignment.DoesNotExist:
            return None

    def post(self, request, pk):
        assignment = self.get_assignment(pk)

        if not assignment:
            return Response(
                {
                    "detail": "Assignment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only students can submit
        if request.user.role != "student":
            return Response(
                {
                    "detail": (
                        "Only students can submit assignments."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Prevent duplicate submissions
        if AssignmentSubmission.objects.filter(
            assignment=assignment,
            student=request.user,
        ).exists():
            return Response(
                {
                    "detail": (
                        "You have already submitted "
                        "this assignment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        comment = request.data.get(
            "comment",
            "",
        )

        comment = str(comment).strip()

        files = request.FILES.getlist(
            "files"
        )

        if not files:
            return Response(
                {
                    "detail": (
                        "At least one file is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            submission = AssignmentSubmission.objects.create(
                assignment=assignment,
                student=request.user,
                comment=comment,
            )

            for uploaded_file in files:
                AssignmentSubmissionFile.objects.create(
                    submission=submission,
                    file=uploaded_file,
                    original_name=uploaded_file.name,
                    file_type=(
                        uploaded_file.content_type or ""
                    ),
                    file_size=uploaded_file.size,
                )

        serializer = AssignmentSubmissionSerializer(
            submission,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# SUBMISSION DETAIL
#
# STUDENT:
#   GET    -> own submission
#   PATCH  -> edit own submission
#   PUT    -> edit own submission
#   DELETE -> delete own submission
#
# TEACHER:
#   GET    -> ALL submissions for their assignment
#
# ============================================================

class AssignmentSubmissionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    # --------------------------------------------------------
    # Get assignment safely
    # --------------------------------------------------------

    def get_assignment(self, assignment_id):
        try:
            return (
                Assignment.objects
                .select_related("created_by")
                .get(pk=assignment_id)
            )
        except Assignment.DoesNotExist:
            return None

    # --------------------------------------------------------
    # Get student's own submission
    # --------------------------------------------------------

    def get_student_submission(
        self,
        assignment_id,
        request,
    ):
        try:
            return (
                AssignmentSubmission.objects
                .select_related(
                    "student",
                    "assignment",
                )
                .prefetch_related("files")
                .get(
                    assignment_id=assignment_id,
                    student=request.user,
                )
            )
        except AssignmentSubmission.DoesNotExist:
            return None

    # --------------------------------------------------------
    # GET
    #
    # Student -> own submission
    # Teacher -> all submissions
    # --------------------------------------------------------

    def get(self, request, assignment_id):
        assignment = self.get_assignment(
            assignment_id
        )

        if not assignment:
            return Response(
                {
                    "detail": "Assignment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ====================================================
        # TEACHER
        # ====================================================

        if request.user.role == "teacher":

            # A teacher can only inspect submissions
            # belonging to assignments created by them.
            if assignment.created_by != request.user:
                return Response(
                    {
                        "detail": (
                            "You can only view submissions "
                            "for your own assignments."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            submissions = (
                AssignmentSubmission.objects
                .filter(
                    assignment=assignment
                )
                .select_related(
                    "student",
                    "assignment",
                )
                .prefetch_related(
                    "files"
                )
                .order_by(
                    "-submitted_at"
                )
            )

            serializer = AssignmentSubmissionSerializer(
                submissions,
                many=True,
                context={"request": request},
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        # ====================================================
        # STUDENT
        # ====================================================

        if request.user.role == "student":

            submission = self.get_student_submission(
                assignment_id,
                request,
            )

            if not submission:
                return Response(
                    {
                        "detail": "Submission not found."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = AssignmentSubmissionSerializer(
                submission,
                context={"request": request},
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "detail": "Invalid user role."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # --------------------------------------------------------
    # PUT
    # --------------------------------------------------------

    @transaction.atomic
    def put(
        self,
        request,
        assignment_id,
    ):
        return self.update_submission(
            request,
            assignment_id,
        )

    # --------------------------------------------------------
    # PATCH
    # --------------------------------------------------------

    @transaction.atomic
    def patch(
        self,
        request,
        assignment_id,
    ):
        return self.update_submission(
            request,
            assignment_id,
        )

    # --------------------------------------------------------
    # UPDATE STUDENT SUBMISSION
    # --------------------------------------------------------

    def update_submission(
        self,
        request,
        assignment_id,
    ):
        assignment = self.get_assignment(
            assignment_id
        )

        if not assignment:
            return Response(
                {
                    "detail": "Assignment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only students can edit submissions
        if request.user.role != "student":
            return Response(
                {
                    "detail": (
                        "Only students can edit "
                        "their submissions."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        submission = self.get_student_submission(
            assignment_id,
            request,
        )

        if not submission:
            return Response(
                {
                    "detail": "Submission not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        comment = request.data.get(
            "comment",
            submission.comment,
        )

        submission.comment = str(comment)
        submission.save()

        # Add newly uploaded files
        files = request.FILES.getlist(
            "files"
        )

        for uploaded_file in files:
            AssignmentSubmissionFile.objects.create(
                submission=submission,
                file=uploaded_file,
                original_name=uploaded_file.name,
                file_type=(
                    uploaded_file.content_type or ""
                ),
                file_size=uploaded_file.size,
            )

        submission.refresh_from_db()

        serializer = AssignmentSubmissionSerializer(
            submission,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # DELETE STUDENT SUBMISSION
    # --------------------------------------------------------

    @transaction.atomic
    def delete(
        self,
        request,
        assignment_id,
    ):
        assignment = self.get_assignment(
            assignment_id
        )

        if not assignment:
            return Response(
                {
                    "detail": "Assignment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only students can delete their submissions
        if request.user.role != "student":
            return Response(
                {
                    "detail": (
                        "Only students can delete "
                        "their submissions."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        submission = self.get_student_submission(
            assignment_id,
            request,
        )

        if not submission:
            return Response(
                {
                    "detail": "Submission not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        submission.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )