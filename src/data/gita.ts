import { syncedVerses } from "./verses-generated";

export type Verse = {
  id: string;
  ref: string;
  sanskrit: string;
  translation: string;
  framework: string;
  mapping: string;
  example: string;
  takeaway: string;
};

const builtInVerses: Verse[] = [
  {
    id: "arjuna-vishada",
    ref: "Chapter 1, Verse 29",
    sanskrit: "सीदन्ति मम गात्राणि मुखं च परिशुष्यति ।",
    translation:
      "My limbs give way and my mouth is parched; my whole body trembles as I stand before this battle.",
    framework: "Decision-making under uncertainty",
    mapping:
      "Arjuna's paralysis is classic analysis paralysis: high stakes, incomplete information, conflicting loyalties. Strategic response is to reframe the problem, separate emotion from evidence, and shrink the decision to the next reversible step.",
    example:
      "A founder freezing before a pivot decision after 18 months of sunk cost, unable to read the market signal because identity is fused with the original idea.",
    takeaway:
      "Name the fear explicitly before modelling the decision. Unnamed anxiety silently rewrites your probabilities.",
  },
  {
    id: "karma-yoga",
    ref: "Chapter 2, Verse 47",
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।",
    translation:
      "You have a right to your action alone, never to its fruits. Let not the fruits be your motive.",
    framework: "Process-focused execution / Agile mindset",
    mapping:
      "Optimise the controllable input, not the volatile output. This is the operating logic of sprint cadence, leading indicators, and OKR key results tied to behaviour rather than luck.",
    example:
      "A sales org rewarding pipeline hygiene and discovery-call quality instead of only closed revenue — quarter-over-quarter variance drops sharply.",
    takeaway:
      "Measure what you control weekly; measure what you hope for quarterly.",
  },
  {
    id: "svadharma",
    ref: "Chapter 3, Verse 35",
    sanskrit: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात् ।",
    translation:
      "Better one's own duty imperfectly performed than another's duty performed well.",
    framework: "SWOT & core competence",
    mapping:
      "Svadharma is the strategic self-concept: compete from your genuine strength, not from an imitation of a rival's. Copying a competitor's playbook borrows their strengths and inherits none of your own.",
    example:
      "A regional grocer abandoning a doomed price war with a hyperscaler and winning on curation, freshness and local sourcing.",
    takeaway:
      "Strategy is the disciplined refusal to fight on someone else's terrain.",
  },
  {
    id: "equanimity",
    ref: "Chapter 2, Verse 48",
    sanskrit: "समत्वं योग उच्यते ।",
    translation: "Equanimity in success and failure — that is called yoga.",
    framework: "Risk-neutral decision-making",
    mapping:
      "Detachment is not indifference; it is emotional risk-neutrality. Loss aversion and euphoria both distort expected-value reasoning. The equanimous leader prices outcomes accurately.",
    example:
      "An investment committee that reviews a thesis identically after a 3x win and a write-off, avoiding both hubris and over-correction.",
    takeaway:
      "Write your decision rationale before you know the outcome. Judge the reasoning, not the result.",
  },
  {
    id: "krishna-counsel",
    ref: "Chapter 2, Verse 11",
    sanskrit: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे ।",
    translation:
      "You grieve for those who should not be grieved for, yet you speak words of wisdom.",
    framework: "Transformational leadership",
    mapping:
      "Krishna does not command; he reframes. Idealised influence, intellectual stimulation and individual consideration — he restores agency rather than issuing orders.",
    example:
      "A CEO in a downturn who replaces a fear narrative with a mission narrative, and lets teams choose how to hit the new constraint.",
    takeaway:
      "Great leaders change the question before they answer it.",
  },
  {
    id: "five-forces",
    ref: "Chapter 18, Verse 14",
    sanskrit: "अधिष्ठानं तथा कर्ता करणं च पृथग्विधम् ।",
    translation:
      "The seat of action, the doer, the instruments, the varied efforts, and destiny — these five are the causes of every act.",
    framework: "Porter's Five Forces",
    mapping:
      "Every outcome is multi-causal. Attribute performance to structure — buyers, suppliers, rivals, entrants, substitutes — before attributing it to the doer's brilliance or fault.",
    example:
      "A margin collapse blamed on the sales team that was in fact supplier concentration and a new low-cost substitute.",
    takeaway:
      "Before you change the team, check whether the industry structure changed.",
  },
  {
    id: "sthitaprajna",
    ref: "Chapter 2, Verse 62",
    sanskrit: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते ।",
    translation:
      "Dwelling on objects breeds attachment; from attachment springs desire, and from desire, anger.",
    framework: "Escalation of commitment",
    mapping:
      "The verse maps the escalation chain precisely: fixation → attachment → craving → distorted judgement. This is how sunk-cost bias and vanity projects survive board scrutiny.",
    example:
      "A conglomerate pouring three more years into a prestige division long after unit economics turned negative.",
    takeaway:
      "Pre-commit to kill criteria at the moment of funding, not at the moment of failure.",
  },
  {
    id: "yoga-karmasu",
    ref: "Chapter 2, Verse 50",
    sanskrit: "योगः कर्मसु कौशलम् ।",
    translation: "Yoga is skill in action.",
    framework: "Operational excellence",
    mapping:
      "Excellence is not intensity — it is skilful, low-friction execution. Continuous improvement, systems thinking and reduction of waste are the modern grammar of this verse.",
    example:
      "A manufacturer cutting changeover time by 60% through method, not overtime.",
    takeaway:
      "Effort without craft is expensive. Design the system, then work it.",
  },
];

