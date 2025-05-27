# Stage 2: Build Django app with Poetry
FROM python:3.13 AS django-build
# Install Poetry
ENV POETRY_VERSION=1.6.1
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"
# Set environment variables to prevent virtual environment creation
ENV POETRY_VIRTUALENVS_CREATE=false
ENV POETRY_VIRTUALENVS_IN_PROJECT=false
WORKDIR /app/back-end
# Copy only the necessary files first for poetry install
COPY .env ./
COPY ./pyproject.toml ./poetry.lock ./
RUN poetry install --no-dev --no-interaction --no-ansi --no-root
# Verify that Django is installed
RUN poetry show django
# Copy Django app
COPY ./ ./

# Expose port for Django
EXPOSE 8000
# Start Django server
CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000", "--noreload"]