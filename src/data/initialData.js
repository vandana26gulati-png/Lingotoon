export const CAMERA_OPTIONS = [
  "Wide shot",
  "Close-up",
  "Medium shot",
  "Tracking shot",
  "Over-the-shoulder",
  "Aerial / Drone",
  "Dutch angle",
  "Low-angle hero"
];

export const REJECTION_REASONS = [
  "Character inconsistent with reference",
  "Motion/timing feels off",
  "Wrong camera angle",
  "Background doesn't match theme",
  "Needs re-prompt for clarity",
  "Lighting & color grading mismatch",
  "Artifacts / face distortion",
  "Other (see notes)"
];

export const TOOL_OPTIONS = [
  { name: "Runway Gen-4", defaultCost: 80 },
  { name: "Kling 2.0", defaultCost: 60 },
  { name: "Veo 3", defaultCost: 90 },
  { name: "Sora 2", defaultCost: 100 },
  { name: "Midjourney v6", defaultCost: 40 }
];

// Clean slate: all default mock entries removed
export const INITIAL_VIDEOS = {};
