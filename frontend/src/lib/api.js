const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? 120000);
  const signal = options.signal ?? controller.signal;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof body === "object" && body !== null
          ? body.detail || body.message || body.error
          : body;
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    return body;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("Could not connect to the API. Check the backend URL, server status, and CORS configuration.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function analyzeQuestion(question, maxPapers = 20) {
  return apiRequest("/analyze", {
    method: "POST",
    body: JSON.stringify({ question, max_papers: maxPapers }),
    timeout: 120000,
  });
}

export async function getGraph(analysisId) {
  if (!analysisId) {
    throw new Error("An analysis ID is required to load the evidence graph.");
  }
  return apiRequest(`/graph/${encodeURIComponent(analysisId)}`);
}

export async function generateExperiment(analysisId, gapId) {
  if (!analysisId || !gapId) {
    throw new Error("An analysis ID and research gap ID are required to generate a proposal.");
  }

  const result = await apiRequest("/experiments", {
    method: "POST",
    body: JSON.stringify({ analysis_id: analysisId, gap_id: gapId }),
    timeout: 120000,
  });

  return result.experiment || result;
}

export async function checkHealth() {
  return apiRequest("/health");
}
