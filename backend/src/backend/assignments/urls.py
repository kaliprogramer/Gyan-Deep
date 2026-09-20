from django.urls import path

from .views import (
    AssignmentListCreateView,
    AssignmentDetailView,
    AssignmentSubmissionView,
    AssignmentSubmissionDetailView,
)


urlpatterns = [
    # ========================================================
    # ASSIGNMENTS
    # ========================================================

    path(
        "",
        AssignmentListCreateView.as_view(),
        name="assignment-list",
    ),

    path(
        "<int:pk>/",
        AssignmentDetailView.as_view(),
        name="assignment-detail",
    ),

    # ========================================================
    # STUDENT SUBMIT
    # POST /api/assignments/<id>/submit/
    # ========================================================

    path(
        "<int:pk>/submit/",
        AssignmentSubmissionView.as_view(),
        name="assignment-submit",
    ),

    # ========================================================
    # SUBMISSION
    #
    # Student:
    #   GET    -> own submission
    #   PATCH  -> edit own submission
    #   PUT    -> edit own submission
    #   DELETE -> delete own submission
    #
    # Teacher:
    #   GET    -> all student submissions
    # ========================================================

    path(
        "<int:assignment_id>/submission/",
        AssignmentSubmissionDetailView.as_view(),
        name="assignment-submission-detail",
    ),
]