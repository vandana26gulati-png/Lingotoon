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

export const INITIAL_VIDEOS = {
  ep1: {
    id: 'ep1',
    epLabel: 'Episode 1',
    title: 'The Lantern in the Storm',
    cover: 'Forest at night with glowing amber lantern and lightning shadows',
    status: 'in-progress',
    createdBy: 'Aria K.',
    createdDate: '2026-08-02',
    logline: "Mira follows a mysterious lantern into the storm-lit forest and finds it isn't alone.",
    shots: [
      {
        id: 's1-1',
        desc: "Mira steps out of the treehouse, looking up at the storm clouds gathering.",
        camera: "Wide shot",
        chars: "Mira",
        duration: "4s",
        status: "draft",
        rec: "",
        recReason: "",
        pic: null
      },
      {
        id: 's1-2',
        desc: "Close-up on Mira's face as she notices the glowing lantern moving on its own.",
        camera: "Close-up",
        chars: "Mira",
        duration: "3s",
        status: "approved",
        rec: "",
        recReason: "",
        pic: "Frame ref — close-up face"
      },
      {
        id: 's1-3',
        desc: "The lantern floats toward the forest edge; Mira hesitates then follows.",
        camera: "Tracking shot",
        chars: "Mira, Lantern Spirit",
        duration: "5s",
        status: "rejected",
        rec: "Lantern glow color is inconsistent with locked character sheet — regenerate with warm amber reference.",
        recReason: "Character inconsistent with reference",
        pic: null
      }
    ],
    versions: [
      {
        version: 3,
        date: '2026-09-05',
        uploadedBy: 'Aria K.',
        shotCount: 6,
        status: 'approved',
        approvedBy: 'Devon R.',
        notes: 'Final cut before generation.',
        snapshot: ['Treehouse wide', 'Lantern close-up', 'Forest tracking', 'Meadow reveal', 'Spirit encounter', 'Storm climax']
      },
      {
        version: 2,
        date: '2026-08-20',
        uploadedBy: 'Aria K.',
        shotCount: 5,
        status: 'rejected',
        approvedBy: '—',
        notes: 'Pacing too slow through act two — cut one establishing shot.',
        snapshot: ['Treehouse wide', 'Lantern close-up', 'Forest tracking (long)', 'Meadow reveal', 'Storm climax']
      },
      {
        version: 1,
        date: '2026-08-05',
        uploadedBy: 'Priya N.',
        shotCount: 4,
        status: 'archived',
        approvedBy: '—',
        notes: 'Initial concept board, camera angles only.',
        snapshot: ['Treehouse wide', 'Lantern close-up', 'Forest wide', 'Storm climax']
      }
    ],
    characters: [
      {
        id: 'c1',
        name: 'Mira',
        desc: 'Young forest guide, teal cloak, silver hair braid, expressive amber eyes',
        tag: 'Locked',
        thumb: 'Mira — 3 views (front, 3/4, profile)'
      },
      {
        id: 'c2',
        name: 'Lantern Spirit',
        desc: 'Floating amber light-being, wispy golden trail, whimsical movements',
        tag: 'Draft',
        thumb: 'Lantern Spirit — sketch sheet'
      }
    ],
    prompts: [
      {
        id: 'p1',
        shot: 2,
        tool: 'Runway Gen-4',
        status: 'approved',
        text: "Close-up on Mira (teal cloak, silver braid, locked reference #MIRA-v2) — her eyes widen as she notices a warm amber glow moving on its own behind her. Soft forest lighting, cinematic depth of field, 3 seconds."
      },
      {
        id: 'p2',
        shot: 3,
        tool: 'Kling 2.0',
        status: 'rejected',
        text: "Tracking shot following Mira through the forest edge as the Lantern Spirit (amber glow, wispy trail) drifts ahead. Warm amber must match locked reference #SPIRIT-v1. 5 seconds."
      }
    ],
    queue: [
      {
        id: 'q1',
        shot: 'Shot 1 — Wide, treehouse',
        tool: 'Runway Gen-4',
        status: 'complete',
        uploadedTo: 'Drive / Ep1-Shots / shot01_v2.mp4',
        updated: '2h ago',
        cost: 80
      },
      {
        id: 'q2',
        shot: 'Shot 2 — Close-up, Mira',
        tool: 'Runway Gen-4',
        status: 'generating',
        uploadedTo: '—',
        updated: '3 min ago',
        cost: 80
      },
      {
        id: 'q3',
        shot: 'Shot 3 — Tracking, forest',
        tool: 'Kling 2.0',
        status: 'failed',
        uploadedTo: '—',
        updated: '1h ago',
        cost: 60
      },
      {
        id: 'q4',
        shot: 'Shot 4 — Wide, meadow',
        tool: '—',
        status: 'pending',
        uploadedTo: '—',
        updated: 'Just now',
        cost: 0
      }
    ],
    timeline: [
      { id: 't1', date: 'Sep 5 · 9:14 AM', title: 'Storyboard v3 approved', who: 'Devon R.' },
      { id: 't2', date: 'Sep 5 · 8:40 AM', title: 'Storyboard v3 uploaded', who: 'Aria K.' },
      { id: 't3', date: 'Sep 4 · 4:02 PM', title: 'Shot 2 sent to Runway Gen-4', who: 'Aria K.' },
      { id: 't4', date: 'Sep 3 · 11:20 AM', title: 'Shot 3 flagged — sent back for regeneration', who: 'Devon R.' },
      { id: 't5', date: 'Aug 20 · 2:15 PM', title: 'Storyboard v2 rejected — pacing note', who: 'Devon R.' },
      { id: 't6', date: 'Aug 5 · 10:00 AM', title: 'Storyboard v1 uploaded', who: 'Priya N.' }
    ],
    platforms: [
      {
        id: 'pl1',
        name: 'YouTube Shorts',
        date: '2026-09-08',
        status: 'live',
        rating: 4.6,
        reviews: 128,
        note: 'Strong retention past 0:15 mark.',
        link: 'https://youtube.com/shorts/sample1'
      },
      {
        id: 'pl2',
        name: 'TikTok',
        date: '2026-09-08',
        status: 'live',
        rating: 4.2,
        reviews: 340,
        note: 'Comments flag pacing around shot 3.',
        link: 'https://tiktok.com/@lingotoon/video1'
      },
      {
        id: 'pl3',
        name: 'Instagram Reels',
        date: '2026-09-12',
        status: 'scheduled',
        rating: null,
        reviews: 0,
        note: 'Queued for Friday evening drop.',
        link: '#'
      }
    ],
    assets: [
      {
        id: 'a1',
        thumb: 'Forest mood board (emerald & twilight purple)',
        name: 'Night Forest Palette',
        desc: 'Deep teal / amber lighting reference for color consistency',
        tag: 'Theme'
      },
      {
        id: 'a2',
        thumb: 'Mira turn-around sheet',
        name: 'Mira — front view',
        desc: 'Locked character reference sheet model v2',
        tag: 'Character'
      },
      {
        id: 'a3',
        thumb: 'Lantern prop concept 3D',
        name: 'Floating Lantern',
        desc: 'Prop concept, warm amber glow specifications',
        tag: 'Concept'
      }
    ]
  },
  ep2: {
    id: 'ep2',
    epLabel: 'Episode 2',
    title: 'Market Day Mishap',
    cover: 'Vibrant sunlit market square with tumbling enchanted fruit stalls',
    status: 'published',
    createdBy: 'Priya N.',
    createdDate: '2026-07-10',
    logline: 'Mira knocks over a stall of enchanted fruit and has to fix the chaos before sundown.',
    shots: [
      {
        id: 's2-1',
        desc: "Wide establishing shot of the bustling market square at midday.",
        camera: "Wide shot",
        chars: "Crowd",
        duration: "3s",
        status: "approved",
        rec: "",
        recReason: "",
        pic: "Frame ref — market wide"
      },
      {
        id: 's2-2',
        desc: "Mira bumps the fruit stall; glowing apples roll everywhere.",
        camera: "Medium shot",
        chars: "Mira",
        duration: "4s",
        status: "approved",
        rec: "",
        recReason: "",
        pic: null
      }
    ],
    versions: [
      {
        version: 2,
        date: '2026-07-28',
        uploadedBy: 'Priya N.',
        shotCount: 7,
        status: 'approved',
        approvedBy: 'Aria K.',
        notes: 'Locked for generation.',
        snapshot: ['Market wide', 'Stall bump', 'Apples rolling', 'Chase begins', 'Stall owner reaction', 'Fix montage', 'Sundown resolve']
      },
      {
        version: 1,
        date: '2026-07-12',
        uploadedBy: 'Priya N.',
        shotCount: 6,
        status: 'archived',
        approvedBy: '—',
        notes: 'First pass draft.',
        snapshot: ['Market wide', 'Stall bump', 'Apples rolling', 'Chase begins', 'Stall owner reaction', 'Sundown resolve']
      }
    ],
    characters: [
      {
        id: 'c2-1',
        name: 'Mira',
        desc: 'Young forest guide, teal cloak, silver hair braid',
        tag: 'Locked',
        thumb: 'Mira — 3 views'
      },
      {
        id: 'c2-2',
        name: 'Stall Owner Bram',
        desc: 'Stout market vendor, patched apron, gruff but kind expression',
        tag: 'Locked',
        thumb: 'Bram — front view'
      }
    ],
    prompts: [
      {
        id: 'p2-1',
        shot: 1,
        tool: 'Veo 3',
        status: 'approved',
        text: "Wide establishing shot of a busy fantasy market square at midday — colorful stalls, warm sunlight, background chatter. 3 seconds, static camera."
      }
    ],
    queue: [
      {
        id: 'q2-1',
        shot: 'Shot 1 — Wide, market',
        tool: 'Veo 3',
        status: 'complete',
        uploadedTo: 'Drive / Ep2-Shots / shot01.mp4',
        updated: '3d ago',
        cost: 90
      },
      {
        id: 'q2-2',
        shot: 'Shot 2 — Medium, stall bump',
        tool: 'Runway Gen-4',
        status: 'complete',
        uploadedTo: 'Drive / Ep2-Shots / shot02.mp4',
        updated: '3d ago',
        cost: 80
      },
      {
        id: 'q2-3',
        shot: 'Shot 3 — Apples rolling',
        tool: 'Kling 2.0',
        status: 'complete',
        uploadedTo: 'Drive / Ep2-Shots / shot03.mp4',
        updated: '2d ago',
        cost: 60
      }
    ],
    timeline: [
      { id: 't2-1', date: 'Sep 1 · 10:00 AM', title: 'Published to all platforms', who: 'Aria K.' },
      { id: 't2-2', date: 'Jul 30 · 3:40 PM', title: 'All shots generated and approved', who: 'Priya N.' },
      { id: 't2-3', date: 'Jul 28 · 9:00 AM', title: 'Storyboard v2 approved', who: 'Aria K.' }
    ],
    platforms: [
      {
        id: 'pl2-1',
        name: 'YouTube Shorts',
        date: '2026-09-01',
        status: 'live',
        rating: 4.8,
        reviews: 512,
        note: 'Top-performing episode this month. High replay rate.',
        link: 'https://youtube.com/shorts/sample2'
      },
      {
        id: 'pl2-2',
        name: 'TikTok',
        date: '2026-09-01',
        status: 'live',
        rating: 4.5,
        reviews: 890,
        note: 'High share rate, viral sound audio used.',
        link: 'https://tiktok.com/@lingotoon/video2'
      },
      {
        id: 'pl2-3',
        name: 'Instagram Reels',
        date: '2026-09-02',
        status: 'live',
        rating: 4.3,
        reviews: 201,
        note: 'Steady engagement, positive feedback.',
        link: 'https://instagram.com/reel/sample2'
      }
    ],
    assets: [
      {
        id: 'a2-1',
        thumb: 'Market mood board',
        name: 'Market Square Palette',
        desc: 'Warm gold / terracotta color keys',
        tag: 'Theme'
      },
      {
        id: 'a2-2',
        thumb: 'Bram reference sheet',
        name: 'Bram — front view',
        desc: 'Character reference sheet',
        tag: 'Character'
      }
    ]
  },
  ep3: {
    id: 'ep3',
    epLabel: 'Episode 3',
    title: 'The Singing River',
    cover: 'Misty azure riverbank reflecting bioluminescent water flowers',
    status: 'draft',
    createdBy: 'Devon R.',
    createdDate: '2026-09-09',
    logline: "A river that hums old songs leads Mira toward a memory she thought she'd lost.",
    shots: [
      {
        id: 's3-1',
        desc: "Mira kneels at the riverbank, listening to a faint melody in the water.",
        camera: "Medium shot",
        chars: "Mira",
        duration: "4s",
        status: "draft",
        rec: "",
        recReason: "",
        pic: null
      }
    ],
    versions: [
      {
        version: 1,
        date: '2026-09-09',
        uploadedBy: 'Devon R.',
        shotCount: 1,
        status: 'draft',
        approvedBy: '—',
        notes: 'Concept sketch only, not yet reviewed.',
        snapshot: ['Riverbank listening']
      }
    ],
    characters: [
      {
        id: 'c3-1',
        name: 'Mira',
        desc: 'Young forest guide, teal cloak, silver hair braid',
        tag: 'Locked',
        thumb: 'Mira — 3 views'
      }
    ],
    prompts: [],
    queue: [],
    timeline: [
      { id: 't3-1', date: 'Sep 9 · 1:00 PM', title: 'Video folder created', who: 'Devon R.' },
      { id: 't3-2', date: 'Sep 9 · 1:05 PM', title: 'Storyboard v1 uploaded (concept only)', who: 'Devon R.' }
    ],
    platforms: [],
    assets: [
      {
        id: 'a3-1',
        thumb: 'River mood board',
        name: 'Riverlight Palette',
        desc: 'Cool blue-green reference, early concept',
        tag: 'Theme'
      }
    ]
  }
};
