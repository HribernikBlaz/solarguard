export const ROLES = { owner: 'Lastnik', technician: 'Serviser', admin: 'Admin' } as const;

export function homePath(role: string | undefined) {
  return role === ROLES.technician ? '/servisni-nalogi' : '/';
}
