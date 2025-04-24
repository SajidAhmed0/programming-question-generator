from django.urls import path

from .views import ExamView

urlpatterns = [
    path('programming/<int:user_id>/exams/', ExamView.as_view(), name='exam-view')
]