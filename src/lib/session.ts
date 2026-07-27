export interface ParticipantSession {
  token: string;
  firstName: string;
  phone: string;
}

const TOKEN_KEY = "bilengo_participant_token";
const NAME_KEY = "bilengo_first_name";
const PHONE_KEY = "bilengo_phone";
const THIRTY_DAYS = 30 * 24 * 60 * 60; // 30 days in seconds

export function getParticipantSession(): ParticipantSession | null {
  if (typeof window === "undefined") return null;

  const firstName = localStorage.getItem(NAME_KEY) || "";
  const phone = localStorage.getItem(PHONE_KEY) || "";
  let token = localStorage.getItem(TOKEN_KEY) || "";

  if (!token) {
    // Generate anonymous 30-day token
    token = "part_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${token}; max-age=${THIRTY_DAYS}; path=/; SameSite=Lax`;
  }

  if (firstName && phone) {
    return { token, firstName, phone };
  }

  return null;
}

export function setParticipantSession(firstName: string, phone: string): ParticipantSession {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = "part_" + Math.random().toString(36).substring(2, 15);
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(NAME_KEY, firstName);
  localStorage.setItem(PHONE_KEY, phone);

  document.cookie = `${TOKEN_KEY}=${token}; max-age=${THIRTY_DAYS}; path=/; SameSite=Lax`;
  document.cookie = `${NAME_KEY}=${encodeURIComponent(firstName)}; max-age=${THIRTY_DAYS}; path=/; SameSite=Lax`;
  document.cookie = `${PHONE_KEY}=${encodeURIComponent(phone)}; max-age=${THIRTY_DAYS}; path=/; SameSite=Lax`;

  return { token, firstName, phone };
}
