from django.urls import path

from .views import GeneratorView, QuestionListView

urlpatterns = [
    path('programming/<int:user_id>/generators/', GeneratorView.as_view(), name='generate-question'),
    path('programming/<int:user_id>/questions/', QuestionListView.as_view(), name='question-list')
]