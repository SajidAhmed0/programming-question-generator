import subprocess
import sys
import tempfile

def run_java_code(java_code):
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
                return {"is_valid": False, "output": compile_process.stderr}

            # Run the compiled Java code using java
            class_name = "Main"  # Assuming the class name is Main
            run_process = subprocess.run(
                ["java", "-cp", temp_dir, class_name],
                capture_output=True,
                text=True
            )

            # Return the output or error
            if run_process.returncode == 0:
                return {"is_valid": True, "output": run_process.stdout}
            else:
                return {"is_valid": False, "output": run_process.stderr}

    except Exception as e:
        return {"is_valid": False, "output": str(e)}

# Example Java code to execute
java_code = """
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}
"""

# Run the Java code
result = run_java_code(java_code)
print(result)
