import multiprocessing

import execjs

import subprocess
import tempfile

def execute_code_snippet_java(java_code):
    try:
        # Create a temporary directory to store the Java file
        with tempfile.TemporaryDirectory() as temp_dir:
            # Generate a temporary file name for the Java file
            java_file = f"{temp_dir}/Main.java"

            # Write the Java code to the temporary file
            with open(java_file, "w") as file:
                file.write(java_code)

            # Compile the Java code using javac
            compile_process = subprocess.run(
                ["javac", java_file],
                capture_output=True,
                text=True
            )

            # Check if there were compilation errors
            if compile_process.returncode != 0:
                return {"is_valid": False, "feedback": compile_process.stderr}

            # Run the compiled Java code using java
            class_name = "Main"  # Assuming the class name is Main
            run_process = subprocess.run(
                ["java", "-cp", temp_dir, class_name],
                capture_output=True,
                text=True
            )

            # Return the output or error
            if run_process.returncode == 0:
                return {"is_valid": True, "feedback": run_process.stdout}
            else:
                return {"is_valid": False, "feedback": run_process.stderr}

    except Exception as e:
        return {"is_valid": False, "feedback": str(e)}

def execute_code_snippet_javascript(code):
    try:
        # Create a Node.js runtime environment
        ctx = execjs.compile("""
        function run() {
            return eval(arguments[0]);
        }
        """)
        result = ctx.call("run", code)
        return {"is_valid": True, "feedback": result}
    except Exception as e:
        return {"is_valid": False, "feedback": str(e)}

def execute_code_snippet_python(code_snippet, result_queue):
    """
    Executes the given code snippet in a separate process.
    """
    try:
        exec(code_snippet, {'__builtins__': {}})
        result_queue.put({"is_valid": True, "feedback": "Code ran successfully"})
    except Exception as e:
        result_queue.put({"is_valid": False, "feedback": str(e)})

def validate_coding_sandboxed(code_snippet, language, timeout=2):
    """
    Validates a coding question in a sandboxed environment using multiprocessing.
    """
    if not isinstance(code_snippet, str):
        return {"is_valid": False, "feedback": "Invalid code_snippet format"}

    # Create a queue to retrieve results from the child process
    result_queue = multiprocessing.Queue()
    if language == 'python':
        process = multiprocessing.Process(target=execute_code_snippet_python, args=(code_snippet, result_queue))
    elif language == 'javascript':
        process = multiprocessing.Process(target=execute_code_snippet_python, args=(code_snippet, result_queue))
    elif language == 'java':
        process = multiprocessing.Process(target=execute_code_snippet_python, args=(code_snippet, result_queue))

    # Start the child process
    process.start()

    # Wait for the process to complete within the timeout
    process.join(timeout)

    if process.is_alive():
        # If the process is still running, terminate it
        process.terminate()
        return {"is_valid": False, "feedback": "Code execution timed out"}

    # Retrieve the result from the queue
    if not result_queue.empty():
        return result_queue.get()
    else:
        return {"is_valid": False, "feedback": "Unknown error occurred"}

