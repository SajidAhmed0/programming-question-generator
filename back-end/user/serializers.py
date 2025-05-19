from rest_framework import serializers
from .models import UserDifficulty

class UserDifficultySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDifficulty
        fields = '__all__'  # Use `['field1', 'field2']` for specific fields