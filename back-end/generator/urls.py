from django.urls import path

from .views import GeneratorView

urlpatterns = [
    path('generator/', GeneratorView.as_view()),
]