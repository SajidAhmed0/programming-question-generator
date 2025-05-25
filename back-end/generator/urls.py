from django.urls import path

from .views import GeneratorView, QuestionListView, QuestionAnswerView

urlpatterns = [
    path('programming/<str:user_id>/generators/', GeneratorView.as_view(), name='generate-question'),
    path('programming/<str:user_id>/questions/', QuestionListView.as_view(), name='question-list'),
    path('programming/<str:user_id>/questions/<int:question_id>/answers', QuestionAnswerView.as_view(), name='question-answer')
]