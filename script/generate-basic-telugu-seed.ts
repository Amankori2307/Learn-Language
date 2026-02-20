import fs from "fs/promises";
import path from "path";

type SeedInput = {
  telugu: string;
  transliteration: string;
  english: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "phrase" | "numeral";
  clusters: string[];
  exampleTelugu: string;
  exampleEnglish: string;
};

const BASIC_SEED: SeedInput[] = [
  // Greetings and essentials
  { telugu: "నమస్తే", transliteration: "namaste", english: "hello", partOfSpeech: "phrase", clusters: ["greetings", "daily-use"], exampleTelugu: "నమస్తే, మీరు ఎలా ఉన్నారు?", exampleEnglish: "Hello, how are you?" },
  { telugu: "ధన్యవాదాలు", transliteration: "dhanyavaadalu", english: "thank you", partOfSpeech: "phrase", clusters: ["greetings", "daily-use"], exampleTelugu: "మీ సహాయానికి ధన్యవాదాలు.", exampleEnglish: "Thank you for your help." },
  { telugu: "దయచేసి", transliteration: "dayachesi", english: "please", partOfSpeech: "adverb", clusters: ["greetings", "daily-use"], exampleTelugu: "దయచేసి కూర్చోండి.", exampleEnglish: "Please sit down." },
  { telugu: "క్షమించండి", transliteration: "kshaminchandi", english: "sorry / excuse me", partOfSpeech: "phrase", clusters: ["greetings", "daily-use"], exampleTelugu: "క్షమించండి, నాకు అర్థం కాలేదు.", exampleEnglish: "Sorry, I did not understand." },
  { telugu: "అవును", transliteration: "avunu", english: "yes", partOfSpeech: "adverb", clusters: ["daily-use"], exampleTelugu: "అవును, నేను వస్తాను.", exampleEnglish: "Yes, I will come." },
  { telugu: "కాదు", transliteration: "kaadu", english: "no / not", partOfSpeech: "adverb", clusters: ["daily-use"], exampleTelugu: "కాదు, అది నా పుస్తకం కాదు.", exampleEnglish: "No, that is not my book." },
  { telugu: "సరే", transliteration: "sare", english: "okay", partOfSpeech: "phrase", clusters: ["daily-use"], exampleTelugu: "సరే, మనం వెళ్లుదాం.", exampleEnglish: "Okay, let us go." },
  { telugu: "బాగుంది", transliteration: "bagundi", english: "it is good", partOfSpeech: "phrase", clusters: ["daily-use"], exampleTelugu: "ఈ ఆలోచన బాగుంది.", exampleEnglish: "This idea is good." },

  // Pronouns and question words
  { telugu: "నేను", transliteration: "nenu", english: "I", partOfSpeech: "pronoun", clusters: ["core-grammar", "daily-use"], exampleTelugu: "నేను తెలుగు నేర్చుకుంటున్నాను.", exampleEnglish: "I am learning Telugu." },
  { telugu: "నువ్వు", transliteration: "nuvvu", english: "you (informal)", partOfSpeech: "pronoun", clusters: ["core-grammar", "daily-use"], exampleTelugu: "నువ్వు ఎక్కడ ఉంటావు?", exampleEnglish: "Where do you live?" },
  { telugu: "మీరు", transliteration: "meeru", english: "you (formal/plural)", partOfSpeech: "pronoun", clusters: ["core-grammar", "daily-use"], exampleTelugu: "మీరు ఏమి చేస్తారు?", exampleEnglish: "What do you do?" },
  { telugu: "అతను", transliteration: "atanu", english: "he", partOfSpeech: "pronoun", clusters: ["core-grammar"], exampleTelugu: "అతను నా స్నేహితుడు.", exampleEnglish: "He is my friend." },
  { telugu: "ఆమె", transliteration: "aame", english: "she", partOfSpeech: "pronoun", clusters: ["core-grammar"], exampleTelugu: "ఆమె మంచి టీచర్.", exampleEnglish: "She is a good teacher." },
  { telugu: "ఇది", transliteration: "idi", english: "this", partOfSpeech: "pronoun", clusters: ["core-grammar"], exampleTelugu: "ఇది నా ఫోన్.", exampleEnglish: "This is my phone." },
  { telugu: "అది", transliteration: "adi", english: "that", partOfSpeech: "pronoun", clusters: ["core-grammar"], exampleTelugu: "అది మా ఇల్లు.", exampleEnglish: "That is our house." },
  { telugu: "మనం", transliteration: "manam", english: "we (inclusive)", partOfSpeech: "pronoun", clusters: ["core-grammar"], exampleTelugu: "మనం ఇప్పుడు మొదలుపెడదాం.", exampleEnglish: "Let us start now." },
  { telugu: "మేము", transliteration: "memu", english: "we (exclusive)", partOfSpeech: "pronoun", clusters: ["core-grammar"], exampleTelugu: "మేము హైదరాబాద్‌లో ఉంటాం.", exampleEnglish: "We live in Hyderabad." },
  { telugu: "వాళ్లు", transliteration: "vaallu", english: "they", partOfSpeech: "pronoun", clusters: ["core-grammar"], exampleTelugu: "వాళ్లు స్కూల్‌కి వెళ్లారు.", exampleEnglish: "They went to school." },
  { telugu: "ఏమి", transliteration: "emi", english: "what", partOfSpeech: "pronoun", clusters: ["question-words", "core-grammar"], exampleTelugu: "ఇది ఏమి?", exampleEnglish: "What is this?" },
  { telugu: "ఎవరు", transliteration: "evaru", english: "who", partOfSpeech: "pronoun", clusters: ["question-words", "core-grammar"], exampleTelugu: "అతను ఎవరు?", exampleEnglish: "Who is he?" },
  { telugu: "ఎక్కడ", transliteration: "ekkada", english: "where", partOfSpeech: "adverb", clusters: ["question-words", "core-grammar"], exampleTelugu: "మీ ఇల్లు ఎక్కడ?", exampleEnglish: "Where is your house?" },
  { telugu: "ఎప్పుడు", transliteration: "eppudu", english: "when", partOfSpeech: "adverb", clusters: ["question-words", "core-grammar"], exampleTelugu: "మీరు ఎప్పుడు వస్తారు?", exampleEnglish: "When will you come?" },
  { telugu: "ఎలా", transliteration: "ela", english: "how", partOfSpeech: "adverb", clusters: ["question-words", "core-grammar"], exampleTelugu: "ఇది ఎలా పనిచేస్తుంది?", exampleEnglish: "How does this work?" },
  { telugu: "ఎందుకు", transliteration: "enduku", english: "why", partOfSpeech: "adverb", clusters: ["question-words", "core-grammar"], exampleTelugu: "నువ్వు ఎందుకు ఆలస్యంగా వచ్చావు?", exampleEnglish: "Why did you come late?" },

  // Numbers
  { telugu: "ఒకటి", transliteration: "okati", english: "one", partOfSpeech: "numeral", clusters: ["numbers"], exampleTelugu: "నా దగ్గర ఒకటి పుస్తకం ఉంది.", exampleEnglish: "I have one book." },
  { telugu: "రెండు", transliteration: "rendu", english: "two", partOfSpeech: "numeral", clusters: ["numbers"], exampleTelugu: "మాకు రెండు పిల్లలు ఉన్నారు.", exampleEnglish: "We have two children." },
  { telugu: "మూడు", transliteration: "moodu", english: "three", partOfSpeech: "numeral", clusters: ["numbers"], exampleTelugu: "మూడు రోజుల తర్వాత రండి.", exampleEnglish: "Come after three days." },
  { telugu: "నాలుగు", transliteration: "naalugu", english: "four", partOfSpeech: "numeral", clusters: ["numbers"], exampleTelugu: "నాలుగు కుర్చీలు కావాలి.", exampleEnglish: "We need four chairs." },
  { telugu: "ఐదు", transliteration: "aidu", english: "five", partOfSpeech: "numeral", clusters: ["numbers"], exampleTelugu: "ఐదు నిమిషాలు వేచి ఉండండి.", exampleEnglish: "Please wait five minutes." },
  { telugu: "పది", transliteration: "padi", english: "ten", partOfSpeech: "numeral", clusters: ["numbers"], exampleTelugu: "పది గంటలకు మీటింగ్ ఉంది.", exampleEnglish: "There is a meeting at ten o'clock." },
  { telugu: "ఇరవై", transliteration: "iravai", english: "twenty", partOfSpeech: "numeral", clusters: ["numbers"], exampleTelugu: "ఇరవై మంది విద్యార్థులు ఉన్నారు.", exampleEnglish: "There are twenty students." },

  // Time
  { telugu: "ఈరోజు", transliteration: "eeroju", english: "today", partOfSpeech: "noun", clusters: ["time", "daily-use"], exampleTelugu: "ఈరోజు వాతావరణం చల్లగా ఉంది.", exampleEnglish: "Today the weather is cool." },
  { telugu: "రేపు", transliteration: "repu", english: "tomorrow", partOfSpeech: "noun", clusters: ["time", "daily-use"], exampleTelugu: "రేపు కలుద్దాం.", exampleEnglish: "Let us meet tomorrow." },
  { telugu: "నిన్న", transliteration: "ninna", english: "yesterday", partOfSpeech: "noun", clusters: ["time", "daily-use"], exampleTelugu: "నిన్న నేను ఇంట్లోనే ఉన్నాను.", exampleEnglish: "Yesterday I stayed at home." },
  { telugu: "ఇప్పుడు", transliteration: "ippudu", english: "now", partOfSpeech: "adverb", clusters: ["time", "daily-use"], exampleTelugu: "ఇప్పుడు మొదలు పెడదాం.", exampleEnglish: "Let us start now." },
  { telugu: "తర్వాత", transliteration: "taruvata", english: "later / after", partOfSpeech: "adverb", clusters: ["time", "daily-use"], exampleTelugu: "నేను తర్వాత ఫోన్ చేస్తాను.", exampleEnglish: "I will call later." },
  { telugu: "ఉదయం", transliteration: "udayam", english: "morning", partOfSpeech: "noun", clusters: ["time"], exampleTelugu: "ఉదయం నేను నడకకు వెళ్తాను.", exampleEnglish: "I go for a walk in the morning." },
  { telugu: "సాయంత్రం", transliteration: "saayantram", english: "evening", partOfSpeech: "noun", clusters: ["time"], exampleTelugu: "సాయంత్రం టీ తాగుదాం.", exampleEnglish: "Let us drink tea in the evening." },
  { telugu: "రాత్రి", transliteration: "raatri", english: "night", partOfSpeech: "noun", clusters: ["time"], exampleTelugu: "రాత్రి త్వరగా నిద్రపో.", exampleEnglish: "Sleep early at night." },
  { telugu: "సమయం", transliteration: "samayam", english: "time", partOfSpeech: "noun", clusters: ["time"], exampleTelugu: "నీ సమయం విలువైనది.", exampleEnglish: "Your time is valuable." },

  // Family and people
  { telugu: "అమ్మ", transliteration: "amma", english: "mother", partOfSpeech: "noun", clusters: ["family", "people"], exampleTelugu: "నా అమ్మ చాలా మంచిది.", exampleEnglish: "My mother is very kind." },
  { telugu: "నాన్న", transliteration: "nanna", english: "father", partOfSpeech: "noun", clusters: ["family", "people"], exampleTelugu: "నా నాన్న ఆఫీసుకి వెళ్లారు.", exampleEnglish: "My father went to the office." },
  { telugu: "అన్న", transliteration: "anna", english: "elder brother", partOfSpeech: "noun", clusters: ["family", "people"], exampleTelugu: "నా అన్న హైదరాబాద్‌లో ఉంటాడు.", exampleEnglish: "My elder brother lives in Hyderabad." },
  { telugu: "అక్క", transliteration: "akka", english: "elder sister", partOfSpeech: "noun", clusters: ["family", "people"], exampleTelugu: "నా అక్క డాక్టర్.", exampleEnglish: "My elder sister is a doctor." },
  { telugu: "తమ్ముడు", transliteration: "tammudu", english: "younger brother", partOfSpeech: "noun", clusters: ["family", "people"], exampleTelugu: "నా తమ్ముడు క్రికెట్ ఆడుతాడు.", exampleEnglish: "My younger brother plays cricket." },
  { telugu: "చెల్లి", transliteration: "chelli", english: "younger sister", partOfSpeech: "noun", clusters: ["family", "people"], exampleTelugu: "నా చెల్లి పాట పాడుతుంది.", exampleEnglish: "My younger sister sings songs." },
  { telugu: "కుటుంబం", transliteration: "kutumbam", english: "family", partOfSpeech: "noun", clusters: ["family", "people"], exampleTelugu: "మా కుటుంబం పెద్దది.", exampleEnglish: "Our family is big." },
  { telugu: "స్నేహితుడు", transliteration: "snehitudu", english: "friend (male)", partOfSpeech: "noun", clusters: ["people", "daily-use"], exampleTelugu: "అతను నా మంచి స్నేహితుడు.", exampleEnglish: "He is my good friend." },
  { telugu: "స్నేహితురాలు", transliteration: "snehituralu", english: "friend (female)", partOfSpeech: "noun", clusters: ["people", "daily-use"], exampleTelugu: "ఆమె నా స్నేహితురాలు.", exampleEnglish: "She is my friend." },

  // Daily nouns
  { telugu: "ఇల్లు", transliteration: "illu", english: "house", partOfSpeech: "noun", clusters: ["home", "daily-use"], exampleTelugu: "మా ఇల్లు పెద్దది.", exampleEnglish: "Our house is big." },
  { telugu: "పుస్తకం", transliteration: "pustakam", english: "book", partOfSpeech: "noun", clusters: ["education", "daily-use"], exampleTelugu: "నేను తెలుగు పుస్తకం చదువుతున్నాను.", exampleEnglish: "I am reading a Telugu book." },
  { telugu: "పాఠశాల", transliteration: "paatashaala", english: "school", partOfSpeech: "noun", clusters: ["education"], exampleTelugu: "పిల్లలు పాఠశాలకు వెళ్లారు.", exampleEnglish: "The children went to school." },
  { telugu: "నీరు", transliteration: "neeru", english: "water", partOfSpeech: "noun", clusters: ["food-and-drink", "daily-use"], exampleTelugu: "నాకు నీరు కావాలి.", exampleEnglish: "I need water." },
  { telugu: "అన్నం", transliteration: "annam", english: "cooked rice / meal", partOfSpeech: "noun", clusters: ["food-and-drink", "daily-use"], exampleTelugu: "అన్నం వేడిగా ఉంది.", exampleEnglish: "The rice is hot." },
  { telugu: "పండు", transliteration: "pandu", english: "fruit", partOfSpeech: "noun", clusters: ["food-and-drink"], exampleTelugu: "నేను ప్రతి రోజు పండు తింటాను.", exampleEnglish: "I eat fruit every day." },
  { telugu: "బస్సు", transliteration: "bassu", english: "bus", partOfSpeech: "noun", clusters: ["travel", "daily-use"], exampleTelugu: "బస్సు సమయానికి వచ్చింది.", exampleEnglish: "The bus arrived on time." },
  { telugu: "రోడు", transliteration: "rodu", english: "road", partOfSpeech: "noun", clusters: ["travel", "places"], exampleTelugu: "ఈ రోడు నగరానికి వెళ్తుంది.", exampleEnglish: "This road goes to the city." },
  { telugu: "గ్రామం", transliteration: "graamam", english: "village", partOfSpeech: "noun", clusters: ["places"], exampleTelugu: "నా గ్రామం చాలా అందంగా ఉంటుంది.", exampleEnglish: "My village is very beautiful." },
  { telugu: "నగరం", transliteration: "nagaram", english: "city", partOfSpeech: "noun", clusters: ["places"], exampleTelugu: "హైదరాబాద్ ఒక పెద్ద నగరం.", exampleEnglish: "Hyderabad is a big city." },
  { telugu: "పని", transliteration: "pani", english: "work", partOfSpeech: "noun", clusters: ["daily-use"], exampleTelugu: "నాకు ఈరోజు చాలా పని ఉంది.", exampleEnglish: "I have a lot of work today." },
  { telugu: "డబ్బు", transliteration: "dabbu", english: "money", partOfSpeech: "noun", clusters: ["daily-use"], exampleTelugu: "నాకు కొంచెం డబ్బు కావాలి.", exampleEnglish: "I need some money." },
  { telugu: "భాష", transliteration: "bhaasha", english: "language", partOfSpeech: "noun", clusters: ["education", "daily-use"], exampleTelugu: "తెలుగు ఒక అందమైన భాష.", exampleEnglish: "Telugu is a beautiful language." },
  { telugu: "సహాయం", transliteration: "sahaayam", english: "help", partOfSpeech: "noun", clusters: ["daily-use"], exampleTelugu: "మీ సహాయం నాకు అవసరం.", exampleEnglish: "I need your help." },

  // Verbs
  { telugu: "వెళ్ళు", transliteration: "vellu", english: "go", partOfSpeech: "verb", clusters: ["daily-actions", "travel"], exampleTelugu: "మనము మార్కెట్‌కి వెళ్దాం.", exampleEnglish: "Let us go to the market." },
  { telugu: "రా", transliteration: "raa", english: "come", partOfSpeech: "verb", clusters: ["daily-actions"], exampleTelugu: "ఇక్కడికి రా.", exampleEnglish: "Come here." },
  { telugu: "తిను", transliteration: "tinu", english: "eat", partOfSpeech: "verb", clusters: ["daily-actions", "food-and-drink"], exampleTelugu: "సమయానికి భోజనం తిను.", exampleEnglish: "Eat your meal on time." },
  { telugu: "తాగు", transliteration: "taagu", english: "drink", partOfSpeech: "verb", clusters: ["daily-actions", "food-and-drink"], exampleTelugu: "రోజూ ఎక్కువ నీరు తాగు.", exampleEnglish: "Drink more water daily." },
  { telugu: "చదువు", transliteration: "chaduvu", english: "study / read", partOfSpeech: "verb", clusters: ["daily-actions", "education"], exampleTelugu: "ప్రతి రోజు తెలుగు చదువు.", exampleEnglish: "Study Telugu every day." },
  { telugu: "రాయి", transliteration: "raayi", english: "write", partOfSpeech: "verb", clusters: ["daily-actions", "education"], exampleTelugu: "నీ పేరు ఇక్కడ రాయి.", exampleEnglish: "Write your name here." },
  { telugu: "చూడు", transliteration: "choodu", english: "see / look", partOfSpeech: "verb", clusters: ["daily-actions"], exampleTelugu: "ఈ చిత్రం చూడు.", exampleEnglish: "Look at this picture." },
  { telugu: "మాట్లాడు", transliteration: "maatlaadu", english: "speak / talk", partOfSpeech: "verb", clusters: ["daily-actions"], exampleTelugu: "నెమ్మదిగా మాట్లాడు.", exampleEnglish: "Speak slowly." },
  { telugu: "విను", transliteration: "vinu", english: "listen / hear", partOfSpeech: "verb", clusters: ["daily-actions"], exampleTelugu: "జాగ్రత్తగా విను.", exampleEnglish: "Listen carefully." },
  { telugu: "నిద్రపో", transliteration: "nidrapo", english: "sleep", partOfSpeech: "verb", clusters: ["daily-actions", "time"], exampleTelugu: "రాత్రి తొందరగా నిద్రపో.", exampleEnglish: "Sleep early at night." },
  { telugu: "కూర్చో", transliteration: "koorcho", english: "sit", partOfSpeech: "verb", clusters: ["daily-actions"], exampleTelugu: "ఇక్కడ కూర్చో.", exampleEnglish: "Sit here." },
  { telugu: "నిలబడు", transliteration: "nilabadu", english: "stand", partOfSpeech: "verb", clusters: ["daily-actions"], exampleTelugu: "లైన్లో నిలబడు.", exampleEnglish: "Stand in the line." },
  { telugu: "ఇవ్వు", transliteration: "ivvu", english: "give", partOfSpeech: "verb", clusters: ["daily-actions"], exampleTelugu: "దయచేసి నాకు నీ పుస్తకం ఇవ్వు.", exampleEnglish: "Please give me your book." },
  { telugu: "తీసుకో", transliteration: "teesuko", english: "take", partOfSpeech: "verb", clusters: ["daily-actions"], exampleTelugu: "ఈ పెన్ను తీసుకో.", exampleEnglish: "Take this pen." },
  { telugu: "చేయి", transliteration: "cheyi", english: "do", partOfSpeech: "verb", clusters: ["daily-actions"], exampleTelugu: "ఈ పని ఇప్పుడే చేయి.", exampleEnglish: "Do this work now." },
  { telugu: "తెలుసు", transliteration: "telusu", english: "know", partOfSpeech: "verb", clusters: ["daily-actions", "core-grammar"], exampleTelugu: "నాకు ఈ పదం తెలుసు.", exampleEnglish: "I know this word." },
  { telugu: "అర్థం అవు", transliteration: "artham avu", english: "understand", partOfSpeech: "verb", clusters: ["daily-actions", "education"], exampleTelugu: "ఇప్పుడు నాకు అర్థం అయింది.", exampleEnglish: "Now I understood." },

  // Adjectives/adverbs
  { telugu: "మంచి", transliteration: "manchi", english: "good", partOfSpeech: "adjective", clusters: ["descriptions", "daily-use"], exampleTelugu: "అతను మంచి మనిషి.", exampleEnglish: "He is a good person." },
  { telugu: "చెడు", transliteration: "chedu", english: "bad", partOfSpeech: "adjective", clusters: ["descriptions"], exampleTelugu: "ఇది చెడు అలవాటు.", exampleEnglish: "This is a bad habit." },
  { telugu: "పెద్ద", transliteration: "pedda", english: "big", partOfSpeech: "adjective", clusters: ["descriptions"], exampleTelugu: "ఇది పెద్ద ఇల్లు.", exampleEnglish: "This is a big house." },
  { telugu: "చిన్న", transliteration: "chinna", english: "small", partOfSpeech: "adjective", clusters: ["descriptions"], exampleTelugu: "అది చిన్న పుస్తకం.", exampleEnglish: "That is a small book." },
  { telugu: "కొత్త", transliteration: "kotta", english: "new", partOfSpeech: "adjective", clusters: ["descriptions"], exampleTelugu: "నేను కొత్త ఫోన్ కొన్నాను.", exampleEnglish: "I bought a new phone." },
  { telugu: "పాత", transliteration: "paata", english: "old", partOfSpeech: "adjective", clusters: ["descriptions"], exampleTelugu: "ఇది పాత ఇల్లు.", exampleEnglish: "This is an old house." },
  { telugu: "చాలా", transliteration: "chaala", english: "very / much", partOfSpeech: "adverb", clusters: ["daily-use"], exampleTelugu: "ఆమె చాలా తెలివైనది.", exampleEnglish: "She is very smart." },
  { telugu: "నెమ్మదిగా", transliteration: "nemmadiga", english: "slowly", partOfSpeech: "adverb", clusters: ["daily-use"], exampleTelugu: "దయచేసి నెమ్మదిగా మాట్లాడు.", exampleEnglish: "Please speak slowly." },
  { telugu: "వేగంగా", transliteration: "veganga", english: "quickly", partOfSpeech: "adverb", clusters: ["daily-use"], exampleTelugu: "అతను వేగంగా పరుగెత్తాడు.", exampleEnglish: "He ran quickly." },
  { telugu: "ఇక్కడ", transliteration: "ikkada", english: "here", partOfSpeech: "adverb", clusters: ["places", "daily-use"], exampleTelugu: "ఇక్కడ వేచి ఉండు.", exampleEnglish: "Wait here." },
  { telugu: "అక్కడ", transliteration: "akkada", english: "there", partOfSpeech: "adverb", clusters: ["places", "daily-use"], exampleTelugu: "అక్కడ ఒక దుకాణం ఉంది.", exampleEnglish: "There is a shop there." },
];

async function main() {
  const generatedAt = new Date().toISOString();
  const output = BASIC_SEED.map((item) => ({
    telugu: item.telugu,
    transliteration: item.transliteration,
    english: item.english,
    partOfSpeech: item.partOfSpeech,
    difficulty: 1,
    difficultyLevel: "beginner",
    frequencyScore: 0.9,
    cefrLevel: "A1",
    tags: ["model-seed", "needs-review", "high-confidence-basic"],
    clusters: item.clusters,
    examples: [
      {
        telugu: item.exampleTelugu,
        english: item.exampleEnglish,
        contextTag: "daily-use",
        difficulty: 1,
      },
    ],
    source: {
      type: "model-knowledge",
      generatedAt,
      reviewStatus: "pending_review",
    },
  }));

  const assetsSeedPath = path.join(process.cwd(), "assets/processed/telugu_basic_seed_model_draft.json");

  await fs.mkdir(path.dirname(assetsSeedPath), { recursive: true });

  await fs.writeFile(assetsSeedPath, JSON.stringify(output, null, 2));

  console.log(`Generated ${output.length} beginner Telugu entries`);
  console.log(`- ${assetsSeedPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
