from fastapi import APIRouter, Depends, HTTPException
from app.schemas.requests import ExperimentRequest
from app.schemas.experiments import ExperimentResponse
from app.services.experiment_generator import generate_experiment_proposal
from app.utils.errors import ResourceNotFoundError
from app.utils.logging import logger
from app.dependencies.auth import require_api_key

router = APIRouter(tags=["Experiments"])


@router.post("/experiments", response_model=ExperimentResponse, dependencies=[Depends(require_api_key)])
async def create_experiment(request: ExperimentRequest):
    try:
        return await generate_experiment_proposal(
            analysis_id=request.analysis_id,
            gap_id=request.gap_id,
        )
    except ResourceNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc.detail),
        ) from exc
    except Exception as exc:
        logger.error("Experiment proposal generation failed: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Failed to generate experimental protocol for the selected gap. Please retry.",
        ) from exc
