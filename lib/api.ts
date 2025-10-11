const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const accessToken = localStorage.getItem("accessToken")

  const headers = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem("refreshToken")
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        localStorage.setItem("accessToken", data.accessToken)

        // Retry original request
        return fetch(`${API_URL}${url}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${data.accessToken}`,
          },
        })
      }
    }

    // Refresh failed, redirect to login
    localStorage.clear()
    window.location.href = "/login"
  }

  return response
}
