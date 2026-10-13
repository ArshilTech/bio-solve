const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
export const API_BASE_URL = RAW_BASE.replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const timeoutMs = options.timeout ?? 120000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const signal = options.signal ?? controller.signal;

  try {
    const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
    const response = await fetch(url, {
      ...options,
      signal,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Accept: "application/json",
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      let message = "";
      if (typeof body === "object" && body !== null) {
        if (typeof body.detail === "string") {
          message = body.detail;
        } else if (Array.isArray(body.detail)) {
          // Pydantic validation errors
          message = body.detail.map((d) => d.msg || `${d.loc?.join(".")}: invalid`).join("; ");
        } else {
          message = body.message || body.error || JSON.stringify(body);
        }
      } else {
        message = String(body);
      }
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    return body;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request timed out. Scientific literature retrieval and AI analysis may take up to a minute — please retry.");
    }
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Could not connect to ResearchRadar backend at ${API_BASE_URL}. Ensure the FastAPI server is running on port 8000.`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkHealth() {
  return apiRequest("/health", { timeout: 8000 });
}

export async function checkHealthReady() {
  return apiRequest("/health/ready", { timeout: 10000 });
}

export async function searchLiterature(query, limit = 20) {
  if (!query || query.trim().length < 3) {
    throw new Error("Search query must be at least 3 characters long.");
  }
  const q = encodeURIComponent(query.trim());
  return apiRequest(`/search?q=${q}&limit=${Math.min(20, Math.max(1, limit))}`);
}

export async function analyzeQuestion(question, maxPapers = 20) {
  const cleaned = question ? question.trim() : "";
  if (cleaned.length < 10) {
    throw new Error("Research question must be at least 10 characters long.");
  }
  return apiRequest("/analyze", {
    method: "POST",
    body: JSON.stringify({
      question: cleaned,
      max_papers: Math.min(20, Math.max(5, maxPapers)),
    }),
    timeout: 120000,
  });
}

export async function getGapDetail(gapId, analysisId = null) {
  if (!gapId) {
    throw new Error("A gap ID is required.");
  }
  const queryParam = analysisId ? `?analysis_id=${encodeURIComponent(analysisId)}` : "";
  return apiRequest(`/gaps/${encodeURIComponent(gapId)}${queryParam}`);
}

export async function getGraph(analysisId) {
  if (!analysisId) {
    throw new Error("An analysis ID is required to load the evidence graph.");
  }
  return apiRequest(`/graph/${encodeURIComponent(analysisId)}`, { timeout: 15000 });
}

export async function generateExperiment(analysisId, gapId) {
  if (!analysisId || !gapId) {
    throw new Error("An analysis ID and research gap ID are required to generate an experimental proposal.");
  }

  const result = await apiRequest("/experiments", {
    method: "POST",
    body: JSON.stringify({
      analysis_id: analysisId,
      gap_id: gapId,
    }),
    timeout: 120000,
  });

  return result.experiment || result;
}

export async function listAnalyses(limit = 10) {
  return apiRequest(`/analysis?limit=${limit}`);
}

export async function getAnalysis(analysisId) {
  if (!analysisId) {
    throw new Error("Analysis ID is required.");
  }
  return apiRequest(`/analysis/${encodeURIComponent(analysisId)}`);
}
