export interface EsotericElementData {
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | string;
  energy: 'Masculine' | 'Feminine' | string;
  qualities: string[]; // e.g. ["wet", "hot"], ["hot", "dry"], ["dry", "cold"], ["wet", "cold"]
  playing_card_suit: string; // "Clubs", "Spades", "Hearts", "Diamonds", "N/A"
  core_representation: string;
  zodiac: string[];
}

export interface EsotericCardRecord {
  card_id: string;
  name: string;
  suit: 'Major Arcana' | 'Wands' | 'Swords' | 'Cups' | 'Pentacles';
  rank: number | string;
  card_specific_keyword: string;
  numerology_meaning: string;
  element_data: EsotericElementData;
}

export const ESOTERIC_CARD_DATA: EsotericCardRecord[] = [
  {
    card_id: 'major_00',
    name: 'The Fool',
    suit: 'Major Arcana',
    rank: 0,
    card_specific_keyword: 'Leap of faith, innocence',
    numerology_meaning: 'infinite potential and the beginning of a karmic journey',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Uranus']
    }
  },
  {
    card_id: 'major_01',
    name: 'The Magician',
    suit: 'Major Arcana',
    rank: 1,
    card_specific_keyword: 'Manifestation, resourcefulness',
    numerology_meaning: 'conscious action and the power to create your reality',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Mercury']
    }
  },
  {
    card_id: 'major_02',
    name: 'The High Priestess',
    suit: 'Major Arcana',
    rank: 2,
    card_specific_keyword: 'Intuition, the subconscious',
    numerology_meaning: 'deep inner knowing and hidden mysteries',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Moon']
    }
  },
  {
    card_id: 'major_03',
    name: 'The Empress',
    suit: 'Major Arcana',
    rank: 3,
    card_specific_keyword: 'Abundance, nurturing',
    numerology_meaning: 'creation, nature, and unconditional love',
    element_data: {
      element: 'Earth',
      energy: 'Feminine',
      qualities: ['dry', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Venus']
    }
  },
  {
    card_id: 'major_04',
    name: 'The Emperor',
    suit: 'Major Arcana',
    rank: 4,
    card_specific_keyword: 'Authority, structure',
    numerology_meaning: 'stability, boundaries, and logical leadership',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Aries']
    }
  },
  {
    card_id: 'major_05',
    name: 'The Hierophant',
    suit: 'Major Arcana',
    rank: 5,
    card_specific_keyword: 'Tradition, conformity',
    numerology_meaning: 'spiritual wisdom, institutions, and conventional beliefs',
    element_data: {
      element: 'Earth',
      energy: 'Masculine',
      qualities: ['dry', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Taurus']
    }
  },
  {
    card_id: 'major_06',
    name: 'The Lovers',
    suit: 'Major Arcana',
    rank: 6,
    card_specific_keyword: 'Alignment, choices',
    numerology_meaning: 'harmony, values, and defining partnerships',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Gemini']
    }
  },
  {
    card_id: 'major_07',
    name: 'The Chariot',
    suit: 'Major Arcana',
    rank: 7,
    card_specific_keyword: 'Control, willpower',
    numerology_meaning: 'overcoming opposing forces to achieve victory',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Cancer']
    }
  },
  {
    card_id: 'major_08',
    name: 'Strength',
    suit: 'Major Arcana',
    rank: 8,
    card_specific_keyword: 'Compassion, inner courage',
    numerology_meaning: 'quiet endurance and the mastery of primal instincts',
    element_data: {
      element: 'Fire',
      energy: 'Feminine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Leo']
    }
  },
  {
    card_id: 'major_09',
    name: 'The Hermit',
    suit: 'Major Arcana',
    rank: 9,
    card_specific_keyword: 'Soul-searching, introspection',
    numerology_meaning: 'withdrawing from the external world to find inner guidance',
    element_data: {
      element: 'Earth',
      energy: 'Feminine',
      qualities: ['dry', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Virgo']
    }
  },
  {
    card_id: 'major_10',
    name: 'Wheel of Fortune',
    suit: 'Major Arcana',
    rank: 10,
    card_specific_keyword: 'Karma, turning points',
    numerology_meaning: 'the cyclical nature of fate and unexpected shifts',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Jupiter']
    }
  },
  {
    card_id: 'major_11',
    name: 'Justice',
    suit: 'Major Arcana',
    rank: 11,
    card_specific_keyword: 'Fairness, truth',
    numerology_meaning: 'cause and effect, accountability, and karmic balance',
    element_data: {
      element: 'Air',
      energy: 'Feminine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Libra']
    }
  },
  {
    card_id: 'major_12',
    name: 'The Hanged Man',
    suit: 'Major Arcana',
    rank: 12,
    card_specific_keyword: 'Surrender, new perspectives',
    numerology_meaning: 'voluntary pause and letting go to gain enlightenment',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Neptune']
    }
  },
  {
    card_id: 'major_13',
    name: 'Death',
    suit: 'Major Arcana',
    rank: 13,
    card_specific_keyword: 'Endings, transformation',
    numerology_meaning: 'the clearing away of the old to make way for the new',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Scorpio']
    }
  },
  {
    card_id: 'major_14',
    name: 'Temperance',
    suit: 'Major Arcana',
    rank: 14,
    card_specific_keyword: 'Balance, moderation',
    numerology_meaning: 'alchemy, blending opposites, and finding a middle path',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Sagittarius']
    }
  },
  {
    card_id: 'major_15',
    name: 'The Devil',
    suit: 'Major Arcana',
    rank: 15,
    card_specific_keyword: 'Attachment, restriction',
    numerology_meaning: 'shadow work, material entrapment, and confronting inner demons',
    element_data: {
      element: 'Earth',
      energy: 'Feminine',
      qualities: ['dry', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Capricorn']
    }
  },
  {
    card_id: 'major_16',
    name: 'The Tower',
    suit: 'Major Arcana',
    rank: 16,
    card_specific_keyword: 'Sudden upheaval, revelation',
    numerology_meaning: 'the destruction of false foundations to expose the truth',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Mars']
    }
  },
  {
    card_id: 'major_17',
    name: 'The Star',
    suit: 'Major Arcana',
    rank: 17,
    card_specific_keyword: 'Hope, healing',
    numerology_meaning: 'spiritual renewal, serenity, and connecting to the universe',
    element_data: {
      element: 'Air',
      energy: 'Feminine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Aquarius']
    }
  },
  {
    card_id: 'major_18',
    name: 'The Moon',
    suit: 'Major Arcana',
    rank: 18,
    card_specific_keyword: 'Illusion, fear',
    numerology_meaning: 'navigating the unknown, anxiety, and the subconscious mind',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Pisces']
    }
  },
  {
    card_id: 'major_19',
    name: 'The Sun',
    suit: 'Major Arcana',
    rank: 19,
    card_specific_keyword: 'Positivity, vitality',
    numerology_meaning: 'joy, success, and pure conscious realization',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Sun']
    }
  },
  {
    card_id: 'major_20',
    name: 'Judgement',
    suit: 'Major Arcana',
    rank: 20,
    card_specific_keyword: 'Rebirth, absolution',
    numerology_meaning: 'a spiritual awakening and hearing a higher calling',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Pluto']
    }
  },
  {
    card_id: 'major_21',
    name: 'The World',
    suit: 'Major Arcana',
    rank: 21,
    card_specific_keyword: 'Completion, integration',
    numerology_meaning: 'the successful conclusion of a cycle and wholeness',
    element_data: {
      element: 'Earth',
      energy: 'Feminine',
      qualities: ['dry', 'cold'],
      playing_card_suit: 'N/A',
      core_representation: 'major life themes, spiritual awakenings, and sweeping archetypal shifts',
      zodiac: ['Saturn']
    }
  },
  {
    card_id: 'wands_01',
    name: 'Ace of Wands',
    suit: 'Wands',
    rank: 1,
    card_specific_keyword: 'Do, Action',
    numerology_meaning: 'new beginnings and opportunities',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_02',
    name: 'Two of Wands',
    suit: 'Wands',
    rank: 2,
    card_specific_keyword: 'Set goals',
    numerology_meaning: 'partnership and balance',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_03',
    name: 'Three of Wands',
    suit: 'Wands',
    rank: 3,
    card_specific_keyword: 'Virtuous actions',
    numerology_meaning: 'trinity and magic',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_04',
    name: 'Four of Wands',
    suit: 'Wands',
    rank: 4,
    card_specific_keyword: 'Completed projects',
    numerology_meaning: 'foundation and completion',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_05',
    name: 'Five of Wands',
    suit: 'Wands',
    rank: 5,
    card_specific_keyword: 'Strife',
    numerology_meaning: 'strife and chaos',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_06',
    name: 'Six of Wands',
    suit: 'Wands',
    rank: 6,
    card_specific_keyword: 'Victory',
    numerology_meaning: 'perfection and beauty',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_07',
    name: 'Seven of Wands',
    suit: 'Wands',
    rank: 7,
    card_specific_keyword: 'Valor yet struggle',
    numerology_meaning: 'spiritual seeking and questing',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_08',
    name: 'Eight of Wands',
    suit: 'Wands',
    rank: 8,
    card_specific_keyword: 'Swiftness',
    numerology_meaning: 'infinity and stability',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_09',
    name: 'Nine of Wands',
    suit: 'Wands',
    rank: 9,
    card_specific_keyword: 'Strength, Holding your ground',
    numerology_meaning: 'master number of magic and highest single digit number',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_10',
    name: 'Ten of Wands',
    suit: 'Wands',
    rank: 10,
    card_specific_keyword: 'Oppression',
    numerology_meaning: 'top number of fulfillment and harvest',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'swords_01',
    name: 'Ace of Swords',
    suit: 'Swords',
    rank: 1,
    card_specific_keyword: 'Think',
    numerology_meaning: 'new beginnings and opportunities',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_02',
    name: 'Two of Swords',
    suit: 'Swords',
    rank: 2,
    card_specific_keyword: 'Peace of mind',
    numerology_meaning: 'partnership and balance',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_03',
    name: 'Three of Swords',
    suit: 'Swords',
    rank: 3,
    card_specific_keyword: 'Sorrow due to loss',
    numerology_meaning: 'trinity and magic',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_04',
    name: 'Four of Swords',
    suit: 'Swords',
    rank: 4,
    card_specific_keyword: 'Truce and rest',
    numerology_meaning: 'foundation and completion',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_05',
    name: 'Five of Swords',
    suit: 'Swords',
    rank: 5,
    card_specific_keyword: 'Defeat',
    numerology_meaning: 'strife and chaos',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_06',
    name: 'Six of Swords',
    suit: 'Swords',
    rank: 6,
    card_specific_keyword: 'Science, balance',
    numerology_meaning: 'perfection and beauty',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_07',
    name: 'Seven of Swords',
    suit: 'Swords',
    rank: 7,
    card_specific_keyword: 'Futility, theft',
    numerology_meaning: 'spiritual seeking and questing',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_08',
    name: 'Eight of Swords',
    suit: 'Swords',
    rank: 8,
    card_specific_keyword: 'Interference, confusion',
    numerology_meaning: 'infinity and stability',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_09',
    name: 'Nine of Swords',
    suit: 'Swords',
    rank: 9,
    card_specific_keyword: 'Self inflicted cruelty',
    numerology_meaning: 'master number of magic and highest single digit number',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_10',
    name: 'Ten of Swords',
    suit: 'Swords',
    rank: 10,
    card_specific_keyword: 'Ruin',
    numerology_meaning: 'top number of fulfillment and harvest',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'cups_01',
    name: 'Ace of Cups',
    suit: 'Cups',
    rank: 1,
    card_specific_keyword: 'Intuit, feel',
    numerology_meaning: 'new beginnings and opportunities',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'Hearts',
      core_representation: 'emotions, intuition, spiritual belief, reflection, joy, faith, and love',
      zodiac: ['Pisces', 'Cancer', 'Scorpio']
    }
  },
  {
    card_id: 'wands_page',
    name: 'Page of Wands',
    suit: 'Wands',
    rank: 'Page',
    card_specific_keyword: 'Exploration',
    numerology_meaning: 'exploration, seeking, and learning',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_knight',
    name: 'Knight of Wands',
    suit: 'Wands',
    rank: 'Knight',
    card_specific_keyword: 'Quest',
    numerology_meaning: 'action, quest, and movement',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_queen',
    name: 'Queen of Wands',
    suit: 'Wands',
    rank: 'Queen',
    card_specific_keyword: 'Maturity',
    numerology_meaning: 'embodying the element with depth and maturity',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'wands_king',
    name: 'King of Wands',
    suit: 'Wands',
    rank: 'King',
    card_specific_keyword: 'Mastery',
    numerology_meaning: 'mastery',
    element_data: {
      element: 'Fire',
      energy: 'Masculine',
      qualities: ['hot', 'dry'],
      playing_card_suit: 'Clubs',
      core_representation: 'will, drive, destiny, action, adventure, creativity, and spirit in action',
      zodiac: ['Aries', 'Leo', 'Sagittarius']
    }
  },
  {
    card_id: 'swords_page',
    name: 'Page of Swords',
    suit: 'Swords',
    rank: 'Page',
    card_specific_keyword: 'Exploration',
    numerology_meaning: 'exploration, seeking, and learning',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_knight',
    name: 'Knight of Swords',
    suit: 'Swords',
    rank: 'Knight',
    card_specific_keyword: 'Quest',
    numerology_meaning: 'action, quest, and movement',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_queen',
    name: 'Queen of Swords',
    suit: 'Swords',
    rank: 'Queen',
    card_specific_keyword: 'Maturity',
    numerology_meaning: 'embodying the element with depth and maturity',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'swords_king',
    name: 'King of Swords',
    suit: 'Swords',
    rank: 'King',
    card_specific_keyword: 'Mastery',
    numerology_meaning: 'mastery',
    element_data: {
      element: 'Air',
      energy: 'Masculine',
      qualities: ['wet', 'hot'],
      playing_card_suit: 'Spades',
      core_representation: 'the mind, mental activity, knowledge, intellect, thoughts, ideas, and communication',
      zodiac: ['Gemini', 'Libra', 'Aquarius']
    }
  },
  {
    card_id: 'cups_page',
    name: 'Page of Cups',
    suit: 'Cups',
    rank: 'Page',
    card_specific_keyword: 'Exploration',
    numerology_meaning: 'exploration, seeking, and learning',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'Hearts',
      core_representation: 'emotions, intuition, spiritual belief, reflection, joy, faith, and love',
      zodiac: ['Pisces', 'Cancer', 'Scorpio']
    }
  },
  {
    card_id: 'cups_knight',
    name: 'Knight of Cups',
    suit: 'Cups',
    rank: 'Knight',
    card_specific_keyword: 'Quest',
    numerology_meaning: 'action, quest, and movement',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'Hearts',
      core_representation: 'emotions, intuition, spiritual belief, reflection, joy, faith, and love',
      zodiac: ['Pisces', 'Cancer', 'Scorpio']
    }
  },
  {
    card_id: 'cups_queen',
    name: 'Queen of Cups',
    suit: 'Cups',
    rank: 'Queen',
    card_specific_keyword: 'Maturity',
    numerology_meaning: 'embodying the element with depth and maturity',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'Hearts',
      core_representation: 'emotions, intuition, spiritual belief, reflection, joy, faith, and love',
      zodiac: ['Pisces', 'Cancer', 'Scorpio']
    }
  },
  {
    card_id: 'cups_king',
    name: 'King of Cups',
    suit: 'Cups',
    rank: 'King',
    card_specific_keyword: 'Mastery',
    numerology_meaning: 'mastery',
    element_data: {
      element: 'Water',
      energy: 'Feminine',
      qualities: ['wet', 'cold'],
      playing_card_suit: 'Hearts',
      core_representation: 'emotions, intuition, spiritual belief, reflection, joy, faith, and love',
      zodiac: ['Pisces', 'Cancer', 'Scorpio']
    }
  },
  {
    card_id: 'pentacles_page',
    name: 'Page of Pentacles',
    suit: 'Pentacles',
    rank: 'Page',
    card_specific_keyword: 'Exploration',
    numerology_meaning: 'exploration, seeking, and learning',
    element_data: {
      element: 'Earth',
      energy: 'Feminine',
      qualities: ['dry', 'cold'],
      playing_card_suit: 'Diamonds',
      core_representation: 'nature, the material world, money, career, physical health, tangible goods and the concrete reality of our Mother Earth who we walk on every day',
      zodiac: ['Virgo', 'Capricorn', 'Taurus']
    }
  },
  {
    card_id: 'pentacles_knight',
    name: 'Knight of Pentacles',
    suit: 'Pentacles',
    rank: 'Knight',
    card_specific_keyword: 'Quest',
    numerology_meaning: 'action, quest, and movement',
    element_data: {
      element: 'Earth',
      energy: 'Feminine',
      qualities: ['dry', 'cold'],
      playing_card_suit: 'Diamonds',
      core_representation: 'nature, the material world, money, career, physical health, tangible goods and the concrete reality of our Mother Earth who we walk on every day',
      zodiac: ['Virgo', 'Capricorn', 'Taurus']
    }
  },
  {
    card_id: 'pentacles_queen',
    name: 'Queen of Pentacles',
    suit: 'Pentacles',
    rank: 'Queen',
    card_specific_keyword: 'Maturity',
    numerology_meaning: 'embodying the element with depth and maturity',
    element_data: {
      element: 'Earth',
      energy: 'Feminine',
      qualities: ['dry', 'cold'],
      playing_card_suit: 'Diamonds',
      core_representation: 'nature, the material world, money, career, physical health, tangible goods and the concrete reality of our Mother Earth who we walk on every day',
      zodiac: ['Virgo', 'Capricorn', 'Taurus']
    }
  },
  {
    card_id: 'pentacles_king',
    name: 'King of Pentacles',
    suit: 'Pentacles',
    rank: 'King',
    card_specific_keyword: 'Mastery',
    numerology_meaning: 'mastery',
    element_data: {
      element: 'Earth',
      energy: 'Feminine',
      qualities: ['dry', 'cold'],
      playing_card_suit: 'Diamonds',
      core_representation: 'nature, the material world, money, career, physical health, tangible goods and the concrete reality of our Mother Earth who we walk on every day',
      zodiac: ['Virgo', 'Capricorn', 'Taurus']
    }
  }
];

// Helper lookup map by normalized name
const ESOTERIC_MAP = new Map<string, EsotericCardRecord>();
ESOTERIC_CARD_DATA.forEach((card) => {
  ESOTERIC_MAP.set(card.name.toLowerCase().trim(), card);
  ESOTERIC_MAP.set(card.card_id.toLowerCase().trim(), card);
});

export function getEsotericDataByCardName(cardName: string): EsotericCardRecord | undefined {
  if (!cardName) return undefined;
  const normalized = cardName.toLowerCase().trim();
  if (ESOTERIC_MAP.has(normalized)) {
    return ESOTERIC_MAP.get(normalized);
  }
  // Try partial matching
  for (const [key, value] of ESOTERIC_MAP.entries()) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return undefined;
}