/** Sheet-synced verses win when scripts/sync-content.mjs has populated them. */
export const verses: Verse[] = syncedVerses.length > 0 ? syncedVerses : builtInVerses;

export const leadershipLessons = [
  {
    title: "Crisis leadership",
    body: "Krishna enters the crisis already inside it — as charioteer, not as distant commander. Presence at the point of decision beats broadcast reassurance from headquarters.",
    practice: "Move toward the hardest conversation within 24 hours of the shock.",
  },
  {
    title: "Emotional intelligence",
    body: "Arjuna's collapse is diagnosed before it is corrected. Krishna names the state, validates the stakes, then redirects. Empathy is the entry point of influence.",
    practice: "Label the emotion in the room before proposing the plan.",
  },
  {
    title: "Ethical decision-making",
    body: "Dharma is the constraint that survives the pressure to win. When ethics is a filter applied before options are ranked, it never becomes a trade-off.",
    practice: "Screen options against non-negotiables first, economics second.",
  },
  {
    title: "Duty vs outcome thinking",
    body: "Outcome fixation produces short-termism and metric gaming. Duty orientation produces consistency, and consistency compounds into reputation.",
    practice: "Reward the standard held, not only the number hit.",
  },
];

export const archetypes = [
  {
    name: "Krishna",
    role: "The strategic leader",
    traits: [
      "Sees the full board, including consequences the actor cannot",
      "Coaches through questions rather than commands",
      "Holds the long horizon while acting in the present moment",
      "Accepts the charioteer's seat — service as authority",
    ],
  },
  {
    name: "Arjuna",
    role: "The overwhelmed decision-maker",
    traits: [
      "Highly capable, temporarily paralysed by conflicting duties",
      "Confuses emotional weight with strategic complexity",
      "Recovers agency once the frame changes",
      "The realistic portrait of most leaders in a real crisis",
    ],
  },
];

export const toolkit = [
  {
    name: "Dharma–Adharma SWOT",
    subtitle: "SWOT reframed as an ethical audit",
    body: "Run the standard four quadrants, then add a fifth question to each: does this strength, weakness, opportunity or threat move us toward dharma or away from it? Opportunities that require adharma are recorded as threats.",
    steps: [
      "List strengths and weaknesses honestly, without narrative",
      "Tag each opportunity as dharmic, neutral, or corrosive",
      "Discard corrosive opportunities before scoring",
      "Rank what remains on fit with svadharma — your true competence",
    ],
  },
  {
    name: "Karma Yoga Sprint",
    subtitle: "Process-focused execution",
    body: "Convert every outcome goal into a controllable weekly action set. Review the action set weekly, the outcome quarterly. The team's morale stops tracking market noise.",
    steps: [
      "Write the outcome you do not control",
      "Derive three inputs you fully control",
      "Instrument the inputs, not the outcome",
      "Retrospect on execution quality, never on luck",
    ],
  },
  {
    name: "Detachment Decision Ledger",
    subtitle: "Risk-neutral decision-making",
    body: "Before a consequential call, record the reasoning, the expected distribution, and the kill criteria. Review the ledger after the outcome and score the reasoning independently of the result.",
    steps: [
      "State the decision and the reversibility class",
      "Record base rates and the expected range",
      "Pre-commit kill criteria and a review date",
      "Score reasoning quality, not outcome, at review",
    ],
  },
  {
    name: "Sthitaprajna Focus Frame",
    subtitle: "Clarity under noise",
    body: "The steady mind filters inputs before it processes them. Reduce the decision surface to what changes the plan; everything else is information, not signal.",
    steps: [
      "List the three metrics that would change the plan",
      "Mute every dashboard that does not feed them",
      "Batch all other information into one weekly window",
      "Protect a daily hour of undisturbed judgement",
    ],
  },
];

