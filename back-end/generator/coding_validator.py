from .judge0_file import execute_code

def validate_coding_sandboxed(code_snippet, language):
    id = 71
    if language == "python":
        id = 71
    elif language == "java":
        id =62
    elif language == "javascript":
        id = 63
    elif language == "php":
        id = 68
    elif language == "c":
        id = 50
    elif language == "cpp":
        id = 54

    execution_result = execute_code(code_snippet, id)

    output = execution_result.get("stdout")
    error = execution_result.get("stderr")
    status_id = execution_result.get("status", {}).get("id")

    if status_id == 3:
        print("Output:", execution_result.get("stdout"))
        print("Error:", execution_result.get("stderr"))
        print("Status:", execution_result.get("status", {}).get("description"))
        print(execution_result)

        return {"is_valid": True, "feedback": "Code ran successfully"}
    else:
        return {"is_valid": False, "feedback": error}

