const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.error || data?.errors?.join(', ') || 'Something went wrong'
    throw new Error(msg)
  }
  return data
}

export const api = {
  // Apartments
  getApartments: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/apartments${query ? '?' + query : ''}`)
  },
  getApartment: (id) => request(`/apartments/${id}`),
  createApartment: (data) => request('/apartments', { method: 'POST', body: JSON.stringify(data) }),

  // Reviews
  createReview: (aptId, data) => request(`/apartments/${aptId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  updateReview: (aptId, reviewId, data) => request(`/apartments/${aptId}/reviews/${reviewId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReview: (aptId, reviewId) => request(`/apartments/${aptId}/reviews/${reviewId}`, { method: 'DELETE' }),

  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Users
  getMyProfile: () => request('/users/me'),
}
