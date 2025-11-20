import logging
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from markdownify import markdownify as md

logger = logging.getLogger(__name__)

load_dotenv()


def get_supabase_client() -> Client:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY")
    if not supabase_url or not supabase_key:
        raise ValueError(
            "Supabase URL and Key must be set in environment variables.")
    return create_client(supabase_url, supabase_key)


def question_finder(exam_year: int, exam_round: int, question_id: int) -> dict:
    """
    Fetches question data from Supabase for a given question ID.

    Args:
        question_id: The ID of the question to fetch.

    Returns:
        A dictionary containing the title, question text, and image URL.
    """
    try:
        supabase = get_supabase_client()

        select_query = "title, question_text"
        if question_id == 53:
            select_query += ", question_img_url:question_img_path(publicUrl)"

        response = supabase.from_("questions").select(
            select_query
        ).eq("exam_year", exam_year).eq("exam_round", exam_round).eq("question_number", question_id).single().execute()

        if response.data:
            data = response.data
            img_data = data.get("question_img_url")
            img_url = None
            if img_data:
                if isinstance(img_data, list) and img_data:
                    img_url = img_data[0].get("publicUrl")
                elif isinstance(img_data, dict):
                    img_url = img_data.get("publicUrl")

            question_text_html = data.get("question_text", "")
            question_text_md = md(
                question_text_html) if question_text_html else ""

            return {
                "title": data.get("title"),
                "question_text": question_text_md,
                "image": img_url
            }
        else:
            return {"error": "Question not found."}

    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


if __name__ == '__main__':
    # Example usage:
    exam_year = 2025
    exam_round = 1
    question_id = 54  # Example ID
    question_data = question_finder(exam_year, exam_round, question_id)
    print(question_data)
