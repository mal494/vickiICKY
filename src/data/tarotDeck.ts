import { EsotericElementData, getEsotericDataByCardName, ESOTERIC_CARD_DATA } from './esotericCardData.ts';

export type ArcanaType = 'major' | 'minor';
export type SuitType = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
export type ElementType = 'Fire' | 'Water' | 'Air' | 'Earth' | 'Spirit';

export interface TarotCard {
  id: string;
  name: string;
  number: number;
  romanNumeral?: string;
  arcana: ArcanaType;
  suit: SuitType;
  element: ElementType;
  astrology: string;
  uprightKeywords: string[];
  reversedKeywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  symbolism: string[];
  quote: string;
  accentColor: string;
  iconSymbol: string;
  card_specific_keyword?: string;
  numerology_meaning?: string;
  element_data?: EsotericElementData;
}

export interface SpreadPosition {
  id: string;
  title: string;
  description: string;
}

export interface SpreadDefinition {
  id: string;
  name: string;
  cardCount: number;
  description: string;
  positions: SpreadPosition[];
}

export const TAROT_SPREADS: Record<string, SpreadDefinition> = {
  daily: {
    id: 'daily',
    name: 'Daily Card of Guidance',
    cardCount: 1,
    description: 'A single sacred card offering focused wisdom, daily energy, and conscious awareness.',
    positions: [
      { id: 'focus', title: 'Daily Energy & Guidance', description: 'The prevailing vibration and lesson for today.' }
    ]
  },
  three_card: {
    id: 'three_card',
    name: 'Past, Present, and Future',
    cardCount: 3,
    description: 'Classic three-card spread tracing chronological and energetic evolution across time.',
    positions: [
      { id: 'past', title: 'Past Influences', description: 'Underlying foundation, past causes, and what has led here.' },
      { id: 'present', title: 'Present Reality', description: 'Current crossroads, conscious energy, and immediate dynamics.' },
      { id: 'future', title: 'Emerging Horizon', description: 'Likely trajectory, outcome, and spiritual culmination.' }
    ]
  },
  mind_body_spirit: {
    id: 'mind_body_spirit',
    name: 'Mind, Body, and Spirit',
    cardCount: 3,
    description: 'Holistic triune assessment of mental focus, physical embodiment, and spiritual calling.',
    positions: [
      { id: 'mind', title: 'Mind (Mental & Clarity)', description: 'Thought patterns, beliefs, decisions, and intellectual focus.' },
      { id: 'body', title: 'Body (Physical & Grounding)', description: 'Physical energy, environment, practical action, and health.' },
      { id: 'spirit', title: 'Spirit (Higher Self & Purpose)', description: 'Soul lessons, intuitive whispers, and cosmic alignment.' }
    ]
  },
  cross_of_guidance: {
    id: 'cross_of_guidance',
    name: 'Five-Card Cross of Guidance',
    cardCount: 5,
    description: 'In-depth navigational spread analyzing core situation, obstacles, subconscious, conscious crown, and outcome.',
    positions: [
      { id: 'core', title: 'The Core Essence', description: 'Heart of the matter and central energetic truth.' },
      { id: 'obstacle', title: 'The Crossing Obstacle', description: 'Tension, challenge, or resistance to be integrated.' },
      { id: 'root', title: 'Subconscious Root', description: 'Hidden motivations, deep psychological origins, and soul history.' },
      { id: 'crown', title: 'Conscious Ideal', description: 'Best potential realization, higher guidance, and aspiration.' },
      { id: 'resolution', title: 'Spiritual Resolution', description: 'Final synthesis, path forward, and awakened transformation.' }
    ]
  }
};

