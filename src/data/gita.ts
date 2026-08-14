import { syncedVerses } from "./verses-generated";

/**
 * Content model for the Gita Strategy site.
 *
 * Every collection here is a plain array of typed objects, so new verses,
 * tools, case studies and quotes can be added by appending one entry — no
 * component changes required. Search, filters and counts derive from the data.
 */

export type Verse = {
  id: string;
  /** Human label, e.g. "Chapter 2, Verse 47". Derived from chapter/verse when synced. */
  ref: string;
  chapter?: number;
  verse?: string;
  sanskrit: string;
  translation: string;
  /** Named management framework this verse maps to. */
  framework: string;
  /** Theme used by the page filters, e.g. "Leadership". */
  theme?: string;
  mapping: string;
  example: string;
  takeaway: string;
};

function v(input: Omit<Verse, "ref"> & { ref?: string }): Verse {
  const ref =
    input.ref ??
    (input.chapter && input.verse ? `Chapter ${input.chapter}, Verse ${input.verse}` : "");
  return { ...input, ref };
}

const builtInVerses: Verse[] = [
  v({
    id: "arjuna-vishada",
    chapter: 1,
    verse: "29",
    theme: "Decision-making",
    sanskrit: "सीदन्ति मम गात्राणि मुखं च परिशुष्यति ।",
    translation:
      "My limbs give way and my mouth is parched; my whole body trembles as I stand before this battle.",
    framework: "Decision-making under uncertainty",
    mapping:
      "Arjuna's paralysis is classic analysis paralysis: high stakes, incomplete information, conflicting loyalties. The strategic response is to reframe the problem, separate emotion from evidence, and shrink the decision to the next reversible step.",
    example:
      "A founder freezing before a pivot decision after 18 months of sunk cost, unable to read the market signal because identity is fused with the original idea.",
    takeaway:
      "Name the fear explicitly before modelling the decision. Unnamed anxiety silently rewrites your probabilities.",
  }),
  v({
    id: "karma-yoga",
    chapter: 2,
    verse: "47",
    theme: "Execution",
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।",
    translation:
      "You have a right to your action alone, never to its fruits. Let not the fruits be your motive.",
    framework: "Process-focused execution / Agile mindset",
    mapping:
      "Optimise the controllable input, not the volatile output. This is the operating logic of sprint cadence, leading indicators, and OKR key results tied to behaviour rather than luck.",
    example:
      "A sales org rewarding pipeline hygiene and discovery-call quality instead of only closed revenue — quarter-over-quarter variance drops sharply.",
    takeaway: "Measure what you control weekly; measure what you hope for quarterly.",
  }),
  v({
    id: "svadharma",
    chapter: 3,
    verse: "35",
    theme: "Strategy",
    sanskrit: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात् ।",
    translation: "Better one's own duty imperfectly performed than another's duty performed well.",
    framework: "Core competence & SWOT",
    mapping:
      "Svadharma is the strategic self-concept: compete from your genuine strength, not from an imitation of a rival's. Copying a competitor's playbook borrows their strengths and inherits none of your own.",
    example:
      "A regional grocer abandoning a doomed price war with a hyperscaler and winning on curation, freshness and local sourcing.",
    takeaway: "Strategy is the disciplined refusal to fight on someone else's terrain.",
  }),
  v({
    id: "equanimity",
    chapter: 2,
    verse: "48",
    theme: "Mindset",
    sanskrit: "समत्वं योग उच्यते ।",
    translation: "Equanimity in success and failure — that is called yoga.",
    framework: "Risk-neutral decision-making",
    mapping:
      "Detachment is not indifference; it is emotional risk-neutrality. Loss aversion and euphoria both distort expected-value reasoning. The equanimous leader prices outcomes accurately.",
    example:
      "An investment committee that reviews a thesis identically after a 3x win and a write-off, avoiding both hubris and over-correction.",
    takeaway:
      "Write your decision rationale before you know the outcome. Judge the reasoning, not the result.",
  }),
  v({
    id: "krishna-counsel",
    chapter: 2,
    verse: "11",
    theme: "Leadership",
    sanskrit: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे ।",
    translation: "You grieve for those who should not be grieved for, yet you speak words of wisdom.",
    framework: "Transformational leadership",
    mapping:
      "Krishna does not command; he reframes. Idealised influence, intellectual stimulation and individual consideration — he restores agency rather than issuing orders.",
    example:
      "A CEO in a downturn who replaces a fear narrative with a mission narrative, and lets teams choose how to hit the new constraint.",
    takeaway: "Great leaders change the question before they answer it.",
  }),
  v({
    id: "five-causes",
    chapter: 18,
    verse: "14",
    theme: "Strategy",
    sanskrit: "अधिष्ठानं तथा कर्ता करणं च पृथग्विधम् ।",
    translation:
      "The seat of action, the doer, the instruments, the varied efforts, and destiny — these five are the causes of every act.",
    framework: "Porter's Five Forces / attribution analysis",
    mapping:
      "Every outcome is multi-causal. Attribute performance to structure — buyers, suppliers, rivals, entrants, substitutes — before attributing it to the doer's brilliance or fault.",
    example:
      "A margin collapse blamed on the sales team that was in fact supplier concentration plus a new low-cost substitute.",
    takeaway: "Before you change the team, check whether the industry structure changed.",
  }),
  v({
    id: "sthitaprajna",
    chapter: 2,
    verse: "62–63",
    theme: "Decision-making",
    sanskrit: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते ।",
    translation:
      "Dwelling on objects breeds attachment; from attachment springs desire, and from desire, anger.",
    framework: "Escalation of commitment / sunk-cost bias",
    mapping:
      "The verse maps the escalation chain precisely: fixation → attachment → craving → distorted judgement. This is how sunk-cost bias and vanity projects survive board scrutiny.",
    example:
      "A conglomerate pouring three more years into a prestige division long after unit economics turned negative.",
    takeaway: "Pre-commit to kill criteria at the moment of funding, not at the moment of failure.",
  }),
  v({
    id: "yoga-karmasu",
    chapter: 2,
    verse: "50",
    theme: "Execution",
    sanskrit: "योगः कर्मसु कौशलम् ।",
    translation: "Yoga is skill in action.",
    framework: "Operational excellence",
    mapping:
      "Excellence is not intensity — it is skilful, low-friction execution. Continuous improvement, systems thinking and reduction of waste are the modern grammar of this verse.",
    example: "A manufacturer cutting changeover time by 60% through method, not overtime.",
    takeaway: "Effort without craft is expensive. Design the system, then work it.",
  }),
  v({
    id: "self-lift",
    chapter: 6,
    verse: "5",
    theme: "Mindset",
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।",
    translation:
      "Lift yourself by your own self; do not degrade yourself. The self alone is the friend and the enemy of the self.",
    framework: "Self-leadership & locus of control",
    mapping:
      "Performance follows internal locus of control. Before diagnosing the team, the leader audits their own standards, energy and self-talk — the ceiling of a team is usually the ceiling of its leader.",
    example:
      "A newly promoted head who books a weekly self-review hour and stops outsourcing accountability to 'the market' during a bad quarter.",
    takeaway: "Your own discipline is the cheapest lever you own — and the first one you should pull.",
  }),
  v({
    id: "yogastha",
    chapter: 2,
    verse: "48b",
    theme: "Performance",
    sanskrit: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय ।",
    translation: "Established in yoga, perform your work, abandoning attachment.",
    framework: "Flow state & sustainable performance",
    mapping:
      "Steadiness first, action second. High performance is a stable baseline plus consistent effort, not adrenaline bursts followed by burnout.",
    example:
      "An engineering org replacing crunch releases with a fixed, protected release cadence — defect rate and attrition both fall.",
    takeaway: "Stabilise the operating rhythm before you raise the target.",
  }),
  v({
    id: "sattva-rajas-tamas",
    chapter: 14,
    verse: "5–9",
    theme: "Management",
    sanskrit: "सत्त्वं रजस्तम इति गुणाः प्रकृतिसम्भवाः ।",
    translation:
      "Sattva, rajas and tamas — these three qualities born of nature bind the embodied self.",
    framework: "Organisational culture diagnosis",
    mapping:
      "The three gunas make a usable culture diagnostic: sattva (clarity, learning), rajas (restless activity, politics), tamas (inertia, denial). Most dysfunctions are a culture stuck in one mode.",
    example:
      "A scale-up in permanent rajas — endless reorgs and launches — mistaking motion for progress until it installs a quarterly stop-doing list.",
    takeaway: "Diagnose the dominant mode of your culture before you design the intervention.",
  }),
  v({
    id: "yajna",
    chapter: 3,
    verse: "10–12",
    theme: "Ethics",
    sanskrit: "सहयज्ञाः प्रजाः सृष्ट्वा पुरोवाच प्रजापतिः ।",
    translation:
      "Having created humankind along with sacrifice, the Creator said: by this shall you prosper, let this be the giver of your desires.",
    framework: "Stakeholder capitalism / value co-creation",
    mapping:
      "Yajna is reciprocal contribution: value flows to those who feed the system. Extracting from customers, suppliers or employees without returning value is a short cycle that ends.",
    example:
      "A platform that shares margin with its supply side, cutting churn and raising quality where competitors squeeze and lose sellers.",
    takeaway: "Design your business so every stakeholder has a reason to keep feeding it.",
  }),
  v({
    id: "leader-example",
    chapter: 3,
    verse: "21",
    theme: "Leadership",
    sanskrit: "यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः ।",
    translation:
      "Whatever a great person does, others follow; the standard they set, the world pursues.",
    framework: "Role modelling / tone from the top",
    mapping:
      "Culture is not the values poster; it is the worst behaviour the leader tolerates and the behaviour they personally display. Modelling beats mandating.",
    example:
      "A CFO who publicly reverses their own approved project after new data — post-mortems across the company stop being defensive.",
    takeaway: "Your calendar and your exceptions are the real culture document.",
  }),
  v({
    id: "no-anxiety",
    chapter: 2,
    verse: "38",
    theme: "Decision-making",
    sanskrit: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ ।",
    translation:
      "Treating pleasure and pain, gain and loss, victory and defeat alike, engage in the battle.",
    framework: "Expected-value thinking",
    mapping:
      "Symmetric treatment of upside and downside is exactly what unbiased expected-value reasoning demands. Asymmetric fear of loss produces both over-caution and reckless recovery bets.",
    example:
      "A pricing team running the same review protocol after a win and a loss, rather than only autopsying losses.",
    takeaway: "Review wins with the same rigour as losses, or you will only learn half the lesson.",
  }),
  v({
    id: "know-through-inquiry",
    chapter: 4,
    verse: "34",
    theme: "Management",
    sanskrit: "तद्विद्धि प्रणिपातेन परिप्रश्नेन सेवया ।",
    translation:
      "Learn this by approaching a teacher, by humble enquiry and by service; the wise will instruct you.",
    framework: "Coaching, mentorship & learning organisations",
    mapping:
      "Capability transfer requires humility, structured questioning and real proximity to the work. This is the mentoring loop and the basis of a learning organisation.",
    example:
      "A leadership team pairing every new director with an operator mentor and a monthly 'ask anything' review.",
    takeaway: "Ask better questions of better people, and go close enough to the work to be taught.",
  }),
  v({
    id: "no-attachment-inaction",
    chapter: 2,
    verse: "31",
    theme: "Ethics",
    sanskrit: "स्वधर्ममपि चावेक्ष्य न विकम्पितुमर्हसि ।",
    translation: "Considering your own duty, you should not waver.",
    framework: "Values-based governance",
    mapping:
      "When a decision aligns with a clearly defined duty, hesitation is a cost, not a virtue. Codify your non-negotiables so hard calls become fast calls.",
    example:
      "A board with a written escalation policy that removes weeks of debate when a compliance breach surfaces.",
    takeaway: "Decide your principles in calm weather so you can act instantly in a storm.",
  }),
  v({
    id: "abhyasa-vairagya",
    chapter: 6,
    verse: "35",
    theme: "Performance",
    sanskrit: "अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते ।",
    translation: "By practice and by dispassion, the restless mind is restrained.",
    framework: "Deliberate practice & focus management",
    mapping:
      "Two levers only: repetition of the right behaviour, and deliberate removal of distraction. Every productivity system is a rediscovery of abhyasa and vairagya.",
    example:
      "A product team that ships one focused bet per quarter and formally shelves the rest until review.",
    takeaway: "Repetition plus subtraction beats motivation every single quarter.",
  }),
  v({
    id: "friend-to-all",
    chapter: 12,
    verse: "13–14",
    theme: "Leadership",
    sanskrit: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च ।",
    translation:
      "One who hates no being, who is friendly and compassionate, free from ego and steady — such a one is dear to me.",
    framework: "Psychological safety & servant leadership",
    mapping:
      "The Gita's portrait of the ideal actor is a description of psychological safety: no hostility, low ego, steadiness. Teams speak the truth to leaders who behave this way.",
    example:
      "An operations head who thanks the person who reports a defect publicly — near-miss reporting triples within a quarter.",
    takeaway: "Reward the messenger and you will get the message while it is still cheap.",
  }),
];

