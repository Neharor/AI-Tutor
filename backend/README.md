# Gemini API Quickstart - Python

This repository contains a simple Python Flask App running with the Google AI Gemini API, designed to get you started building with Gemini's multi-modal capabilities. The app comes with a basic UI and a Flask backend.

## Basic request

## Setup

1. If you don’t have Python installed, install it [from Python.org](https://www.python.org/downloads/).

3. Create a new virtual environment:

   - macOS:
     ```bash
     $ python -m venv venv
     $ . venv/bin/activate
     ```

   - Windows:
     ```cmd
     > python -m venv venv
     > .\venv\Scripts\activate
     ```

   - Linux:
      ```bash
      $ python -m venv venv
      $ source venv/bin/activate
      ```

4. Install the requirements:

   ```bash
   $ pip install -r requirements.txt
   ```

5. Make a copy of the example environment variables file:

   ```bash
   $ cp .env.example .env
   ```

6. Add your [API key](https://ai.google.dev/gemini-api/docs/api-key) to the newly created `.env` file or as an environment variable.

7. Run the app:

```bash
$ flask run
```

You should now be able to access the app from your browser at the following URL: [http://localhost:5000](http://localhost:5000)!
