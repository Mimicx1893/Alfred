// Coordinate table for src/assets/gotham-isometric-map.jpeg (1365x768).
// Values are percentages of image width/height, verified against the
// actual image. The district labels themselves (Arkham Asylum, Bleake
// Island, etc.) are baked into the image's pixels — they are NOT
// separate DOM text, so there is nothing to keep in sync there.

export const LOCATIONS = [
	{ id: "gcpd", label: "GCPD HQ", x: 17, y: 44 },
	{ id: "bleake", label: "Bleake Island", x: 21, y: 46 },
	{ id: "arkham_north", label: "Arkham Asylum", x: 35, y: 23 },
	{ id: "ace", label: "Ace Chemicals", x: 26, y: 56 },
	{ id: "miagani", label: "Miagani Island", x: 55, y: 39 },
	{ id: "merchant", label: "Merchant Bridge", x: 68, y: 44 },
	{ id: "founders", label: "Founders' Island", x: 84, y: 39 },
	{ id: "botanical", label: "Botanical Gardens", x: 83, y: 19 },
	{ id: "blackgate", label: "Blackgate Prison", x: 76, y: 72 },
	{ id: "arkham_south", label: "Arkham Asylum", x: 45, y: 77 },
]

export const LOCATIONS_BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]))