/** Sheet-synced verses win when scripts/sync-content.mjs has populated them. */
export const verses: Verse[] = syncedVerses.length > 0 ? syncedVerses : builtInVerses;

/** Distinct frameworks / themes, derived so filters never go stale. */
export const verseFrameworks = Array.from(new Set(verses.map((x) => x.framework))).sort();
export const verseThemes = Array.from(
  new Set(verses.map((x) => x.theme).filter((t): t is string => Boolean(t))),
).sort();

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

export type Tool = {
  id: string;
  name: string;
  subtitle: string;
  category: "Strategy" | "Leadership" | "Decision-making" | "Execution" | "Ethics";
  /** One-line definition: what the tool is. */
  what: string;
  /** When to reach for it. */
  when: string;
  body: string;
  steps: string[];
  verse: string;
  example: string;
};

export const toolkit: Tool[] = [
  {
    id: "dharma-swot",
    name: "Dharma–Adharma SWOT",
    subtitle: "SWOT reframed as an ethical audit",
    category: "Strategy",
    what: "A standard SWOT with an ethics screen applied to every entry before scoring.",
    when: "Annual planning, entering a new market, or evaluating a fast-money opportunity.",
    body: "Run the four quadrants, then add a fifth question to each item: does this strength, weakness, opportunity or threat move us toward dharma or away from it? Opportunities that require adharma are recorded as threats, because that is what they eventually become.",
    steps: [
      "List strengths and weaknesses honestly, without narrative",
      "Tag each opportunity as dharmic, neutral, or corrosive",
      "Discard corrosive opportunities before scoring",
      "Rank what remains on fit with svadharma — your true competence",
    ],
    verse: "Chapter 3, Verse 35 — better one's own duty imperfectly performed",
    example:
      "A fintech drops a high-margin lending product whose economics depend on customer confusion, and redirects the team to its underwriting edge.",
  },
  {
    id: "karma-yoga-sprint",
    name: "Karma Yoga Sprint",
    subtitle: "Process-focused execution",
    category: "Execution",
    what: "A weekly operating cadence that measures controllable inputs instead of volatile outcomes.",
    when: "Any team whose morale rides the outcome graph — sales, fundraising, growth, hiring.",
    body: "Convert every outcome goal into a controllable weekly action set. Review the action set weekly and the outcome quarterly, so the team's confidence stops tracking market noise.",
    steps: [
      "Write the outcome you do not control",
      "Derive three inputs you fully control",
      "Instrument the inputs, not the outcome",
      "Retrospect on execution quality, never on luck",
    ],
    verse: "Chapter 2, Verse 47 — a right to action, never to its fruits",
    example:
      "A B2B team tracks 20 qualified discovery calls a week rather than bookings; forecast accuracy improves within two quarters.",
  },
  {
    id: "detachment-ledger",
    name: "Detachment Decision Ledger",
    subtitle: "Risk-neutral decision-making",
    category: "Decision-making",
    what: "A written record of reasoning, expected range and kill criteria captured before the outcome is known.",
    when: "Irreversible or expensive decisions: pricing changes, big hires, capital allocation.",
    body: "Before a consequential call, record the reasoning, the expected distribution and the kill criteria. Review the ledger after the outcome and score the reasoning independently of the result.",
    steps: [
      "State the decision and the reversibility class",
      "Record base rates and the expected range",
      "Pre-commit kill criteria and a review date",
      "Score reasoning quality, not outcome, at review",
    ],
    verse: "Chapter 2, Verse 48 — equanimity in success and failure",
    example:
      "A hardware team kills a programme on a pre-agreed yield trigger instead of arguing for one more revision.",
  },
  {
    id: "sthitaprajna-focus",
    name: "Sthitaprajna Focus Frame",
    subtitle: "Clarity under noise",
    category: "Decision-making",
    what: "A filter that reduces your dashboard surface to the few metrics that could change the plan.",
    when: "Information overload, reactive firefighting, too many dashboards and alerts.",
    body: "The steady mind filters inputs before it processes them. Reduce the decision surface to what changes the plan; everything else is information, not signal.",
    steps: [
      "List the three metrics that would change the plan",
      "Mute every dashboard that does not feed them",
      "Batch all other information into one weekly window",
      "Protect a daily hour of undisturbed judgement",
    ],
    verse: "Chapter 2, Verses 62–63 — attachment breeds distorted judgement",
    example:
      "A founder moves from 11 daily alerts to one Monday review and a single retention chart; decision latency halves.",
  },
  {
    id: "guna-culture-scan",
    name: "Guna Culture Scan",
    subtitle: "Diagnose the dominant mode of your organisation",
    category: "Leadership",
    what: "A three-mode culture diagnostic using sattva (clarity), rajas (restlessness) and tamas (inertia).",
    when: "Before a reorg, after a merger, or when engagement scores fall without an obvious cause.",
    body: "Score recent decisions, meetings and escalations against the three gunas. Rajas-heavy cultures confuse motion with progress; tamas-heavy cultures protect the status quo; sattva shows up as calm, evidence-led debate.",
    steps: [
      "Sample twenty recent decisions and tag each guna",
      "Plot the mix by team and by level",
      "Name the dominant mode out loud to the leadership team",
      "Pick one structural fix per mode — a stop-doing list for rajas, a forcing function for tamas",
    ],
    verse: "Chapter 14, Verses 5–9 — the three qualities born of nature",
    example:
      "A scale-up ends permanent reorg churn by capping concurrent initiatives at three per quarter.",
  },
  {
    id: "svadharma-canvas",
    name: "Svadharma Canvas",
    subtitle: "Find the work only you can do",
    category: "Strategy",
    what: "A one-page canvas that separates genuine capability from inherited habit and competitor imitation.",
    when: "Pivots, portfolio pruning, positioning work, or personal career decisions.",
    body: "Map what you are uniquely good at, what the market rewards, what your values permit and what you are merely copying. The intersection of the first three, minus the fourth, is svadharma.",
    steps: [
      "List capabilities evidenced by results, not aspiration",
      "List demand signals customers actually pay for",
      "Strike anything that violates a non-negotiable",
      "Strike anything you are doing only because a rival does it",
    ],
    verse: "Chapter 18, Verses 45–47 — perfection through one's own work",
    example:
      "A services firm exits generic implementation work and doubles down on regulated-industry migrations.",
  },
  {
    id: "yajna-stakeholder-loop",
    name: "Yajna Stakeholder Loop",
    subtitle: "Reciprocity as an operating rule",
    category: "Ethics",
    what: "A review that checks whether each stakeholder still receives value proportionate to what they give.",
    when: "Marketplace design, supplier negotiations, pricing reviews, partner programmes.",
    body: "Yajna is reciprocal contribution. Map every flow of value in and out of the business; wherever value flows one way only, model when that relationship breaks.",
    steps: [
      "Draw value in and value out for each stakeholder",
      "Flag any one-way flow",
      "Estimate the break point in months",
      "Redesign the weakest loop before it fails",
    ],
    verse: "Chapter 3, Verses 10–12 — prosper together through sacrifice",
    example:
      "A marketplace raises seller payouts ahead of a competitor's squeeze and gains the best supply in the category.",
  },
  {
    id: "charioteer-crisis-protocol",
    name: "Charioteer Crisis Protocol",
    subtitle: "Reframe before you decide",
    category: "Leadership",
    what: "A four-step crisis routine modelled on Krishna's counsel: presence, naming, reframing, next reversible step.",
    when: "Shock events — outages, safety incidents, funding failure, sudden attrition.",
    body: "Krishna's intervention is not a command; it is a sequence. Be physically present at the decision point, name the emotional state, change the question being asked, then choose the least irreversible action available.",
    steps: [
      "Show up at the point of decision within 24 hours",
      "Name the emotion in the room before the plan",
      "Restate the question — usually 'what is the least reversible harm?'",
      "Commit to one reversible step and a review time",
    ],
    verse: "Chapter 2, Verse 11 — you grieve for those who should not be grieved for",
    example:
      "A plant head replaces 'shut down or not' with 'least reversible harm' and finds a staged option nobody had modelled.",
  },
];

