async function spotifyFetch(endpoint) {
  const token = await window.SpotifyAuth.getToken();
  if (!token) throw new Error('NO_TOKEN');

  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 401) {
    const newToken = await window.SpotifyAuth.getToken();
    if (!newToken) throw new Error('NO_TOKEN');
    const retry = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: { Authorization: `Bearer ${newToken}` }
    });
    if (!retry.ok) throw new Error(`API_ERROR_${retry.status}`);
    return retry.json();
  }

  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`API_ERROR_${res.status}`);
  return res.json();
}

async function getCurrentUser() {
  return spotifyFetch('/me');
}

async function getPlaybackState() {
  return spotifyFetch('/me/player');
}

async function getTopItems(type, timeRange = 'medium_term', limit = 20) {
  return spotifyFetch(`/me/top/${type}?time_range=${timeRange}&limit=${limit}`);
}

async function getFollowedArtists(limit = 20) {
  return spotifyFetch(`/me/following?type=artist&limit=${limit}`);
}

async function getArtistDetail(id) {
  return spotifyFetch(`/artists/${id}`);
}

window.SpotifyAPI = {
  getCurrentUser,
  getPlaybackState,
  getTopItems,
  getFollowedArtists,
  getArtistDetail
};
