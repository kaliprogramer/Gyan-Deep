from django.urls import path

from .views import (
    NoteListCreateView,
    NoteLikeView,
    NoteCommentView,
)


urlpatterns = [
    path(
        "",
        NoteListCreateView.as_view(),
        name="notes",
    ),

    path(
        "<int:pk>/like/",
        NoteLikeView.as_view(),
        name="note-like",
    ),

    path(
        "<int:pk>/comments/",
        NoteCommentView.as_view(),
        name="note-comments",
    ),
]