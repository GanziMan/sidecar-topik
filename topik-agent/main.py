import logging
from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.base import BaseHTTPMiddleware

from config.prompt_manager import prompt_manager
from middleware.error_handler import error_handling_middleware

# Routers
from router import writing, prompts, system

load_dotenv()

# 로깅 설정 (파일 및 콘솔 출력)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/agent.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()


# Middleware Error Handler
app.add_middleware(BaseHTTPMiddleware, dispatch=error_handling_middleware)

# Include Routers
app.include_router(writing.router)
app.include_router(prompts.router)
app.include_router(system.router)


# main.py:28: DeprecationWarning: on_event is deprecated, use lifespan event handlers instead.
@app.on_event("startup")  # type: ignore
async def startup_event():
    # 명시적 레지스트리 로딩
    prompt_manager.load_prompts()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