export const TAROT_DECK: TarotCard[] = [
  // MAJOR ARCANA (0 - 21)
  {
    id: 'the_fool',
    name: 'The Fool',
    number: 0,
    romanNumeral: '0',
    arcana: 'major',
    suit: 'major',
    element: 'Air',
    astrology: 'Uranus',
    uprightKeywords: ['Innocence', 'New Beginnings', 'Leap of Faith', 'Spontaneity', 'Pure Potential'],
    reversedKeywords: ['Recklessness', 'Hesitation', 'Naivety', 'Holding Back', 'Risk-Aversion'],
    uprightMeaning: 'Step onto a new journey with open-hearted trust. The universe invites you into childlike wonder and unbounded freedom.',
    reversedMeaning: 'Beware reckless impulses or freezing in fear before a necessary leap. Reclaim your trust without abandoning wisdom.',
    symbolism: ['White dog companion representing loyalty and instinct', 'White rose of untarnished purity', 'Sun behind representing divine light', 'Precipice edge of the physical plane'],
    quote: 'The journey of a thousand leagues begins beneath the joyful footstep of trust.',
    accentColor: '#F59E0B',
    iconSymbol: '☀️'
  },
  {
    id: 'the_magician',
    name: 'The Magician',
    number: 1,
    romanNumeral: 'I',
    arcana: 'major',
    suit: 'major',
    element: 'Air',
    astrology: 'Mercury',
    uprightKeywords: ['Manifestation', 'Resourcefulness', 'Willpower', 'Divine Conduit', 'Mastery'],
    reversedKeywords: ['Illusion', 'Blocked Energy', 'Deception', 'Untapped Talents', 'Manipulation'],
    uprightMeaning: 'As above, so below. You possess all four elemental tools—wand, cup, sword, and coin—to manifest spirit into tangible reality.',
    reversedMeaning: 'Doubt in your creative capacity or misusing influence. Realign your intentions with higher spiritual integrity.',
    symbolism: ['Infinity symbol (lemniscate) above head', 'Table with wand, cup, sword, pentacle', 'Right hand channeling heaven, left pointing to earth', 'Ouroboros serpent belt of eternity'],
    quote: 'What is within you transforms what is before you.',
    accentColor: '#EF4444',
    iconSymbol: '⚡'
  },
  {
    id: 'the_high_priestess',
    name: 'The High Priestess',
    number: 2,
    romanNumeral: 'II',
    arcana: 'major',
    suit: 'major',
    element: 'Water',
    astrology: 'Moon',
    uprightKeywords: ['Intuition', 'Sacred Mystery', 'Subconscious', 'Divine Feminine', 'Inner Wisdom'],
    reversedKeywords: ['Secrets', 'Ignored Intuition', 'Superficiality', 'Emotional Withdrawal', 'Repression'],
    uprightMeaning: 'Be still and listen to the silent whisper within. Behind the veil of conscious thought lies the deep reservoir of ancient knowledge.',
    reversedMeaning: 'You may be brushing aside your inner knowing or allowing outer noise to drown out your intuitive compass.',
    symbolism: ['Pillars of Boaz and Jachin (dark and light duality)', 'Veil of pomegranates and palms concealing the inner sanctum', 'Crescent moon at feet and horned lunar crown', 'TORA scroll held in lap'],
    quote: 'Silence is the sanctuary where truth reveals her face.',
    accentColor: '#6366F1',
    iconSymbol: '🌙'
  },
  {
    id: 'the_empress',
    name: 'The Empress',
    number: 3,
    romanNumeral: 'III',
    arcana: 'major',
    suit: 'major',
    element: 'Earth',
    astrology: 'Venus',
    uprightKeywords: ['Abundance', 'Fertility', 'Nurturance', 'Sensory Grace', 'Creative Bloom'],
    reversedKeywords: ['Creative Block', 'Smothering', 'Neglect', 'Dependence', 'Scarcity Mindset'],
    uprightMeaning: 'Nature is overflowing with vitality and grace. Embody beauty, nurture your creations, and receive the lush bounty of the earth.',
    reversedMeaning: 'Depleted vitality or self-neglect. Return to your body, replenish your senses, and soften harsh self-judgment.',
    symbolism: ['Crown of twelve twelve-pointed stars', 'Field of ripe golden wheat at her hem', 'Heart shield bearing the symbol of Venus', 'Cushioned couch beside a flowing stream in a forest'],
    quote: 'To love what is fertile in you is to feed the garden of the world.',
    accentColor: '#10B981',
    iconSymbol: '🌸'
  },
  {
    id: 'the_emperor',
    name: 'The Emperor',
    number: 4,
    romanNumeral: 'IV',
    arcana: 'major',
    suit: 'major',
    element: 'Fire',
    astrology: 'Aries',
    uprightKeywords: ['Authority', 'Structure', 'Protection', 'Firm Foundation', 'Leadership'],
    reversedKeywords: ['Tyranny', 'Rigidity', 'Loss of Control', 'Chaos', 'Micromanagement'],
    uprightMeaning: 'Establish sacred order, discipline, and sovereignty. Stand tall in your authority and build lasting architecture for your dreams.',
    reversedMeaning: 'Excessive rigidity, domination, or feeling powerless against external bureaucracy. Lead with wisdom rather than force.',
    symbolism: ['Stone throne adorned with four ram heads', 'Scepter of ankh and golden globe', 'Red mantle over armor of readiness', 'Stark mountainous backdrop of steadfast strength'],
    quote: 'True sovereignty is the mastery of self in service of the sanctuary.',
    accentColor: '#B91C1C',
    iconSymbol: '👑'
  },
  {
    id: 'the_hierophant',
    name: 'The Hierophant',
    number: 5,
    romanNumeral: 'V',
    arcana: 'major',
    suit: 'major',
    element: 'Earth',
    astrology: 'Taurus',
    uprightKeywords: ['Spiritual Wisdom', 'Tradition', 'Mentorship', 'Sacred Lineage', 'Conformity'],
    reversedKeywords: ['Rebellion', 'Dogma', 'New Spiritual Path', 'Challenging Orthodoxy', 'Rigid Beliefs'],
    uprightMeaning: 'Seek the counsel of proven lineages, seasoned teachers, and eternal spiritual principles. Bridge the mystical with sacred community.',
    reversedMeaning: 'Break free from outmoded dogmas or spiritual bypassing. Trust your own direct revelation and personal truth.',
    symbolism: ['Triple papal cross in left hand', 'Two crossed keys of heaven and earth at feet', 'Two acolytes kneeling for initiation', 'Two gray columns of spiritual structure'],
    quote: 'The tradition that lives is the one that awakens your own eternal flame.',
    accentColor: '#D97706',
    iconSymbol: '🗝️'
  },
  {
    id: 'the_lovers',
    name: 'The Lovers',
    number: 6,
    romanNumeral: 'VI',
    arcana: 'major',
    suit: 'major',
    element: 'Air',
    astrology: 'Gemini',
    uprightKeywords: ['Sacred Union', 'Harmony', 'Choice of the Heart', 'Values Alignment', 'Devotion'],
    reversedKeywords: ['Disharmony', 'Misaligned Values', 'Internal Conflict', 'Codependency', 'Fracture'],
    uprightMeaning: 'A communion of souls and profound choice of values. Align your desires with your highest integrity and open your heart fully.',
    reversedMeaning: 'Inner conflict or strained intimacy. Clarify where you have compromised your truth to maintain an illusion of harmony.',
    symbolism: ['Archangel Raphael blessing the union from violet cloud', 'Tree of Life with twelve fruits behind the man', 'Tree of Knowledge with serpent behind the woman', 'Mountaintop of spiritual ascension'],
    quote: 'Love is not a compromise of self, but the sacred meeting of whole spirits.',
    accentColor: '#EC4899',
    iconSymbol: '🕊️'
  },
  {
    id: 'the_chariot',
    name: 'The Chariot',
    number: 7,
    romanNumeral: 'VII',
    arcana: 'major',
    suit: 'major',
    element: 'Water',
    astrology: 'Cancer',
    uprightKeywords: ['Determination', 'Triumph', 'Focus', 'Harnessing Dualities', 'Steadfast Momentum'],
    reversedKeywords: ['Loss of Direction', 'Aggression', 'Burnout', 'Obstacles', 'Impotence'],
    uprightMeaning: 'Steer opposing forces with concentrated will and calm composure. Victory is achieved when your mind and heart move as one.',
    reversedMeaning: 'Scattered energies, forceful burnout, or feeling dragged by circumstances. Put down the reins and recalibrate your center.',
    symbolism: ['Black and white sphinxes resting in complementary opposition', 'Canopy of celestial stars representing cosmic protection', 'Cubic stone chariot grounded on physical plane', 'Scepter in hand without physical reins'],
    quote: 'The victor does not wrestle the storm; they hold the quiet center of the axis.',
    accentColor: '#0284C7',
    iconSymbol: '🛡️'
  },
  {
    id: 'strength',
    name: 'Strength',
    number: 8,
    romanNumeral: 'VIII',
    arcana: 'major',
    suit: 'major',
    element: 'Fire',
    astrology: 'Leo',
    uprightKeywords: ['Compassion', 'Courage', 'Patience', 'Gentle Power', 'Taming the Beast'],
    reversedKeywords: ['Self-Doubt', 'Raw Emotion', 'Weakness', 'Impatience', 'Inner Turmoil'],
    uprightMeaning: 'True fortitude is quiet, patient, and tender. Tame fierce passions and fears not through brute suppression, but loving understanding.',
    reversedMeaning: 'Wavering self-belief or reacting with defensive aggression. Breathe softly into your vulnerability; that is where your power lives.',
    symbolism: ['Maiden gently stroking the jaw of a red lion', 'Lemniscate infinity emblem floating above her head', 'Garland of fresh flowers binding them together', 'Golden sunny serene landscape'],
    quote: 'Gentleness can shatter stone where a hammer only breaks itself.',
    accentColor: '#EA580C',
    iconSymbol: '🦁'
  },
  {
    id: 'the_hermit',
    name: 'The Hermit',
    number: 9,
    romanNumeral: 'IX',
    arcana: 'major',
    suit: 'major',
    element: 'Earth',
    astrology: 'Virgo',
    uprightKeywords: ['Soul-Searching', 'Solitude', 'Inner Light', 'Guidance', 'Contemplation'],
    reversedKeywords: ['Isolation', 'Loneliness', 'Withdrawal', 'Refusal of Wisdom', 'Antisocial Stagnation'],
    uprightMeaning: 'Step back from outer clamor into sacred seclusion. Hold high the lantern of your own truth to illuminate the next step on the path.',
    reversedMeaning: 'Isolating out of fear, or conversely, running from silence because you fear what is inside. Return to gentle stillness.',
    symbolism: ['Golden lantern holding the glowing six-pointed Star of David', 'Staff of the traveler rooted in snow-capped mountain peak', 'Gray hooded cloak of ascetic devotion', 'Single solitary light on the heights'],
    quote: 'In the stillness of the mountain, your own soul becomes the compass.',
    accentColor: '#6B7280',
    iconSymbol: '🏮'
  },
  {
    id: 'wheel_of_fortune',
    name: 'Wheel of Fortune',
    number: 10,
    romanNumeral: 'X',
    arcana: 'major',
    suit: 'major',
    element: 'Fire',
    astrology: 'Jupiter',
    uprightKeywords: ['Karma', 'Cycles of Destiny', 'Turning Point', 'Good Fortune', 'Synchronicity'],
    reversedKeywords: ['Bad Luck', 'Resisting Change', 'Downcycles', 'Unwelcome Shifts', 'Break the Cycle'],
    uprightMeaning: 'The wheel turns ever onward. Celebrate favorable tides with humility, and remember that every ending carries the seed of renewal.',
    reversedMeaning: 'Feeling caught in an unlucky spin or clinging to what has passed. Step to the motionless hub at the center of the wheel.',
    symbolism: ['Sphinx of wisdom resting at top of wheel', 'Anubis ascending and Typhon serpent descending', 'Four winged living creatures studying scrolls at corners', 'Letters TARO / ROTA intertwined with alchemical symbols'],
    quote: 'Nothing is permanent except the eternal law of cyclical return.',
    accentColor: '#8B5CF6',
    iconSymbol: '☸️'
  },
  {
    id: 'justice',
    name: 'Justice',
    number: 11,
    romanNumeral: 'XI',
    arcana: 'major',
    suit: 'major',
    element: 'Air',
    astrology: 'Libra',
    uprightKeywords: ['Truth', 'Fairness', 'Cause & Effect', 'Clarity', 'Karmic Balance'],
    reversedKeywords: ['Unfairness', 'Dishonesty', 'Accountability Dodge', 'Prejudice', 'Legal Entanglement'],
    uprightMeaning: 'See things as they truly are, without self-deception or illusion. Weigh your deeds on the scales of cosmic balance and speak truth.',
    reversedMeaning: 'Unwillingness to accept responsibility or feeling treated unfairly. Examine where you have compromised your own fairness.',
    symbolism: ['Upright two-edged sword of discernment in right hand', 'Balanced golden scales of equilibrium in left hand', 'Purple veil hanging between gray pillars of law', 'Square jewel clasp at neckline'],
    quote: 'Truth has no bias; it only weighs what is placed upon its scale.',
    accentColor: '#14B8A6',
    iconSymbol: '⚖️'
  },
  {
    id: 'the_hanged_man',
    name: 'The Hanged Man',
    number: 12,
    romanNumeral: 'XII',
    arcana: 'major',
    suit: 'major',
    element: 'Water',
    astrology: 'Neptune',
    uprightKeywords: ['Surrender', 'New Perspective', 'Suspension', 'Sacred Pause', 'Letting Go'],
    reversedKeywords: ['Stalling', 'Needless Martyrdom', 'Resistance', 'Futile Struggle', 'Narrow View'],
    uprightMeaning: 'Pause and surrender conscious control. In deliberate stillness and inversion, the world flips and enlightenment dawns.',
    reversedMeaning: 'Struggling against the current or playing the martyr for no spiritual benefit. Release the rope and ground your feet.',
    symbolism: ['Living T-cross or Yggdrasil wood with green leaves', 'Radiant golden nimbus of halo around his calm head', 'Legs forming a reversed number 4 of spiritual alchemy', 'Expression of peaceful transcendence'],
    quote: 'When you stop pushing the river, you discover it has always carried you.',
    accentColor: '#3B82F6',
    iconSymbol: '🕯️'
  },
  {
    id: 'death',
    name: 'Death',
    number: 13,
    romanNumeral: 'XIII',
    arcana: 'major',
    suit: 'major',
    element: 'Water',
    astrology: 'Scorpio',
    uprightKeywords: ['Transformation', 'Rebirth', 'Closure', 'Deep Transition', 'Clearing the Slate'],
    reversedKeywords: ['Fear of Change', 'Stagnation', 'Holding on to Decay', 'Resisting Rebirth', 'Ghostly Attachment'],
    uprightMeaning: 'The old form must dissolve so the new spirit can breathe. Grieve the shedding, yet rejoice in the golden sunrise on the horizon.',
    reversedMeaning: 'Clinging desperately to an expired season, relationship, or identity. Surrender what is already gone to make room for life.',
    symbolism: ['Black banner bearing the mystic white rose of immortality', 'Skeletal knight on white horse of unstoppable time', 'King fallen while maiden and child kneel in acceptance', 'Golden sun rising between two pillars in the background'],
    quote: 'What the caterpillar calls the end of the world, the master calls a butterfly.',
    accentColor: '#475569',
    iconSymbol: '🌅'
  },
  {
    id: 'temperance',
    name: 'Temperance',
    number: 14,
    romanNumeral: 'XIV',
    arcana: 'major',
    suit: 'major',
    element: 'Fire',
    astrology: 'Sagittarius',
    uprightKeywords: ['Alchemy', 'Harmony', 'Moderation', 'Patience', 'Divine Balance'],
    reversedKeywords: ['Imbalance', 'Excess', 'Clashing Elements', 'Impatience', 'Discord'],
    uprightMeaning: 'Blend opposing currents into golden harmony. Pour water and fire back and forth with measured patience until the elixir is born.',
    reversedMeaning: 'Extremism, overindulgence, or erratic swings. Take a step back and restore balance to your daily habits and spirit.',
    symbolism: ['Winged angel with one foot in water and one on land', 'Water flowing continuously between two golden vessels against gravity', 'Path leading to glowing golden crown in distant mountains', 'Solar emblem on brow and square with triangle on chest'],
    quote: 'The middle way is not lukewarm; it is the burning flame of perfect equilibrium.',
    accentColor: '#059669',
    iconSymbol: '🏺'
  },
  {
    id: 'the_devil',
    name: 'The Devil',
    number: 15,
    romanNumeral: 'XV',
    arcana: 'major',
    suit: 'major',
    element: 'Earth',
    astrology: 'Capricorn',
    uprightKeywords: ['Shadow Self', 'Bondage', 'Addiction', 'Materialism', 'Unmasking Illusions'],
    reversedKeywords: ['Liberation', 'Breaking Chains', 'Awakening', 'Reclaiming Power', 'Shadow Integration'],
    uprightMeaning: 'Look directly at what binds you. The chains around your neck are loose—you can lift them off the moment you choose awareness over illusion.',
    reversedMeaning: 'The veil drops; you are breaking free from toxic dependencies, self-destructive scripts, or obsessive loops.',
    symbolism: ['Horned Baphomet sat upon a black pedestal', 'Chained man and woman with loose slip-knots around necks', 'Inverted pentagram burning on brow', 'Downward torch setting fire to the material plane'],
    quote: 'The prison door was never locked; you merely forgot you were holding the key.',
    accentColor: '#7F1D1D',
    iconSymbol: '⛓️'
  },
  {
    id: 'the_tower',
    name: 'The Tower',
    number: 16,
    romanNumeral: 'XVI',
    arcana: 'major',
    suit: 'major',
    element: 'Fire',
    astrology: 'Mars',
    uprightKeywords: ['Sudden Awakening', 'Revelation', 'Breakdown of Falsehood', 'Liberating Shock', 'Transformation'],
    reversedKeywords: ['Disaster Averted', 'Prolonging the Inevitable', 'Fear of Collapse', 'Internal Rupture', 'Lingering Rubble'],
    uprightMeaning: 'Lightning strikes the ivory fortress built on pride and illusions. It shakes you violently, but frees you from a gilded prison.',
    reversedMeaning: 'Dodging a catastrophe or delaying an inevitable breakdown. Allow what is false to crumble so the eternal can shine.',
    symbolism: ['Lightning bolt tearing off golden crown at summit', 'Flames leaping from three tower windows', 'Two figures falling headfirst into the abyss', 'Twenty-two drops of fire falling like divine yods'],
    quote: 'When the wall falls, the horizon is restored.',
    accentColor: '#DC2626',
    iconSymbol: '⚡'
  },
  {
    id: 'the_star',
    name: 'The Star',
    number: 17,
    romanNumeral: 'XVII',
    arcana: 'major',
    suit: 'major',
    element: 'Air',
    astrology: 'Aquarius',
    uprightKeywords: ['Hope', 'Inspiration', 'Serenity', 'Spiritual Rejuvenation', 'Divine Faith'],
    reversedKeywords: ['Hopelessness', 'Despair', 'Discouragement', 'Pessimism', 'Dimmed Radiance'],
    uprightMeaning: 'After the storm, the crystal skies open. You are divinely protected, inspired, and bathed in cosmic grace. Drink from the waters of peace.',
    reversedMeaning: 'Feeling depleted of hope or doubting your future. Turn your gaze upward; the celestial guidance has never ceased to shine.',
    symbolism: ['Eight-pointed large central golden star surrounded by seven smaller stars', 'Nude maiden pouring water onto both earth and pool', 'Sacred Ibis bird of Thoth perched in flowering tree', 'Five streams of water nourishing the green land'],
    quote: 'Hope is not a fragile wish; it is the quiet certainty of dawn.',
    accentColor: '#38BDF8',
    iconSymbol: '⭐'
  },
  {
    id: 'the_moon',
    name: 'The Moon',
    number: 18,
    romanNumeral: 'XVIII',
    arcana: 'major',
    suit: 'major',
    element: 'Water',
    astrology: 'Pisces',
    uprightKeywords: ['Illusion', 'Subconscious Shadows', 'Intuition', 'Vivid Dreams', 'Navigating the Fog'],
    reversedKeywords: ['Dispelling Fear', 'Clarity Returning', 'Unveiling Deception', 'Inner Peace', 'Grounding'],
    uprightMeaning: 'You walk through the misty realm of dreams, memories, and instinct. Do not let wild anxieties trick you; trust your psychic senses.',
    reversedMeaning: 'The fog is lifting. Lies are exposed, nightmares dissipate, and emotional clarity returns to your path.',
    symbolism: ['Crayfish crawling from dark depths of the pool', 'Dog and wolf baying at the full moon in unison', 'Two foreboding stone towers on the horizon', 'Winding path leading into the unknown mystery'],
    quote: 'In the moonlit woods, shadows are only light cast by memories.',
    accentColor: '#818CF8',
    iconSymbol: '🌕'
  },
  {
    id: 'the_sun',
    name: 'The Sun',
    number: 19,
    romanNumeral: 'XIX',
    arcana: 'major',
    suit: 'major',
    element: 'Fire',
    astrology: 'Sun',
    uprightKeywords: ['Joy', 'Radiance', 'Success', 'Vitality', 'Celebration', 'Warmth'],
    reversedKeywords: ['Temporary Cloud', 'Overly Optimistic', 'Dimmed Joy', 'Sadness Clearing', 'Ego Burn'],
    uprightMeaning: 'Pure illumination and triumphant joy! Your heart is open, vitality surges through your veins, and life smiles back with abundance.',
    reversedMeaning: 'The joy is present, but partially obscured by a passing cloud of fatigue or self-doubt. Step into the warm sunlight.',
    symbolism: ['Naked radiant child riding a gentle white horse', 'Four blooming sunflowers standing over stone wall', 'Vibrant red banner of triumph fluttering in breeze', 'Giant beaming sun with alternating straight and wavy rays'],
    quote: 'You do not seek the light; you are the radiant heart of it.',
    accentColor: '#FBBF24',
    iconSymbol: '🌞'
  },
  {
    id: 'judgement',
    name: 'Judgement',
    number: 20,
    romanNumeral: 'XX',
    arcana: 'major',
    suit: 'major',
    element: 'Fire',
    astrology: 'Pluto',
    uprightKeywords: ['Spiritual Rebirth', 'Inner Calling', 'Absolution', 'Awakening', 'Forgiveness'],
    reversedKeywords: ['Self-Doubt', 'Ignoring the Call', 'Harsh Self-Criticism', 'Regret', 'Stalling Decision'],
    uprightMeaning: 'Hear the divine trumpet call. Rise from the grave of your past mistakes, forgive yourself and others, and step into your higher vocation.',
    reversedMeaning: 'Second-guessing your calling or paralyzing yourself with regret. Forgive who you were so you can embody who you are.',
    symbolism: ['Archangel Gabriel blowing golden horn with banner of St. George', 'Figures rising joyfully from gray stone tombs with arms outstretched', 'Glacial snowy blue peaks representing higher consciousness', 'Vast ocean representing collective subconscious'],
    quote: 'The trumpet does not judge your sorrow; it calls your soul awake.',
    accentColor: '#A855F7',
    iconSymbol: '📯'
  },
  {
    id: 'the_world',
    name: 'The World',
    number: 21,
    romanNumeral: 'XXI',
    arcana: 'major',
    suit: 'major',
    element: 'Earth',
    astrology: 'Saturn',
    uprightKeywords: ['Wholeness', 'Completion', 'Cosmic Harmony', 'Triumph', 'Integration'],
    reversedKeywords: ['Unfinished Business', 'Lack of Closure', 'Delayed Culmination', 'Seeking Outside Validation'],
    uprightMeaning: 'A grand cycle concludes in majestic fulfillment. You stand whole, integrated, and celebrated by the cosmos. Dance in your wholeness.',
    reversedMeaning: 'Near the finish line, yet dragging feet on the final step. Tie up loose ends and grant yourself the closure you deserve.',
    symbolism: ['Dancing maiden draped in purple sash holding two wands of mastery', 'Green laurel wreath tied with red infinity ribbons', 'Four cherubim figures (man, eagle, lion, bull) at corners', 'Cosmic mandorla of total spiritual completion'],
    quote: 'The journey ends where it began, but you now know the place for the first time.',
    accentColor: '#10B981',
    iconSymbol: '🌍'
  },

  // MINOR ARCANA HIGHLIGHTS & SUITS (WANDS / FIRE)
  {
    id: 'ace_of_wands',
    name: 'Ace of Wands',
    number: 1,
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    astrology: 'Fire Signs',
    uprightKeywords: ['Inspiration', 'Spark', 'Passion', 'Creative Fire', 'Bold Initiative'],
    reversedKeywords: ['Creative Delay', 'Lack of Passion', 'Flickering Energy', 'False Starts'],
    uprightMeaning: 'A primordial spark of creative genius arrives. Seize the fiery wand and begin your passionate endeavor.',
    reversedMeaning: 'A sluggish flame or hesitation to act. Rekindle your inner why before forcing outward motion.',
    symbolism: ['Hand emerging from white cloud holding blooming sprout wand', 'Leaves floating in air like sparks of inspiration', 'Castle on hilltop representing the fortress to build'],
    quote: 'Every wildfire begins with a single sacred ember.',
    accentColor: '#F97316',
    iconSymbol: '🔥'
  },
  {
    id: 'three_of_wands',
    name: 'Three of Wands',
    number: 3,
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    astrology: 'Sun in Aries',
    uprightKeywords: ['Expansion', 'Foresight', 'Ships Coming In', 'Long-Range Vision', 'Confidence'],
    reversedKeywords: ['Delays', 'Disappointment', 'Obstacles in Travel', 'Playing Small'],
    uprightMeaning: 'You have laid your foundation; now look across the open ocean as your ships return laden with harvest. Expand your borders.',
    reversedMeaning: 'Patience tested while waiting for results. Do not pull back in anxiety; stay committed to your horizon.',
    symbolism: ['Figure overlooking golden sea with three firmly planted wands', 'Sailing ships navigating the ocean waters', 'Red and green robes of vitality and growth'],
    quote: 'Look far beyond the shore; your harvest is already riding the wind.',
    accentColor: '#EA580C',
    iconSymbol: '🚢'
  },
  {
    id: 'eight_of_wands',
    name: 'Eight of Wands',
    number: 8,
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    astrology: 'Mercury in Sagittarius',
    uprightKeywords: ['Rapid Motion', 'Swift News', 'Alignment', 'Momentum', 'Airborne Speed'],
    reversedKeywords: ['Delays', 'Miscommunication', 'Hasty Panic', 'Scattered Arrows'],
    uprightMeaning: 'Obstacles clear in a flash! Swift news, rapid developments, and unimpeded momentum carry you forward.',
    reversedMeaning: 'Misunderstood messages or rushing without aim. Ground your breathing before firing your arrows.',
    symbolism: ['Eight flowering wooden staves flying through clear open blue sky', 'Green landscape with flowing river beneath the flight path'],
    quote: 'When the path is clear, speed is effortless grace.',
    accentColor: '#D97706',
    iconSymbol: '🏹'
  },
  {
    id: 'queen_of_wands',
    name: 'Queen of Wands',
    number: 13,
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    astrology: 'Water of Fire',
    uprightKeywords: ['Radiant Charisma', 'Fierce Independence', 'Warmth', 'Confidence', 'Creativity'],
    reversedKeywords: ['Jealousy', 'Insecurity', 'Demanding', 'Burnout', 'Withdrawn Radiance'],
    uprightMeaning: 'Stand boldly in your electric magnetism, warmth, and vitality. Inspire the room with your vibrant, unshakeable confidence.',
    reversedMeaning: 'Fatigue extinguishing your spark or projecting insecurity onto rivals. Reclaim your joyful sovereignty.',
    symbolism: ['Black cat sitting before throne of lions and sunflowers', 'Holding a blooming sunflower in left hand and tall wand in right', 'Vibrant golden yellow robes'],
    quote: 'Warmth without apology is the greatest enchantment.',
    accentColor: '#F59E0B',
    iconSymbol: '🌻'
  },

  // CUPS / WATER
  {
    id: 'ace_of_cups',
    name: 'Ace of Cups',
    number: 1,
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    astrology: 'Water Signs',
    uprightKeywords: ['Overflowing Love', 'Intuition', 'Compassion', 'Spiritual Grace', 'New Connection'],
    reversedKeywords: ['Emotional Drain', 'Blocked Feelings', 'Self-Love Deficit', 'Heartache'],
    uprightMeaning: 'Your heart cup overflows with divine love, creative empathy, and pure spiritual grace. Receive and give freely.',
    reversedMeaning: 'Pouring from an empty vessel. Turn the cup inward and offer tender compassion to your own weary heart.',
    symbolism: ['Hand holding a golden chalice with five overflowing streams of water', 'White dove of the Holy Spirit holding a wafer diving into cup', 'Lotus blossoms floating on sacred water below'],
    quote: 'Love does not measure its offering; it is the boundless sea.',
    accentColor: '#3B82F6',
    iconSymbol: '🌊'
  },
  {
    id: 'two_of_cups',
    name: 'Two of Cups',
    number: 2,
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    astrology: 'Venus in Cancer',
    uprightKeywords: ['Soulmate Connection', 'Mutual Respect', 'Partnership', 'Harmony', 'Affection'],
    reversedKeywords: ['Misunderstanding', 'Imbalance', 'Broken Trust', 'Disconnection'],
    uprightMeaning: 'Two hearts meet in sacred mutual honor, tender affection, and reciprocal understanding. A blessed partnership blooms.',
    reversedMeaning: 'Emotional friction or misaligned expectations. Speak honestly with vulnerability to heal the breach.',
    symbolism: ['Youth and maiden exchanging golden cups in mutual pledge', 'Caduceus of Hermes crowned by a winged red lion hovering above', 'Green rolling hills behind'],
    quote: 'When two souls see each other truly, holy ground is made.',
    accentColor: '#0284C7',
    iconSymbol: '🥂'
  },
  {
    id: 'three_of_cups',
    name: 'Three of Cups',
    number: 3,
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    astrology: 'Mercury in Cancer',
    uprightKeywords: ['Sisterhood', 'Celebration', 'Community', 'Joyful Reunion', 'Shared Triumph'],
    reversedKeywords: ['Gossip', 'Exclusion', 'Overindulgence', 'Social Strain'],
    uprightMeaning: 'Celebrate with your soul tribe! Dance, toast your shared milestones, and cherish the profound medicine of communal joy.',
    reversedMeaning: 'Feeling left out or drained by superficial drama. Reconnect with those who truly honor your essence.',
    symbolism: ['Three maidens dancing in a circle with raised golden goblets', 'Abundant harvest of grapes, flowers, and gourds at their feet'],
    quote: 'Joy multiplied across loving companions is the nectar of life.',
    accentColor: '#06B6D4',
    iconSymbol: '💃'
  },
  {
    id: 'queen_of_cups',
    name: 'Queen of Cups',
    number: 13,
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    astrology: 'Water of Water',
    uprightKeywords: ['Deep Empathy', 'Psychic Gifts', 'Compassionate Healer', 'Emotional Anchor', 'Intuition'],
    reversedKeywords: ['Codependency', 'Emotional Overwhelm', 'Moody Escapism', 'Neglected Boundaries'],
    uprightMeaning: 'You are the calm ocean depth. Trust your profound psychic intuition and radiate healing, non-judgmental presence.',
    reversedMeaning: 'Drowning in others’ emotional turbulence. Set firm psychic boundaries to protect your sacred waters.',
    symbolism: ['Ornate closed chalice with cherub handles', 'Stone throne carved with sea nymphs at the water’s edge', 'Bare feet resting upon smooth colorful pebbles'],
    quote: 'The heart that holds the ocean never fears the storm upon its surface.',
    accentColor: '#2563EB',
    iconSymbol: '🪷'
  },

  // SWORDS / AIR
  {
    id: 'ace_of_swords',
    name: 'Ace of Swords',
    number: 1,
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    astrology: 'Air Signs',
    uprightKeywords: ['Mental Clarity', 'Breakthrough', 'Piercing Truth', 'Sharp Intellect', 'New Idea'],
    reversedKeywords: ['Mental Fog', 'Harsh Words', 'Deception', 'Overthinking', 'Misinformation'],
    uprightMeaning: 'A blade of crystalline truth cuts through confusion, deception, and illusion. See with absolute, uncompromising clarity.',
    reversedMeaning: 'Words spoken with malice or a mind tangled in obsessive spirals. Sheathe the blade and seek quiet truth.',
    symbolism: ['Hand holding an upright double-edged silver sword', 'Golden crown encircled with olive and palm branches at sword tip', 'Chilly mountain peaks beneath white clouds'],
    quote: 'Truth is a razor; it divides illusion from what cannot die.',
    accentColor: '#93C5FD',
    iconSymbol: '🗡️'
  },
  {
    id: 'three_of_swords',
    name: 'Three of Swords',
    number: 3,
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    astrology: 'Saturn in Libra',
    uprightKeywords: ['Heartbreak', 'Grief', 'Emotional Release', 'Painful Truth', 'Healing the Wound'],
    reversedKeywords: ['Releasing Sorrow', 'Forgiveness', 'Healing in Progress', 'Overcoming Grief'],
    uprightMeaning: 'A storm pierces the heart with necessary truth. Honor your tears; they water the soil of your deeper spiritual awakening.',
    reversedMeaning: 'The clouds are breaking. You are finally ready to pull the swords from your heart and step into forgiveness.',
    symbolism: ['Heart pierced by three crossed swords', 'Dark storm clouds pouring heavy gray rain in background'],
    quote: 'The wound is where the light enters the broken heart.',
    accentColor: '#64748B',
    iconSymbol: '💔'
  },
  {
    id: 'six_of_swords',
    name: 'Six of Swords',
    number: 6,
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    astrology: 'Mercury in Aquarius',
    uprightKeywords: ['Transition', 'Calmer Waters', 'Leaving Troubles Behind', 'Healing Journey', 'Mental Relief'],
    reversedKeywords: ['Carrying Baggage', 'Resisting Transition', 'Unresolved Storms', 'Trapped in Past'],
    uprightMeaning: 'You are rowing away from turbulent squalls toward peaceful, tranquil waters. The worst is now behind you.',
    reversedMeaning: 'Trying to escape physical surroundings without shifting your mental patterns. Release the baggage you refuse to leave.',
    symbolism: ['Ferryman rowing a mother and child in a punt boat', 'Six upright swords standing in boat bow', 'Rough water to the right, calm glassy water ahead on the left'],
    quote: 'Sail toward the quiet shore; peace is waiting across the channel.',
    accentColor: '#475569',
    iconSymbol: '🛶'
  },
  {
    id: 'queen_of_swords',
    name: 'Queen of Swords',
    number: 13,
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    astrology: 'Water of Air',
    uprightKeywords: ['Discernment', 'Clear Boundaries', 'Wise Counsel', 'Direct Truth', 'Perceptive Wit'],
    reversedKeywords: ['Cold Cruelty', 'Bitter Resentment', 'Overly Critical', 'Cynicism', 'Isolated Heart'],
    uprightMeaning: 'Look through all pretense with piercing intellect and gentle dignity. Communicate boundary and clarity without cruelty.',
    reversedMeaning: 'A wounded heart weaponizing intellect to keep others away. Let warmth soften your rightful boundaries.',
    symbolism: ['Queen seated on throne carved with dancing butterfly and cherub', 'Right hand holding upright sword, left hand extended inviting honest truth', 'Single bird soaring high in clear sky'],
    quote: 'Honesty spoken with love is the greatest kindness you can bestow.',
    accentColor: '#0284C7',
    iconSymbol: '🦋'
  },

  // PENTACLES / EARTH
  {
    id: 'ace_of_pentacles',
    name: 'Ace of Pentacles',
    number: 1,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    astrology: 'Earth Signs',
    uprightKeywords: ['Tangible Opportunity', 'Abundance', 'New Wealth', 'Health & Vitality', 'Grounded Seed'],
    reversedKeywords: ['Missed Opportunity', 'Financial Anxiety', 'Poor Planning', 'Unstable Seed'],
    uprightMeaning: 'A golden coin is placed directly into your palms. Plant this seed of prosperity and nurture it into physical reality.',
    reversedMeaning: 'Poor timing or neglecting foundational details. Review the practical ledger and build on rock, not sand.',
    symbolism: ['Hand emerging from clouds holding a heavy golden pentacle coin', 'Lush flowering garden with archway of white lilies leading to mountains'],
    quote: 'Plant the gold in fertile soil, and time will do the rest.',
    accentColor: '#10B981',
    iconSymbol: '🪙'
  },
  {
    id: 'three_of_pentacles',
    name: 'Three of Pentacles',
    number: 3,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    astrology: 'Mars in Capricorn',
    uprightKeywords: ['Craftsmanship', 'Collaboration', 'Mastery', 'Building the Temple', 'Appreciation'],
    reversedKeywords: ['Lack of Teamwork', 'Inferior Craft', 'Disorganization', 'Ego Friction'],
    uprightMeaning: 'Your skills are recognized and combined with masters of other disciplines. Together, you construct a lasting sanctuary.',
    reversedMeaning: 'Miscommunication in project teams or shoddy execution. Reground yourselves in shared standards of excellence.',
    symbolism: ['Young stonemason sculpting intricate arch inside stone cathedral', 'Monk and architect holding architectural blueprints consulting with him'],
    quote: 'Mastery is the union of individual devotion and collective vision.',
    accentColor: '#059669',
    iconSymbol: '🏛️'
  },
  {
    id: 'nine_of_pentacles',
    name: 'Nine of Pentacles',
    number: 9,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    astrology: 'Venus in Virgo',
    uprightKeywords: ['Self-Sufficiency', 'Graceful Luxury', 'Abundant Solitude', 'Fruitful Garden', 'Contentment'],
    reversedKeywords: ['Material Dependency', 'Superficial Wealth', 'Overworking', 'Loneliness in Luxury'],
    uprightMeaning: 'Walk peacefully through your lush vineyard. You have earned your independence, sovereignty, and refined sanctuary.',
    reversedMeaning: 'Overworking to maintain a lifestyle, or feeling isolated behind material walls. Reconnect with simple pleasures.',
    symbolism: ['Elegant lady in gold floral robes standing amidst ripe grapevines', 'Hooded falcon resting serenely upon her gloved left hand', 'Nine heavy golden pentacles hanging on the vines'],
    quote: 'True wealth is enjoying your own company in a garden you planted yourself.',
    accentColor: '#047857',
    iconSymbol: '🍇'
  },
  {
    id: 'queen_of_pentacles',
    name: 'Queen of Pentacles',
    number: 13,
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    astrology: 'Water of Earth',
    uprightKeywords: ['Warm Hospitality', 'Practical Magic', 'Nurturing Wealth', 'Earth Mother', 'Rooted Prosperity'],
    reversedKeywords: ['Workaholic', 'Neglected Self-Care', 'Smothering Materialism', 'Financial Stress'],
    uprightMeaning: 'Cradle life with grounded tenderness, practical resourcefulness, and domestic warmth. Feed both body and soul.',
    reversedMeaning: 'Feeling overwhelmed by chores or measuring your value solely by productivity. Rest your body on the soft earth.',
    symbolism: ['Queen holding golden pentacle on lap amidst blossoming briar roses', 'Carved throne with goat heads, cherubs, and fruit', 'Little rabbit leaping into the scene symbolizing fertile life'],
    quote: 'The earth welcomes your feet as a mother welcomes her child.',
    accentColor: '#0F766E',
    iconSymbol: '🐰'
  }
];

