from fastapi import HTTPException


class AppError(HTTPException):
    def __init__(self, status_code: int, detail: str, code: str = "ERROR"):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code


class LiteratureSearchError(AppError):
    def __init__(self, detail: str = "Failed to retrieve scientific literature from Europe PMC.", code: str = "LITERATURE_SEARCH_FAILED"):
        super().__init__(status_code=502, detail=detail, code=code)


class InsufficientLiteratureError(AppError):
    def __init__(self, detail: str = "Insufficient scientific literature found with abstracts for the query.", code: str = "INSUFFICIENT_LITERATURE"):
        super().__init__(status_code=422, detail=detail, code=code)


class AIAnalysisError(AppError):
    def __init__(self, detail: str = "AI analysis failed or timed out. Please retry.", code: str = "AI_ANALYSIS_FAILED"):
        super().__init__(status_code=502, detail=detail, code=code)


class ResourceNotFoundError(AppError):
    def __init__(self, detail: str = "The requested resource was not found.", code: str = "NOT_FOUND"):
        super().__init__(status_code=404, detail=detail, code=code)
