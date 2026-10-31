from enum import Enum
from fastapi import APIRouter, Query
from app.eval.run import run_all_evaluations
from app.seed.synthetic.generator import SyntheticDataGenerator

router = APIRouter(prefix="/eval", tags=["AI Quality, Evaluation & Demo Control"])

class DemoState(str, Enum):
    before = "before"
    mid = "mid"
    after = "after"

@router.get("/")
async def get_evaluation_metrics():
    """Runs and returns rolling-origin backtesting, voice accuracy, and grounding results."""
    results = run_all_evaluations()
    return results

@router.post("/demo/reset")
async def reset_demo_state(
    state: DemoState = Query(DemoState.before, description="One of: before, mid, after")
):
    """Resets the demo environment to 'before' (pending), 'mid' (executing), or 'after' (outcomes measured)."""
    gen = SyntheticDataGenerator(seed=42, merchant_count=12)
    state_val = state.value if isinstance(state, DemoState) else str(state)
    await gen.generate_all(state=state_val)
    return {
        "status": "RESET_SUCCESSFUL",
        "demo_state": state_val,
        "message": f"Demo environment successfully reset to '{state_val}' state."
    }