// Automatically inject esoteric card data (Hermetic qualities, numerology, energy, and zodiac)
TAROT_DECK.forEach((card) => {
  const eso = getEsotericDataByCardName(card.name);
  if (eso) {
    card.card_specific_keyword = eso.card_specific_keyword;
    card.numerology_meaning = eso.numerology_meaning;
    card.element_data = eso.element_data;
  }
});

// Ensure every esoteric card from user data is represented in TAROT_DECK
ESOTERIC_CARD_DATA.forEach((eso) => {
  const existing = TAROT_DECK.find(
    (c) => c.name.toLowerCase().trim() === eso.name.toLowerCase().trim()
  );
  if (!existing) {
    const isMajor = eso.suit === 'Major Arcana';
    const suitType: SuitType = isMajor ? 'major' : (eso.suit.toLowerCase() as SuitType);
    const element = eso.element_data.element as ElementType;
    const accent =
      element === 'Fire' ? '#EF4444' :
      element === 'Water' ? '#3B82F6' :
      element === 'Air' ? '#F59E0B' : '#10B981';
    const icon =
      element === 'Fire' ? '🔥' :
      element === 'Water' ? '💧' :
      element === 'Air' ? '💨' : '🌿';

    TAROT_DECK.push({
      id: eso.card_id,
      name: eso.name,
      number: typeof eso.rank === 'number' ? eso.rank : 10,
      romanNumeral: isMajor && typeof eso.rank === 'number' ? `${eso.rank}` : undefined,
      arcana: isMajor ? 'major' : 'minor',
      suit: suitType,
      element: element,
      astrology: eso.element_data.zodiac.join(', '),
      uprightKeywords: [eso.card_specific_keyword, eso.element_data.core_representation.split(',')[0] || 'Power'],
      reversedKeywords: ['Shadow energy', 'Blocked potential'],
      uprightMeaning: `${eso.name} reflects ${eso.element_data.core_representation}. In numerology, it embodies ${eso.numerology_meaning}.`,
      reversedMeaning: `In reverse, ${eso.name} calls you to re-examine ${eso.card_specific_keyword.toLowerCase()} and restore ${eso.element_data.qualities.join(' and ')} balance.`,
      symbolism: [
        `Element of ${eso.element_data.element} (${eso.element_data.qualities.join(', ')})`,
        `Planetary/Zodiac Ruler: ${eso.element_data.zodiac.join(', ')}`,
        `Playing card correspondence: ${eso.element_data.playing_card_suit}`,
      ],
      quote: `${eso.name} whispers: embrace ${eso.card_specific_keyword.toLowerCase()}.`,
      accentColor: accent,
      iconSymbol: icon,
      card_specific_keyword: eso.card_specific_keyword,
      numerology_meaning: eso.numerology_meaning,
      element_data: eso.element_data,
    });
  }
});

