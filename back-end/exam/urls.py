from django.urls import path

from .views import ExamView, ExamAnswerView

urlpatterns = [
    path('programming/<int:user_id>/exams/', ExamView.as_view(), name='exam-view'),
    path('programming/<int:user_id>/exams/<int:exam_id>/answers/', ExamAnswerView.as_view(), name='exam-anser-view')
]