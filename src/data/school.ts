export const schoolContact = {
  admissionsEmail: "admissions@lakeforestacademy.ca",
  location: "North York, Toronto, Ontario, Canada",
  mapHref: "https://www.google.com/maps/search/?api=1&query=North+York%2C+Toronto%2C+Ontario%2C+Canada",
} as const;

export function emailHref(subject: string) {
  return `mailto:${schoolContact.admissionsEmail}?subject=${encodeURIComponent(subject)}`;
}
