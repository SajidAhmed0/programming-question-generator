from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from .serializers import UserDifficultySerializer
from .models import UserDifficulty

class UserDifficultyView(APIView):
    def get(self, request):
        user_difficulties = UserDifficulty.objects.all()
        serializer = UserDifficultySerializer(user_difficulties, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        body = request.data
        name = body.get('name')
        email = body.get('email')
        password = body.get('password')

        user = UserDifficulty(name=name, email=email, password=password)

        user.save()

        serializer = UserDifficultySerializer(user)

        return Response(data=serializer.data, status=status.HTTP_200_OK)
