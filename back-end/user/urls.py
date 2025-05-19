from django.urls import path

from .views import UserDifficultyView

urlpatterns = [
    path('user_difficulties/', UserDifficultyView.as_view(), name='user-difficulty-view')
]