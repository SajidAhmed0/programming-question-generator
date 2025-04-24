from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from .serializers import ExamSerializer
from .models import Exam

class ExamView(APIView):
    def get(self, request, user_id):
        
        exams = Exam.objects.all()
        serializer = ExamSerializer(exams, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def post(self, request, user_id):
        body = request.data

        module = body.get('module')

        exam = Exam(module=module)

        exam.save()

        serializer = ExamSerializer(exam)

        return Response(data=serializer.data, status=status.HTTP_200_OK)
