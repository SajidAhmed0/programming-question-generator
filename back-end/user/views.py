from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from .serializers import UserSerializer
from .models import User

class UserView(APIView):
    def get(self, request):
        questions = User.objects.all()
        serializer = UserSerializer(questions, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        body = request.data
        name = body.get('name')
        email = body.get('email')
        password = body.get('password')

        user = User(name=name, email=email, password=password)

        user.save()

        serializer = UserSerializer(user)

        return Response(data=serializer.data, status=status.HTTP_200_OK)
