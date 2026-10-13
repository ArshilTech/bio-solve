from typing import Optional
from pydantic import BaseModel, Field


class ExperimentProposal(BaseModel):
    research_question: str = Field(..., description="Target follow-up research question")
    hypothesis: str = Field(..., description="Testable scientific hypothesis")
    study_design: str = Field(..., description="Methodological design (e.g. comparative split-sample laboratory-to-field validation)")
    sample_groups: str = Field(default="", description="Water sample sources and matrices")
    experimental_conditions: str = Field(default="", description="Tested environmental parameters (pH, turbidity, temp)")
    samples_and_conditions: str = Field(..., description="Detailed description of test samples and environmental conditions for UI display")
    measurements: str = Field(..., description="Sensor readings and reference standard analytical methods")
    controls: str = Field(..., description="Negative and positive controls, baseline calibration")
    analysis_method: str = Field(..., description="Statistical analysis and concordance evaluation metrics")
    safety_considerations: str = Field(..., description="Handling caveats and disclaimer regarding uncertified drinking water sensors")
    limitations: str = Field(..., description="Methodological boundaries and potential interferences")
    supporting_paper_ids: list[str] = Field(default_factory=list, description="Referenced papers from analysis corpus")
    warnings: list[str] = Field(default_factory=list, description="Safety and verification caveats")


class ExperimentResponse(BaseModel):
    analysis_id: str
    gap_id: str
    experiment: ExperimentProposal
