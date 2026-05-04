import { sha256Hex } from '@shared/lib/hash'

export interface KeyInput {
  athlete: { firstname: string; lastname: string }
  name: string
  sport_type: string
  distance: number
  moving_time: number
}

export async function activityKey(a: KeyInput): Promise<string> {
  const norm = [
    a.athlete.firstname.trim().toLowerCase(),
    a.athlete.lastname.trim().toLowerCase(),
    a.name.trim(),
    a.sport_type,
    Math.round(a.distance),
    Math.round(a.moving_time),
  ].join('|')
  return (await sha256Hex(norm)).slice(0, 16)
}
