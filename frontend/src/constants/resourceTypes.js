export const FLOORS = [
  { id: 'ground', label: 'Tầng trệt', short: 'Trệt' },
  { id: 'first', label: 'Tầng 1', short: 'Tầng 1' },
  { id: 'mezzanine', label: 'Tầng lửng', short: 'Lửng' },
  { id: 'second', label: 'Tầng 2', short: 'Tầng 2' },
]

export const RESOURCE_PRESETS = [
  { id: 'square_2', label: 'Bàn 2 người', short: 'Bàn 2', type: 'table', capacity: 2, width: 72, height: 72 },
  { id: 'rectangle_4', label: 'Bàn 4 người', short: 'Bàn 4', type: 'table', capacity: 4, width: 108, height: 68 },
  { id: 'long_8', label: 'Bàn dài 8 người', short: 'Bàn 8', type: 'table', capacity: 8, width: 150, height: 64 },
  { id: 'meeting_room', label: 'Phòng họp', short: 'Phòng', type: 'room', capacity: 10, width: 174, height: 112 },
  { id: 'wall', label: 'Tường / vật cản', short: 'Tường', type: 'obstacle', capacity: 0, width: 18, height: 150 },
]

export const getPreset = (resource) => {
  const explicit = RESOURCE_PRESETS.find((item) => item.id === resource?.layout?.variant)
  if (explicit) return explicit
  if (resource?.type === 'obstacle') return RESOURCE_PRESETS[4]
  if (resource?.type === 'room') return RESOURCE_PRESETS[3]
  if (resource?.capacity >= 8) return RESOURCE_PRESETS[2]
  if (resource?.capacity >= 4) return RESOURCE_PRESETS[1]
  return RESOURCE_PRESETS[0]
}
