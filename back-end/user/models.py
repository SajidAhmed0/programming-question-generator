from django.db import models


class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.TextField()
    name = models.CharField(max_length=255)
    average = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        blank=True,
        null=True
    )

    def __str__(self):
        return self.email