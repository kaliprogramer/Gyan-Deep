from rest_framework import serializers

from .models import Note, NoteFile, NoteComment


class NoteFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = NoteFile
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


class NoteCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    user_profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = NoteComment
        fields = [
            "id",
            "user_name",
            "user_profile_picture",
            "comment",
            "created_at",
        ]

    def get_user_profile_picture(self, obj):
        request = self.context.get("request")

        user = obj.user

        if not getattr(user, "profile_picture", None):
            return None

        url = user.profile_picture.url

        if request:
            return request.build_absolute_uri(url)

        return url


class NoteSerializer(serializers.ModelSerializer):
    files = NoteFileSerializer(many=True, read_only=True)
    comments = NoteCommentSerializer(many=True, read_only=True)

    uploaded_by_name = serializers.CharField(
        source="uploaded_by.username",
        read_only=True,
    )

    uploaded_by_profile_picture = serializers.SerializerMethodField()

    likes_count = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "description",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_by_profile_picture",
            "files",
            "likes_count",
            "liked",
            "comments",
            "created_at",
            "updated_at",
        ]

    def get_uploaded_by_profile_picture(self, obj):
        request = self.context.get("request")

        user = obj.uploaded_by

        if not getattr(user, "profile_picture", None):
            return None

        url = user.profile_picture.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_liked(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return obj.likes.filter(id=request.user.id).exists()