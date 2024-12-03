import docker


def validate_code(language, code, test_input, expected_output):
    """
    Validate code using a Docker-based sandbox.
    """
    client = docker.from_env()
    container = None

    try:
        # Create a container for the required language
        image = "python:3.9" if language == "python" else None
        container = client.containers.run(
            image=image,
            command=f"python -c '{code}'",
            stdin_open=True,
            stdout=True,
            stderr=True,
            detach=True,
        )

        # Send test input
        stdin = container.attach(stdin=True, logs=False)
        stdin.write(test_input.encode())
        stdin.close()

        # Get output
        logs = container.logs()
        actual_output = logs.decode().strip()
        return actual_output == expected_output, actual_output

    except Exception as e:
        return False, str(e)

    finally:
        if container:
            container.remove()