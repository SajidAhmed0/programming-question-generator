from django.urls import path

from .views import ExamView, ExamListView, ExamAnswerView, ExamStaticView

urlpatterns = [
    path('programming/<int:user_id>/exams/', ExamListView.as_view(), name='exam-list-view'),
    path('programming/<int:user_id>/exams/<int:exam_id>/', ExamView.as_view(), name='exam-view'),
    path('programming/<int:user_id>/exams/<int:exam_id>/answers/', ExamAnswerView.as_view(), name='exam-answer-view'),
    path('programming/<int:user_id>/exam_statics', ExamStaticView.as_view(), name='exam-static-view')
]