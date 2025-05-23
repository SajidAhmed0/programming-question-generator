from django.db import models


class ProgrammingQuestion(models.Model):
    title = models.TextField()
    description = models.TextField()
    language = models.CharField(max_length=50, choices=[('python', 'Python'), ('javascript', 'Java Script'), ('java', 'Java'), ('cpp', 'Cpp'), ('c', 'C'), ('php', 'PHP')])
    difficulty = models.CharField(max_length=50, choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')])
    question_type = models.CharField(max_length=50, choices=[('mcq', 'MCQ'), ('short-answer', 'Short Answer'), ('coding', 'Coding')])
    code_snippet = models.TextField(blank=True, null=True)  # For coding questions
    options = models.JSONField(blank=True, null=True)  # For MCQs
    correct_option = models.CharField(max_length=255, blank=True, null=True)  # Correct answer for MCQs
    expected_output = models.TextField(blank=True, null=True)  # For coding questions
    expected_answers = models.JSONField(blank=True, null=True)  # For short-answer questions
    validated = models.BooleanField(default=False)
    retry_count = models.IntegerField(default=0)  # Track retries
    last_failure_reason = models.TextField(blank=True, null=True)  # Failure reason
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_id = models.CharField(max_length=255, default='1')
    module = models.CharField(max_length=255, blank=True, null=True)
    exam_id = models.CharField(max_length=255, default='1')
    allocated_marks = models.IntegerField(default=0)
    student_marks = models.IntegerField(default=0)
    student_answer = models.TextField(blank=True, null=True)
    answered = models.BooleanField(default=False)
    is_correct = models.BooleanField(default=False)
    answer_feedback = models.TextField(default='')

    def __str__(self):
        return self.title