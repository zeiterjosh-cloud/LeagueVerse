export type LocalUser = {
  name: string;
  email: string;
  role: "commissioner" | "owner";
};

const authKey = "leagueverse.localUser.v1";

export function getLocalUser(): LocalUser {
  const stored = window.localStorage.getItem(authKey);
  if (stored) {
    try {
      return JSON.parse(stored) as LocalUser;
    } catch {
      window.localStorage.removeItem(authKey);
    }
  }

  const user: LocalUser = {
    name: "Alex Morgan",
    email: "alex@leagueverse.local",
    role: "commissioner",
  };
  window.localStorage.setItem(authKey, JSON.stringify(user));
  return user;
}

export function setLocalUser(user: LocalUser) {
  window.localStorage.setItem(authKey, JSON.stringify(user));
}
