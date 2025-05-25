from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from .serializers import UserDifficultySerializer
from .models import UserDifficulty

class UserDifficultyView(APIView):
    def get(self, request, user_id):
        user_difficulty_OOP, created = UserDifficulty.objects.get_or_create(
            user_id=user_id,
            module='Object-Oriented Programming - IT2030',
            defaults={
                'difficulty': 'easy',  # Default values for new records
                'average': 0.0
            }
        )
        user_difficulty_DSA, created = UserDifficulty.objects.get_or_create(
            user_id=user_id,
            module='Data Structures & Algorithms - IT2070',
            defaults={
                'difficulty': 'easy',  # Default values for new records
                'average': 0.0
            }
        )
        user_difficulty_OOC, created = UserDifficulty.objects.get_or_create(
            user_id=user_id,
            module='Object Oriented Concepts - IT1050',
            defaults={
                'difficulty': 'easy',  # Default values for new records
                'average': 0.0
            }
        )
        user_difficulty_IP, created = UserDifficulty.objects.get_or_create(
            user_id=user_id,
            module='Introduction to Programming - IT1010',
            defaults={
                'difficulty': 'easy',  # Default values for new records
                'average': 0.0
            }
        )
        user_difficulty_IWT, created = UserDifficulty.objects.get_or_create(
            user_id=user_id,
            module='Internet And Web Technologies- IT1100',
            defaults={
                'difficulty': 'easy',  # Default values for new records
                'average': 0.0
            }
        )

        user_difficulty_OOP = UserDifficultySerializer(user_difficulty_OOP)
        user_difficulty_DSA = UserDifficultySerializer(user_difficulty_DSA)
        user_difficulty_OOC = UserDifficultySerializer(user_difficulty_OOC)
        user_difficulty_IP = UserDifficultySerializer(user_difficulty_IP)
        user_difficulty_IWT = UserDifficultySerializer(user_difficulty_IWT)

        user_difficulties = [user_difficulty_OOP.data, user_difficulty_DSA.data, user_difficulty_OOC.data, user_difficulty_IP.data, user_difficulty_IWT.data]

        return Response(data=user_difficulties, status=status.HTTP_200_OK)

    def post(self, request, user_id):
        body = request.data
        module = body.get('module')

        user_difficulty, created = UserDifficulty.objects.get_or_create(
            user_id=user_id,
            module=module,
            defaults={
                'difficulty': 'easy',  # Default values for new records
                'average': 0.0
            }
        )

        serializer = UserDifficultySerializer(user_difficulty)

        return Response(data=serializer.data, status=status.HTTP_200_OK)