export const caseStudies = [
  {
    title: "The startup that could not let go",
    situation:
      "A Series A team held a beloved product for three quarters after retention flatlined, out of loyalty to early users and to the founding story.",
    lens: "Arjuna mindset — attachment to identity mistaken for duty",
    reading:
      "Svadharma is not the first thing you built; it is the capability you uniquely hold. The team's real strength was distribution, not that product.",
    outcome:
      "Repositioned as an infrastructure layer for the same buyers. Attachment released, capability retained.",
  },
  {
    title: "The ethical dilemma in a growth quarter",
    situation:
      "A revenue leader was offered a channel deal that would hit the number but obscure true unit economics from the board.",
    lens: "Dharma as a pre-filter, not a trade-off",
    reading:
      "When ethics is applied after ranking, it always loses to the number. Applied before, the option simply never enters the set.",
    outcome:
      "Deal declined, the miss disclosed early, board trust materially strengthened for the following raise.",
  },
  {
    title: "The plant shutdown call",
    situation:
      "A manufacturing head had 48 hours to decide on a shutdown affecting 400 people, with contradictory safety data.",
    lens: "Krishna's counsel — reframe before deciding",
    reading:
      "The question was not 'shut down or not' but 'what is the least reversible harm'. Reframing revealed a staged option no one had modelled.",
    outcome:
      "Partial line halt with full pay, safety verified in nine days, zero attrition.",
  },
];

export const quotes = [
  {
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।",
    translation:
      "You have a right to action alone, never to its fruits.",
    insight:
      "Anchor incentives to inputs you control; outcome-only cultures breed short-termism.",
  },
  {
    sanskrit: "योगः कर्मसु कौशलम् ।",
    translation: "Yoga is skill in action.",
    insight: "Operational excellence is a spiritual discipline, not a cost programme.",
  },
  {
    sanskrit: "समत्वं योग उच्यते ।",
    translation: "Equanimity is called yoga.",
    insight: "The steady leader prices risk correctly because neither fear nor euphoria is on the books.",
  },
  {
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।",
    translation: "Lift yourself by yourself; do not degrade yourself.",
    insight: "Self-leadership precedes team leadership. Your standard becomes the ceiling.",
  },
  {
    sanskrit: "श्रेयान्स्वधर्मो विगुणः परधर्मात् ।",
    translation:
      "Better one's own duty imperfectly done than another's done well.",
    insight: "Differentiation beats imitation, even when imitation looks safer this quarter.",
  },
];

export const posts = [
  {
    slug: "karma-yoga-agile",
    title: "Karma Yoga and the Agile Mindset",
    excerpt:
      "Why the oldest argument for process discipline is also the most modern one — and how to convert outcome anxiety into sprint cadence.",
    read: "7 min",
    tag: "Execution",
  },
  {
    slug: "krishna-leadership",
    title: "Leadership Lessons from Krishna the Charioteer",
    excerpt:
      "Authority through service, influence through reframing, and why the best strategist in the epic never picks up a weapon.",
    read: "9 min",
    tag: "Leadership",
  },
  {
    slug: "strategy-uncertainty",
    title: "Strategic Thinking in Deep Uncertainty",
    excerpt:
      "Arjuna's collapse is a decision-science case study. A practical protocol for acting when the data will never be sufficient.",
    read: "8 min",
    tag: "Decision-making",
  },
  {
    slug: "emotional-control",
    title: "Emotional Control Is a Strategic Asset",
    excerpt:
      "Equanimity as risk-neutrality: how leaders who regulate affect end up with better-calibrated forecasts.",
    read: "6 min",
    tag: "Behaviour",
  },
];
