from django.db import transaction

from rest_framework import status
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Note, NoteFile, NoteComment
from .serializers import (
    NoteSerializer,
    NoteCommentSerializer,
)


class NoteListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get(self, request):
        notes = (
            Note.objects
            .select_related("uploaded_by")
            .prefetch_related(
                "files",
                "likes",
                "comments__user",
            )
            .order_by("-created_at")
        )

        serializer = NoteSerializer(
            notes,
            many=True,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def post(self, request):
        title = request.data.get("title")
        description = request.data.get(
            "description",
            "",
        )

        files = request.FILES.getlist("files")

        if not title or not title.strip():
            return Response(
                {
                    "detail": "Title is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not files:
            return Response(
                {
                    "detail": "At least one file is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        note = Note.objects.create(
            title=title.strip(),
            description=description,
            uploaded_by=request.user,
        )

        for uploaded_file in files:
            NoteFile.objects.create(
                note=note,
                file=uploaded_file,
                original_name=uploaded_file.name,
                file_type=(
                    uploaded_file.content_type or ""
                ),
                file_size=uploaded_file.size,
            )

        serializer = NoteSerializer(
            note,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class NoteLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            note = Note.objects.get(pk=pk)
        except Note.DoesNotExist:
            return Response(
                {
                    "detail": "Note not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user

        if note.likes.filter(id=user.id).exists():
            note.likes.remove(user)
            liked = False
        else:
            note.likes.add(user)
            liked = True

        return Response(
            {
                "liked": liked,
                "likes_count": note.likes.count(),
            },
            status=status.HTTP_200_OK,
        )


class NoteCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            note = Note.objects.get(pk=pk)
        except Note.DoesNotExist:
            return Response(
                {
                    "detail": "Note not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        comment = request.data.get("comment", "").strip()

        if not comment:
            return Response(
                {
                    "detail": "Comment cannot be empty."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        note_comment = NoteComment.objects.create(
            note=note,
            user=request.user,
            comment=comment,
        )

        serializer = NoteCommentSerializer(
            note_comment,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )