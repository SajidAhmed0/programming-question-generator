import openai

openai.api_key = "your_openai_api_key"

def validate_mcq_with_gpt(question_text, options, correct_option):
    prompt = f"""
    Validate the following MCQ question:

    Question: {question_text}
    Options: {', '.join(options)}
    Correct Option: {correct_option}

    Requirements:
    1. Confirm if the correct option is valid.
    2. Ensure the distractors are plausible.
    3. Provide feedback on clarity and difficulty.

    Respond with your validation.
    """
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150
    )
    return response.choices[0].text.strip()

def validate_short_answer_with_gpt(question_text, expected_answers):
    prompt = f"""
    Validate the following short-answer question:

    Question: {question_text}
    Expected Answers: {', '.join(expected_answers)}

    Requirements:
    1. Confirm if the question is clear and relevant.
    2. Suggest improvements if needed.
    3. Ensure the expected answers cover all plausible correct responses.

    Respond with your validation.
    """
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150
    )
    return response.choices[0].text.strip()