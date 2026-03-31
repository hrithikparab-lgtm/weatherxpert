import api, { setToken, clearToken } from "./client";

/* ─── Auth ─── */
export interface LoginPayload { email: string; password: string }
export interface UserInfo {
  id: number; name: string; email: string;
  role: "superadmin" | "admin" | "operator";
  utility: string | null; utility_id: number | null;
}

export async function login(payload: LoginPayload): Promise<{ access_token: string; user: UserInfo }> {
  const res = await api.post<{ access_token: string; user: UserInfo }>("/auth/login", payload);
  setToken(res.access_token);
  localStorage.setItem("wx_user", JSON.stringify(res.user));
  return res;
}

export function logout() {
  clearToken();
}

export function getCachedUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem("wx_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export const authApi = { login, logout, getCachedUser };

/* ─── Utilities ─── */
export interface Utility {
  id: number; name: string; short_name: string;
  region: string; type: string;
}

export interface Station {
  id: number; station_id: string; name: string;
  latitude: number; longitude: number; type: string;
}

export const utilitiesApi = {
  list: () => api.get<Utility[]>("/utilities/"),
  stations: (utilityId: number) =>
    api.get<Station[]>(`/utilities/${utilityId}/stations`),
};

/* ─── Weather ─── */
export interface CurrentWeather {
  station_id: number; observed_at: string;
  temperature: number | null; humidity: number | null;
  wind_speed: number | null; wind_direction: number | null;
  pressure: number | null; rainfall: number | null;
  cloud_cover: number | null; ghi: number | null;
  quality_flag: string;
}

export interface WeatherDataPoint {
  time: string; temperature?: number; humidity?: number;
  wind_speed?: number; rainfall?: number; cloud_cover?: number; ghi?: number;
}

export const weatherApi = {
  current: (stationId: number) =>
    api.get<CurrentWeather>(`/weather/current/${stationId}`),

  historical: (
    stationId: number,
    start: string, end: string,
    resolution: string = "15min"
  ) =>
    api.get<{ data: WeatherDataPoint[] }>(
      `/weather/historical/${stationId}?start=${start}&end=${end}&resolution=${resolution}`
    ),

  forecast: (
    stationId: number,
    provider: string = "imd",
    horizon: string = "day_ahead"
  ) =>
    api.get<{ data: WeatherDataPoint[] }>(
      `/weather/forecast/${stationId}?provider=${provider}&horizon=${horizon}`
    ),

  parameters: () =>
    api.get<{ parameters: { id: string; label: string; unit: string }[] }>("/weather/parameters"),
};

/* ─── Alerts ─── */
export interface Alert {
  id: number; title: string; description: string | null;
  parameter: string; severity: string; status: string;
  provider: string; actual_value: number | null;
  threshold_value: number | null; unit: string | null;
  triggered_at: string; resolved_at: string | null;
  sla_minutes: number; escalation_level: number;
  utility_id: number; station_id: number | null;
}

export interface CreateAlertPayload {
  utility_id: number; title: string; description?: string;
  parameter: string; severity: string;
  actual_value?: number; threshold_value?: number; unit?: string;
  station_id?: number; is_internal?: boolean;
}

export const alertsApi = {
  list: (params?: { utility_id?: number; severity?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.utility_id) qs.set("utility_id", String(params.utility_id));
    if (params?.severity) qs.set("severity", params.severity);
    if (params?.status) qs.set("status", params.status);
    return api.get<Alert[]>(`/alerts/?${qs}`);
  },
  create: (payload: CreateAlertPayload) => api.post<{ id: number }>("/alerts/", payload),
  acknowledge: (id: number) => api.patch(`/alerts/${id}/acknowledge`),
  resolve: (id: number) => api.patch(`/alerts/${id}/resolve`),

  rules: {
    list: () => api.get<any[]>("/alerts/rules"),
    create: (payload: any) => api.post("/alerts/rules", payload),
  },
};

/* ─── Accuracy ─── */
export interface AccuracyMetrics {
  mae: number | null; rmse: number | null;
  mbe: number | null; correlation: number | null;
  data_points: number;
}

export const accuracyApi = {
  metrics: (params: {
    station_id: number; provider: string; parameter: string;
    start: string; end: string; resolution?: string;
  }) => {
    const qs = new URLSearchParams({
      station_id: String(params.station_id),
      provider: params.provider,
      parameter: params.parameter,
      start: params.start,
      end: params.end,
      resolution: params.resolution || "15min",
    });
    return api.get<AccuracyMetrics>(`/accuracy/metrics?${qs}`);
  },

  providerComparison: (params: {
    station_id: number; parameter: string; start: string; end: string;
  }) => {
    const qs = new URLSearchParams({
      station_id: String(params.station_id),
      parameter: params.parameter,
      start: params.start,
      end: params.end,
    });
    return api.get<{ providers: any[] }>(`/accuracy/provider-comparison?${qs}`);
  },
};

/* ─── Reports ─── */
export const reportsApi = {
  exportCsvUrl: (stationId: number, start: string, end: string): string =>
    `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/reports/export/csv?station_id=${stationId}&start=${start}&end=${end}`,

  summary: (utilityId: number, start: string, end: string) =>
    api.get<any>(`/reports/summary?utility_id=${utilityId}&start=${start}&end=${end}`),
};

/* ─── Upload ─── */
export const uploadApi = {
  uploadCsv: async (file: File, stationId: number) => {
    const token = localStorage.getItem("wx_token");
    const form = new FormData();
    form.append("file", file);
    form.append("station_id", String(stationId));

    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/upload/csv`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      }
    );
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
};
