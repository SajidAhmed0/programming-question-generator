# pip install PyExecJS


import execjs

def execute_javascript_code(code):
    try:
        # Create a Node.js runtime environment
        ctx = execjs.compile("""
        function run() {
            return eval(arguments[0]);
        }
        """)
        result = ctx.call("run", code)
        return {"is_valid": True, "output": result}
    except Exception as e:
        return {"is_valid": False, "output": str(e)}

js_code = "x = 10 + 20; x"
result = execute_javascript_code(js_code)
print(result)
