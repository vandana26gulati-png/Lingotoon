export const CAMERA_OPTIONS = [
  "Wide shot",
  "Close-up",
  "Medium shot",
  "Tracking shot",
  "Over-the-shoulder",
  "Aerial / Drone",
  "Dutch angle",
  "Low-angle hero",
  "Point of View (POV)",
  "Extreme Close-up"
];

export const CAMERA_MOVEMENTS = [
  "Static (Fixed)",
  "Pan Left",
  "Pan Right",
  "Tilt Up",
  "Tilt Down",
  "Zoom In",
  "Zoom Out",
  "Dolly In (Push)",
  "Dolly Out (Pull)",
  "Tracking (Truck)",
  "Pedestal Up/Down",
  "Handheld (Shake)",
  "Crane / Drone"
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

// Restored Studio Projects
export const INITIAL_VIDEOS = {
  "ep_collab_test": {
    "id": "ep_collab_test",
    "title": "Realtime Multi-User Studio Active!",
    "status": "review",
    "createdBy": "Director (Client A)",
    "updatedAt": 1791261865017,
    "shots": [
      {
        "id": "s1",
        "desc": "Opening shot edited by collaborator A",
        "camera": "Wide shot",
        "duration": "5s",
        "comments": []
      },
      {
        "id": "s2",
        "desc": "Shot 2 added by Animator B on their phone",
        "camera": "Close-up",
        "duration": "4s",
        "comments": []
      }
    ]
  },
  "v_magic_mountain": {
    "id": "v_magic_mountain",
    "title": "Collab Episode 1: The Magic Mountain",
    "updatedAt": 1791261890770,
    "shots": [
      {
        "id": "s1",
        "desc": "Once upon a time in the emerald forest...",
        "script": "Once upon a time in the emerald forest...",
        "camera": "Wide shot",
        "duration": "4s",
        "comments": []
      },
      {
        "id": "s2",
        "desc": "A magical toon appeared!",
        "script": "A magical toon appeared!",
        "camera": "Close-up",
        "duration": "4s",
        "comments": []
      }
    ]
  }
};
