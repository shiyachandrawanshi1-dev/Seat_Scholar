from django.contrib import admin

from .models import Student, Room, ExamSession

admin.site.register(Student)
admin.site.register(Room)
admin.site.register(ExamSession)

