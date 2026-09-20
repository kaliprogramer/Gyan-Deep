from django.contrib import admin
from .models import Note, NoteFile, NoteComment
# Register your models here.

admin.site.register(Note)
admin.site.register(NoteFile)
admin.site.register(NoteComment)