export const toolCategories = Array.from(new Set(toolkit.map((t) => t.category))).sort();

export type CaseStudy = {
  id: string;
  title: string;
  category:
    | "Leadership"
    | "Strategy"
    | "Decision-making"
    | "People"
    | "Change"
    | "Ethics"
    | "Crisis"
    | "Entrepreneurship";
  situation: string;
  challenge: string;
  /** Gita lens applied. */
  lens: string;
  verse: string;
  reading: string;
  /** What was actually done. */
  action: string;
  outcome: string;
  takeaway: string;
};

export const caseStudies: CaseStudy[] = [
  {
    id: "startup-attachment",
    title: "The startup that could not let go",
    category: "Entrepreneurship",
    situation:
      "A Series A team held a beloved product for three quarters after retention flatlined, out of loyalty to early users and to the founding story.",
    challenge:
      "Every pivot conversation collapsed into identity: killing the product felt like admitting the founding thesis was wrong.",
    lens: "Arjuna mindset — attachment to identity mistaken for duty",
    verse: "Chapter 3, Verse 35 — svadharma",
    reading:
      "Svadharma is not the first thing you built; it is the capability you uniquely hold. The team's real strength was distribution into a hard-to-reach buyer, not that particular product.",
    action:
      "The team ran a Svadharma Canvas, separated capability from artefact, and repositioned as an infrastructure layer for the same buyers.",
    outcome: "Attachment released, capability retained; net revenue retention recovered above 110%.",
    takeaway:
      "Ask what capability you are protecting, not what product. Products are disposable; capability is svadharma.",
  },
  {
    id: "ethical-growth-quarter",
    title: "The ethical dilemma in a growth quarter",
    category: "Ethics",
    situation:
      "A revenue leader was offered a channel deal that would hit the number but obscure true unit economics from the board.",
    challenge:
      "The deal was legal, the quarter was short, and no one downstream would notice for at least two reporting cycles.",
    lens: "Dharma as a pre-filter, not a trade-off",
    verse: "Chapter 2, Verse 31 — considering your own duty, do not waver",
    reading:
      "When ethics is applied after ranking, it always loses to the number. Applied before, the option simply never enters the option set.",
    action:
      "The leader moved the ethics screen ahead of scoring, declined the deal, and disclosed the projected miss to the board six weeks early.",
    outcome: "Deal declined, miss disclosed early, board trust materially strengthened for the next raise.",
    takeaway: "Move the ethics gate earlier in the process and it stops being a sacrifice.",
  },
  {
    id: "plant-shutdown",
    title: "The plant shutdown call",
    category: "Crisis",
    situation:
      "A manufacturing head had 48 hours to decide on a shutdown affecting 400 people, with contradictory safety data.",
    challenge:
      "Both options looked catastrophic: shut down and lose the quarter, or continue and risk an injury nobody could forgive.",
    lens: "Krishna's counsel — reframe before deciding",
    verse: "Chapter 2, Verse 11 — reframing before instruction",
    reading:
      "The question was not 'shut down or not' but 'what is the least reversible harm'. Reframing revealed a staged option no one had modelled.",
    action:
      "Partial line halt with full pay, independent safety verification, daily briefings to the whole plant.",
    outcome: "Safety verified in nine days, zero attrition, insurer premium unchanged.",
    takeaway: "In a crisis, spend the first hour on the question, not the answer.",
  },
  {
    id: "post-merger-culture",
    title: "Two cultures, one org chart",
    category: "Change",
    situation:
      "After acquiring a smaller rival, a services firm merged two delivery organisations with incompatible operating habits.",
    challenge:
      "The acquired team read every process change as a loss of identity; the acquiring team read every objection as resistance.",
    lens: "Guna diagnosis — rajas colliding with tamas",
    verse: "Chapter 14, Verses 5–9 — the three qualities",
    reading:
      "The acquirer was rajas-dominant (constant motion), the acquired firm tamas-dominant (protective inertia). Neither was wrong; both needed a route to sattva.",
    action:
      "A 90-day integration charter: three changes only, jointly designed, with an explicit stop-doing list on the acquirer's side.",
    outcome: "Voluntary attrition in the acquired team fell from 22% to 7% over two quarters.",
    takeaway: "Name the cultural mode on both sides before you write the integration plan.",
  },
  {
    id: "underperforming-manager",
    title: "The manager everyone avoided",
    category: "People",
    situation:
      "A technically brilliant engineering manager delivered on time but produced consistent attrition on their team.",
    challenge:
      "Performance metrics said keep; exit interviews said act. The leadership team had avoided the conversation for a year.",
    lens: "Leadership by example — the standard you tolerate",
    verse: "Chapter 3, Verse 21 — whatever a great person does, others follow",
    reading:
      "Tolerating a corrosive standard broadcasts it. The tolerated behaviour, not the values page, became the company's real culture document.",
    action:
      "A direct, specific conversation with measurable behavioural expectations, coaching support and a 90-day review date.",
    outcome:
      "Behaviour changed on two of three dimensions; the manager moved to an individual-contributor architect role by mutual agreement.",
    takeaway: "The behaviour a leader tolerates is the behaviour the company is teaching.",
  },
  {
    id: "pricing-under-uncertainty",
    title: "Pricing with no good data",
    category: "Decision-making",
    situation:
      "A SaaS company had to reprice for a new segment with no comparable benchmarks and a board expecting a number.",
    challenge:
      "Every analysis produced a different answer, and each week of delay cost pipeline.",
    lens: "Equanimity — symmetric treatment of gain and loss",
    verse: "Chapter 2, Verse 38 — treating gain and loss alike",
    reading:
      "The data would never be sufficient. What was missing was not information but a pre-committed way to judge the decision after the fact.",
    action:
      "A Detachment Decision Ledger: written reasoning, expected range, kill criteria, and a 90-day review of the reasoning rather than the result.",
    outcome:
      "Priced in nine days instead of a quarter; the ledger review kept the second price change calm and evidence-led.",
    takeaway: "When data runs out, upgrade the decision process, not the analysis.",
  },
  {
    id: "burnout-before-launch",
    title: "Burnt out three weeks before launch",
    category: "Leadership",
    situation:
      "A product team hit exhaustion just before the most important launch of the year.",
    challenge:
      "Pushing harder risked defects and resignations; slipping the date risked a competitor's window.",
    lens: "Established in yoga, perform your work",
    verse: "Chapter 2, Verse 48 — steadiness before action",
    reading:
      "Sustainable performance is a stable baseline plus consistent effort. Crunch borrows from the quarter after the launch at a punitive interest rate.",
    action:
      "Scope cut to the two features that carried the promise, a protected no-meeting block daily, and a fixed post-launch recovery week.",
    outcome: "Shipped on date with 40% fewer critical defects than the previous launch; no resignations.",
    takeaway: "Cut scope, not people. Rhythm is a strategy, not a perk.",
  },
  {
    id: "founder-conflict",
    title: "Two founders, one decision right",
    category: "Strategy",
    situation:
      "Co-founders deadlocked over whether to serve enterprise or self-serve customers, each with a credible case.",
    challenge:
      "The disagreement had become personal, and the team was quietly picking sides.",
    lens: "Humble enquiry over positional debate",
    verse: "Chapter 4, Verse 34 — learn by enquiry and service",
    reading:
      "Positional argument hardens; enquiry moves. The founders needed a shared question and an external teacher, not a winner.",
    action:
      "Ten structured customer interviews each, run on the other's hypothesis, followed by a joint written recommendation.",
    outcome: "Chose enterprise with a self-serve entry path; the deadlock ended in three weeks.",
    takeaway: "Assign each side to argue the other's case with real evidence.",
  },
];

