import os  # Import os first
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Instantiate OpenAI client with the API key
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# TODO: The 'openai.organization' option isn't read in the client API. You will need to pass it when you instantiate the client, e.g. 'OpenAI(organization=os.getenv('OPENAI_ORGANIZATION'))'

# Test the OpenAI API with the new ChatCompletion interface
try:
    prompt = "Generate a kid-friendly snack idea."

    # Use the new ChatCompletion method with the client
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150
    )
    print("Response:", response.choices[0].message.content.strip())
except Exception as e:
    print("Error during OpenAI API call:", e)
