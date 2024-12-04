def execute_python_code(code):
    try:
        exec(code)  # Execute Python code in the current scope
        return {"is_valid": True, "output": "Code executed successfully"}
    except Exception as e:
        return {"is_valid": False, "output": str(e)}

python_code = "x = 10\nprint(x + 5)"
result = execute_python_code(python_code)
print(result)