export const caseCategories = Array.from(new Set(caseStudies.map((c) => c.category))).sort();

export type Quote = {
  id: string;
  sanskrit: string;
  translation: string;
  /** Chapter and verse when the line is from the Gita; empty for editorial lines. */
  ref: string;
  category:
    | "Leadership"
    | "Strategy"
    | "Decision-Making"
    | "Focus"
    | "Action"
    | "Mindset"
    | "Resilience"
    | "Ethics"
    | "Success"
    | "Management";
  insight: string;
};

export const quotes: Quote[] = [
  {
    id: "q-2-47",
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।",
    translation: "You have a right to action alone, never to its fruits.",
    ref: "Chapter 2, Verse 47",
    category: "Action",
    insight: "Anchor incentives to inputs you control; outcome-only cultures breed short-termism.",
  },
  {
    id: "q-2-50",
    sanskrit: "योगः कर्मसु कौशलम् ।",
    translation: "Yoga is skill in action.",
    ref: "Chapter 2, Verse 50",
    category: "Management",
    insight: "Operational excellence is a discipline of craft, not a cost programme.",
  },
  {
    id: "q-2-48",
    sanskrit: "समत्वं योग उच्यते ।",
    translation: "Equanimity is called yoga.",
    ref: "Chapter 2, Verse 48",
    category: "Decision-Making",
    insight:
      "The steady leader prices risk correctly because neither fear nor euphoria is on the books.",
  },
  {
    id: "q-6-5",
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।",
    translation: "Lift yourself by yourself; do not degrade yourself.",
    ref: "Chapter 6, Verse 5",
    category: "Mindset",
    insight: "Self-leadership precedes team leadership. Your standard becomes the ceiling.",
  },
  {
    id: "q-3-35",
    sanskrit: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात् ।",
    translation: "Better one's own duty imperfectly done than another's done well.",
    ref: "Chapter 3, Verse 35",
    category: "Strategy",
    insight: "Differentiation beats imitation, even when imitation looks safer this quarter.",
  },
  {
    id: "q-3-21",
    sanskrit: "यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः ।",
    translation: "Whatever a great person does, others follow.",
    ref: "Chapter 3, Verse 21",
    category: "Leadership",
    insight: "Culture is the behaviour you model and the exceptions you allow — not the values poster.",
  },
  {
    id: "q-2-38",
    sanskrit: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ ।",
    translation: "Treating pleasure and pain, gain and loss, victory and defeat alike.",
    ref: "Chapter 2, Verse 38",
    category: "Resilience",
    insight: "Review your wins with the rigour you reserve for losses.",
  },
  {
    id: "q-6-35",
    sanskrit: "अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते ।",
    translation: "By practice and by dispassion, the restless mind is restrained.",
    ref: "Chapter 6, Verse 35",
    category: "Focus",
    insight: "Repetition plus subtraction outperforms motivation in every quarter.",
  },
  {
    id: "q-3-10",
    sanskrit: "सहयज्ञाः प्रजाः सृष्ट्वा पुरोवाच प्रजापतिः ।",
    translation:
      "Having created humankind along with sacrifice, the Creator said: by this shall you prosper.",
    ref: "Chapter 3, Verse 10",
    category: "Ethics",
    insight: "Design every relationship so the other side has a reason to keep feeding the system.",
  },
  {
    id: "q-4-34",
    sanskrit: "तद्विद्धि प्रणिपातेन परिप्रश्नेन सेवया ।",
    translation: "Learn by approaching a teacher, by humble enquiry and by service.",
    ref: "Chapter 4, Verse 34",
    category: "Management",
    insight: "Capability transfers through proximity and questions, never through slide decks.",
  },
  {
    id: "q-18-46",
    sanskrit: "स्वकर्मणा तमभ्यर्च्य सिद्धिं विन्दति मानवः ।",
    translation: "By worshipping through one's own work, a person attains perfection.",
    ref: "Chapter 18, Verse 46",
    category: "Success",
    insight: "Mastery of your actual job is a more reliable path to standing than repositioning.",
  },
  {
    id: "q-2-62",
    sanskrit: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते ।",
    translation: "Dwelling on objects breeds attachment; from attachment springs desire.",
    ref: "Chapter 2, Verse 62",
    category: "Decision-Making",
    insight: "Escalation of commitment starts as harmless fixation. Set kill criteria early.",
  },
];

export const quoteCategories = Array.from(new Set(quotes.map((q) => q.category))).sort();

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