// Helper to pull random cards for digital draws
export function drawRandomCards(count: number, allowReversed = true): { card: TarotCard; isReversed: boolean }[] {
  const deckCopy = [...TAROT_DECK];
  const results: { card: TarotCard; isReversed: boolean }[] = [];

  for (let i = 0; i < count; i++) {
    if (deckCopy.length === 0) break;
    const randomIndex = Math.floor(Math.random() * deckCopy.length);
    const card = deckCopy.splice(randomIndex, 1)[0];
    const isReversed = allowReversed ? Math.random() < 0.25 : false; // 25% chance of reversal
    results.push({ card, isReversed });
  }

  return results;
}

export function getCardById(id: string): TarotCard | undefined {
  return TAROT_DECK.find(c => c.id === id);
}

export function searchTarotDeck(query: string): TarotCard[] {
  const q = query.toLowerCase().trim();
  if (!q) return TAROT_DECK;
  return TAROT_DECK.filter(card =>
    card.name.toLowerCase().includes(q) ||
    card.element.toLowerCase().includes(q) ||
    card.suit.toLowerCase().includes(q) ||
    card.uprightKeywords.some(k => k.toLowerCase().includes(q)) ||
    card.reversedKeywords.some(k => k.toLowerCase().includes(q))
  );
}
