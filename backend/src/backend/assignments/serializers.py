from rest_framework import serializers

from .models import (
    Assignment,
    AssignmentFile,
    AssignmentSubmission,
    AssignmentSubmissionFile,
)


class AssignmentFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentFile
        fields = [
            "id",
            "original_name",
            "file_type",
            "file_size",
            "url",
        ]

    def get_url(self, obj):
        request = self.context.get("request")

        if not obj.file:
            return None

        url = obj.file.url

        if request:
            return request.build_absolute_uri(url)

        return url


class AssignmentSubmissionFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmissionFile
        fields = [
            "id",
            "original_name",
            "file_type",
            "file_size",
            "url",
        ]

    def get_url(self, obj):
        request = self.context.get("request")

        if not obj.file:
            return None

        url = obj.file.url

        if request:
            return request.build_absolute_uri(url)

        return url


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.username",
        read_only=True,
    )

    student_email = serializers.EmailField(
        source="student.email",
        read_only=True,
    )

    student_profile_image = serializers.SerializerMethodField()

    files = AssignmentSubmissionFileSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = AssignmentSubmission

        fields = [
            "id",

            # Student information
            "student",
            "student_name",
            "student_email",
            "student_profile_image",

            # Submission information
            "comment",
            "files",
            "submitted_at",
            "updated_at",
        ]

        read_only_fields = [
            "student",
            "student_name",
            "student_email",
            "student_profile_image",
            "submitted_at",
            "updated_at",
        ]

    def get_student_profile_image(self, obj):
        request = self.context.get("request")

        user = obj.student

        if not user.profile_picture:
            return None

        url = user.profile_picture.url

        if request:
            return request.build_absolute_uri(url)

        return url


class AssignmentSerializer(serializers.ModelSerializer):
    files = AssignmentFileSerializer(
        many=True,
        read_only=True,
    )

    created_by_name = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    submissions_count = serializers.SerializerMethodField()

    my_submission = serializers.SerializerMethodField()

    class Meta:
        model = Assignment

        fields = [
            "id",
            "title",
            "description",
            "subject",
            "due_date",
            "created_by",
            "created_by_name",
            "files",
            "submissions_count",
            "my_submission",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
        ]

    def get_submissions_count(self, obj):
        return obj.submissions.count()

    def get_my_submission(self, obj):
        request = self.context.get("request")

        if not request:
            return None

        if not request.user.is_authenticated:
            return None

        submission = (
            obj.submissions
            .filter(student=request.user)
            .prefetch_related("files")
            .first()
        )

        if not submission:
            return None

        return AssignmentSubmissionSerializer(
            submission,
            context=self.context,
        ).data