import docker


def validate_code(language, code_snippet):
    """
    Validate a code snippet using a Docker-based sandbox.

    Args:
        language (str): The programming language (e.g., "python").
        code_snippet (str): The code snippet to validate.

    Returns:
        dict: Result with keys `is_valid` (bool) and `output` (str).
    """
    client = docker.from_env()
    container = None

    # Map supported languages to Docker images and commands
    language_config = {
        "python": {
            "image": "python:3.9",  # Python 3.9 Docker image
            "command": lambda code: f"python -c \"{code}\"",  # Run Python code via -c option
        },
        # Add more languages here if needed
    }

    if language not in language_config:
        return {"is_valid": False, "feedback": f"Unsupported language: {language}"}

    try:
        # Get the Docker image and command for the language
        image = language_config[language]["image"]
        command = language_config[language]["command"](code_snippet)

        # Create and run the container
        container = client.containers.run(
            image=image,
            command=command,
            stdout=True,  # Capture stdout
            stderr=True,  # Capture stderr
            detach=True,  # Run in detached mode
        )

        # Wait for the container to complete execution
        container.wait(timeout=5)  # Set timeout for execution

        # Fetch logs (output)
        logs = container.logs(stdout=True, stderr=True).decode().strip()

        # Return success if no errors occurred
        return {"is_valid": True, "feedback": logs}

    except docker.errors.ContainerError as e:
        return {"is_valid": False, "feedback": f"ContainerError: {e.stderr.decode().strip()}"}
    except docker.errors.ImageNotFound:
        return {"is_valid": False, "feedback": f"Error: Docker image for {language} not found"}
    except docker.errors.APIError as e:
        return {"is_valid": False, "feedback": f"APIError: {str(e)}"}
    except Exception as e:
        return {"is_valid": False, "feedback": f"Unexpected error: {str(e)}"}

    finally:
        # Ensure the container is removed after execution
        if container:
            container.remove(force=True)

