from django.db import models


class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.TextField()
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.email