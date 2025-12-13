import logging
import os
from dotenv import load_dotenv
import requests

logger = logging.getLogger(__name__)

load_dotenv()


def question_finder(exam_year: int, exam_round: int, question_number: int) -> str:
    """
    TOPIK Web API에서 문항 데이터를 조회합니다.
    LLM이 이해하기 쉬운 최종 문자열로 포맷팅합니다.

    Args:
        exam_year: 시험 연도.
        exam_round: 시험 회차.
        question_number: 조회할 문항 번호.

    Returns:
        포맷팅된 문항 데이터 문자열. 오류 발생 시 오류 메시지를 담은 문자열을 반환합니다.
    """
    try:
        web_app_url = os.environ.get("CLIENT_URL")
        supabase_url = os.environ.get("SUPABASE_URL")

        api_url = f"{web_app_url}/api/questions/{exam_year}/{exam_round}/{question_number}"

        response = requests.get(api_url, timeout=10)
        response.raise_for_status()

        question_data = response.json()

        # content JSONB 파싱
        content_obj = question_data.get("content", {})

        instruction = content_obj.get("instruction", "")
        context = content_obj.get("context", {})
        context_text = context.get("content", "")
        images = context.get("images")
        formatted_parts = ["[문제 정보]"]

        if instruction:
            formatted_parts.append(f"- 지시문: {instruction}")

        if context_text:
            formatted_parts.append(f"- 내용: {context_text}")

        if images:
            storage_base_url = f"{supabase_url}/storage/v1/object/public/images/{exam_year}/{exam_round}/{question_number}"

            if isinstance(images, dict):
                alt = images.get("alt", "")
                caption = images.get("caption", "")
                url = images.get("url", "")

                info = f"이미지: {alt}"
                if caption:
                    info += f" ({caption})"

                if url:
                    full_url = f"{storage_base_url}/{url}"
                    info += f" [URL: {full_url}]"

                formatted_parts.append(f"- {info}")
        formatted_question_string = "\n".join(formatted_parts)

        return formatted_question_string

    except requests.exceptions.HTTPError as http_error:
        error_message = f"Failed to fetch question data: {http_error.response.status_code} {http_error.response.reason}"
        logger.error(
            f"HTTP error occurred: {error_message} for URL: {http_error.request.url}")
        return f"[오류] {error_message}"


if __name__ == '__main__':
    test_year = 2025
    test_round = 1
    test_question_number = 53
    question_data = question_finder(
        test_year, test_round, test_question_number)
    print(question_data)
