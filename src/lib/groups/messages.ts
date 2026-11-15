// User-facing texts (Estonian) for the group forms.

import {
  MAX_GROUP_NAME_LENGTH,
  MAX_MEMBER_NAME_LENGTH,
  MAX_MEMBERS,
  type NameProblem,
} from "./validation";

export function groupNameMessage(problem: NameProblem): string {
  return problem === "required"
    ? "Sisesta grupi nimi."
    : `Grupi nimi on liiga pikk (kuni ${MAX_GROUP_NAME_LENGTH} tähemärki).`;
}

export function memberNameMessage(problem: NameProblem): string {
  return problem === "required"
    ? "Sisesta liikme nimi."
    : `Nimi on liiga pikk (kuni ${MAX_MEMBER_NAME_LENGTH} tähemärki).`;
}

export const MEMBER_EXISTS_MESSAGE = "Selline liige on grupis juba olemas.";
export const GROUP_FULL_MESSAGE = `Grupis võib olla kuni ${MAX_MEMBERS} liiget.`;
export const GROUP_NOT_FOUND_MESSAGE = "Gruppi ei leitud.";
export const NOT_ALLOWED_MESSAGE = "Sul pole selleks õigust.";
