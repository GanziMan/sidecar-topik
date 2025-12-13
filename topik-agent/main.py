import logging
from fastapi import FastAPI
from dotenv import load_dotenv

from config.prompt_manager import prompt_manager
from config.constant import EVALUATOR_AGENT_NAME, CORRECTOR_AGENT_NAME

# Routers
from router import writing, prompts, system

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Include Routers
app.include_router(writing.router)
app.include_router(prompts.router)
app.include_router(system.router)


@app.on_event("startup")
async def startup_event():
    prompt_manager.discover_and_load_prompts(
        [EVALUATOR_AGENT_NAME, CORRECTOR_AGENT_NAME])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
