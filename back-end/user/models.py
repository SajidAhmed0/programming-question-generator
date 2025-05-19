from django.db import models


class UserDifficulty(models.Model):
    user_id = models.CharField(max_length=255, default='1')
    difficulty = models.CharField(max_length=50, choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')])
    module = models.CharField(max_length=255)
    average = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        blank=True,
        null=True
    )

    class Meta:
        unique_together = (('user_id', 'module'),)  # Creates composite primary key
        verbose_name_plural = "User Difficulties"

    def __str__(self):
        return f"{self.user_id} - {self.module} (Difficulty: {self.difficulty})"