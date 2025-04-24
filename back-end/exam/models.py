from django.db import models


class Exam(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    user_id = models.CharField(max_length=255, default='1')
    module = models.CharField(max_length=255)
    status = models.BooleanField(default=False)
    total_marks = models.IntegerField(default=0)
    student_marks = models.IntegerField(default=0)

    def __str__(self):
        return self.module