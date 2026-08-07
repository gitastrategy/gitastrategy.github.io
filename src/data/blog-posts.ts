import type { LinkedInPost } from "./linkedin-posts";

// Long-form editorial essays written for Gita Strategy. These share the shape of
// the synced LinkedIn articles so both render through the same Article/Blog pages.

export const blogPosts: LinkedInPost[] = [
  {
    id: "blog-karma-yoga-agile",
    slug: "karma-yoga-agile",
    date: "10-Jan-2026",
    title: "Karma Yoga and the Agile Mindset",
    category: "Execution",
    subCategory: "Operating Cadence",
    topic: "Karma Yoga",
    trend: "Detached Execution",
    summary:
      "Why the oldest argument for process discipline is also the most modern one — and how to convert outcome anxiety into sprint cadence.",
    imageUrl: "",
    urn: "",
    content: `**Karmanye vadhikaraste ma phaleshu kadachana** — you have a right to the action, never to its fruits (2.47).

Read that as an operating principle rather than a consolation and it becomes the cleanest statement of agile management ever written. Agile teams do not fail because they lack ambition. They fail because ambition attaches itself to an outcome the team cannot control — a funding round, a competitor's roadmap, a market that turns — and the anxiety of that attachment corrupts the only thing the team *can* control: the quality and cadence of the next unit of work.

## Attachment is a process defect

Outcome attachment shows up in a predictable pattern:

1. The team commits to a number instead of a behaviour.
2. When the number slips, effort is redirected to explaining the number.
3. Explanation work crowds out the work that would have moved the number.
4. Morale collapses, and the team stops making honest estimates.

Krishna's counsel interrupts the loop at step one. Commit to the action — the shipped increment, the customer conversation, the reduced cycle time — and let the fruit arrive as a consequence rather than a demand.

## Translating the verse into cadence

**Define the karma, not the phala.** A sprint goal should describe work the team can complete without another party's cooperation. "Ship the onboarding rewrite" is karma. "Lift activation 12%" is phala. Track both; commit only to the first.

**Make the review about the doing.** Ask what the team learned about the system, not whether the number moved. The number is a lagging report card; the learning is the asset.

**Separate the scoreboard from the practice.** Review outcome metrics monthly with leadership. Review process metrics — cycle time, WIP, defect escape rate — weekly with the team. Mixing the two cadences is what produces theatre.

**Retire heroism.** Nishkama karma removes the ego reward from the last-minute rescue. The team that never needs a hero is the team that has actually understood 2.47.

## The paradox that makes it work

Detachment from results is not indifference to results. It is the recognition that results are downstream, probabilistic, and shared with the market — while action is immediate, controllable, and yours. Teams that internalise this become measurably calmer under pressure, estimate more honestly, and, precisely because they stopped grasping at it, tend to hit the number.

**This week:** rewrite your current sprint goal so that it contains no outcome your team cannot deliver alone. Note what the rewrite exposes about your dependencies.`,
  },
  {
    id: "blog-krishna-leadership",
    slug: "krishna-leadership",
    date: "17-Jan-2026",
    title: "Leadership Lessons from Krishna the Charioteer",
    category: "Leadership",
    subCategory: "Leader as Coach",
    topic: "Krishna archetype",
    trend: "Servant Leadership",
    summary:
      "Authority through service, influence through reframing, and why the best strategist in the epic never picks up a weapon.",
    imageUrl: "",
    urn: "",
    content: `The most consequential strategist on the field of Kurukshetra holds the reins, not a bow. Krishna's chosen role — charioteer to a warrior who outranks him in nothing but battlefield function — is the original case study in leading through influence rather than authority.

## He takes the seat that gives him proximity

A charioteer sits in front, sees the whole field, and controls direction while the warrior controls force. Krishna does not compete with Arjuna for the glory role; he takes the role with the best information and the most leverage over movement. Modern equivalent: the leader who insists on being in the room where the work happens rather than the room where the work is reported.

## He lets the collapse happen

Arjuna's breakdown in Chapter 1 is not interrupted. Krishna allows a full, humiliating articulation of the doubt before responding. Leaders who rush to reassure never learn what the objection actually is. The pause is diagnostic.

## He reframes rather than commands

Krishna could have ordered Arjuna to fight. Instead he moves the frame three times: from the personal (my kinsmen) to the eternal (the imperishable self), from the eternal to the functional (your dharma as a warrior), and from the functional to the practical (act without attachment). Each reframe makes the previous objection irrelevant instead of arguing with it.

## He escalates evidence only when needed

The cosmic revelation in Chapter 11 arrives late and once. Overwhelming demonstrations of authority are a finite resource; spend them when reasoning has genuinely run out, not to win the first disagreement.

## He returns the decision

"Reflect on this fully, then do as you wish" (18.63). After eighteen chapters, Krishna hands agency back. This is the line most leaders skip. Ownership that is not freely taken is compliance, and compliance degrades the moment the leader leaves the room.

## The four practices to steal

- **Sit where the information is.** Trade status for sightlines.
- **Let the objection finish.** Diagnose before you counsel.
- **Change the frame, not the volume.** Louder is not more persuasive.
- **Hand back the choice.** Then hold the person to it.

**This week:** in your next difficult conversation, say nothing for the first three minutes beyond questions. Notice how much of your prepared answer becomes irrelevant.`,
  },
  {
    id: "blog-strategy-uncertainty",
    slug: "strategy-uncertainty",
    date: "24-Jan-2026",
    title: "Strategic Thinking in Deep Uncertainty",
    category: "Decision-making",
    subCategory: "Judgement Under Ambiguity",
    topic: "Vishada Yoga",
    trend: "Decision Science",
    summary:
      "Arjuna's collapse is a decision-science case study. A practical protocol for acting when the data will never be sufficient.",
    imageUrl: "",
    urn: "",
    content: `Chapter 1 of the Gita is titled *Arjuna Vishada Yoga* — the yoga of Arjuna's despair. It is also one of literature's most precise descriptions of decision paralysis under deep uncertainty: irreversible stakes, conflicting values, incomplete information, and a clock that will not stop.

## Deep uncertainty is not risk

Risk has a distribution you can estimate. Deep uncertainty does not: you cannot enumerate the outcomes, let alone price them. Most strategic decisions that matter — entering a market, restructuring a team, betting on a technology — are the second kind. Applying risk tools to them produces false precision and, worse, false confidence.

Arjuna's error is not that he hesitates. It is that he demands certainty as a precondition for action, and certainty is not on offer.

## The protocol

**1. Name the dharma constraint first.** Before optimising, establish what you will not do regardless of payoff. Krishna anchors Arjuna in duty before discussing outcomes. A decision made inside a clear ethical boundary needs far less information than one made in an open field.

**2. Separate the reversible from the irreversible.** Reversible decisions should be made fast and cheaply; irreversible ones deserve the deliberation Arjuna is attempting. Most organisations invert this.

**3. Choose for robustness, not optimality.** Under deep uncertainty, ask "which option is least ruinous across the widest range of futures?" rather than "which option maximises expected value?" The second question requires probabilities you do not have.

**4. Buy information only where it changes the choice.** If a study cannot flip your decision, it is procrastination with a budget line.

**5. Set the trigger before you act.** Define in advance the observable signal that would tell you the bet is wrong, and the date you will look at it. This converts a permanent commitment into a monitored one.

**6. Then act, and let go of the fruit.** Once the protocol is satisfied, further deliberation adds anxiety, not accuracy.

## Why the sixth step is the hard one

Steps one through five are analysis; step six is temperament. The equanimity the Gita keeps returning to — *samatvam yoga uchyate*, evenness of mind is called yoga (2.48) — is not a spiritual ornament. It is the operating condition under which the analysis survives contact with a bad early result.

**This week:** take one stalled decision, write its reversal cost and its wrongness trigger on a single line each, and then decide.`,
  },
  {
    id: "blog-emotional-control",
    slug: "emotional-control",
    date: "31-Jan-2026",
    title: "Emotional Control Is a Strategic Asset",
    category: "Leadership",
    subCategory: "Equanimity",
    topic: "Sthitaprajna",
    trend: "Executive Composure",
    summary:
      "Equanimity as risk-neutrality: how leaders who regulate affect end up with better-calibrated forecasts.",
    imageUrl: "",
    urn: "",
    content: `The Gita's portrait of the *sthitaprajna* — the person of steady wisdom (2.54–2.72) — reads today like a specification for a well-calibrated forecaster: unmoved by good news, unbroken by bad, senses withdrawn from the noise "as a tortoise draws in its limbs."

That is not a personality description. It is a description of low-variance judgement, and it has measurable commercial value.

## Affect is a forecasting bias

Emotional state systematically shifts estimates. Elevated mood inflates probability of success and shortens perceived timelines; fear does the reverse and narrows the option set to the two most visible choices. A leadership team that runs its quarterly planning the week after a large win and its risk review the week after a large loss will produce two incompatible pictures of the same business.

Equanimity is the control variable that makes the two pictures comparable.

## Four practices that build it

**Separate the signal from the sensation.** Name the emotion explicitly in the meeting — "I notice I want to say yes because the demo went well." Naming reliably reduces its influence on the subsequent estimate.

**Fix the review cadence in advance.** Decisions reviewed on a calendar rather than on a feeling are insulated from mood. Set the date when you make the bet.

**Pre-commit the response to both tails.** Write what you will do if the result is far better than expected and far worse. Both are emotional events; neither should be improvised.

**Protect the input environment.** The tortoise verse is about attention, not asceticism. Leaders who consume real-time dashboards all day are sampling noise and reacting to it. Batch the inputs.

## The compounding effect

Composure is contagious downward. A team that has never seen its leader panic reports bad news earlier, and early bad news is the single cheapest asset in management. The equanimity you practise privately shows up in your organisation as information velocity.

**This week:** before your next forecast conversation, write one sentence naming your current emotional state and how it is likely biasing your number. Read it out.`,
  },
];
