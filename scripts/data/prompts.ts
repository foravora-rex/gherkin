export type PromptSeed = {
  text: string;
  follow_up?: string;
  category: string;
  tags: string[];
};

export const prompts: PromptSeed[] = [

  // ─── MUSIC / INDIE & ALTERNATIVE ───────────────────────────────────────────

  {
    text: "Which artist did you discover before they were famous? When everyone else caught up, did it change your relationship with their music?",
    category: "music",
    tags: ["indie-alternative"],
  },
  {
    text: "Which album sounds like a specific chapter of your life — not because of when you found it, but because of what it captured about that time?",
    category: "music",
    tags: ["indie-alternative"],
  },
  {
    text: "What song do you put on when you need to feel like yourself again?",
    category: "music",
    tags: ["indie-alternative"],
  },
  {
    text: "What's the most honest thing you've ever heard in a song lyric — the line that made you think: someone actually said that?",
    category: "music",
    tags: ["indie-alternative"],
  },
  {
    text: "Your GOAT album — the one that, if pressed, wins. Name it.",
    follow_up: "Is there a specific listen — a time, a place, a moment in your life — where this album meant something it couldn't mean at any other time?",
    category: "music",
    tags: ["indie-alternative"],
  },
  {
    text: "What's a song you've recommended to someone who didn't get it — and how did that feel?",
    category: "music",
    tags: ["indie-alternative"],
  },

  // ─── MUSIC / POP ───────────────────────────────────────────────────────────

  {
    text: "Is there a pop era you feel nostalgic for? What does nostalgia for that particular sound actually feel like?",
    category: "music",
    tags: ["pop"],
  },
  {
    text: "What does loving pop music say about you that some people might not expect?",
    category: "music",
    tags: ["pop"],
  },
  {
    text: "What's a pop hook that genuinely ambushed you — that got into your head before you'd decided to let it?",
    category: "music",
    tags: ["pop"],
  },
  {
    text: "Your GOAT pop star — name them, no hedging.",
    follow_up: "What era of theirs is the one — and what were you going through in your life when it mattered most to you?",
    category: "music",
    tags: ["pop"],
  },
  {
    text: "What pop song works on you completely, every time — what is it about it that gets you, no matter how many times you've heard it?",
    category: "music",
    tags: ["pop"],
  },

  // ─── MUSIC / FOLK & SINGER-SONGWRITER ──────────────────────────────────────

  {
    text: "What's the saddest song you know that you love — not in spite of its sadness, but because of it? What does that sadness give you?",
    category: "music",
    tags: ["folk-singer-songwriter"],
  },
  {
    text: "What's a song that tells a story so specifically that it made you care about people you'd never met — what made it work?",
    category: "music",
    tags: ["folk-singer-songwriter"],
  },
  {
    text: "What's a song you've sung alone when you thought nobody was listening — and what does it mean that it was that one?",
    category: "music",
    tags: ["folk-singer-songwriter"],
  },
  {
    text: "Your GOAT song to cry to — name it.",
    follow_up: "Which specific verse or line is the one that moves you — and what is it actually about for you?",
    category: "music",
    tags: ["folk-singer-songwriter"],
  },
  {
    text: "What does the intimacy of a single voice and an acoustic guitar give you that a full production can't?",
    category: "music",
    tags: ["folk-singer-songwriter"],
  },

  // ─── MUSIC / CLASSICAL & JAZZ ──────────────────────────────────────────────

  {
    text: "Which instrument has a sound you have a visceral response to — one that does something to you physically? What is it about that timbre?",
    category: "music",
    tags: ["classical-jazz"],
  },
  {
    text: "What's the difference between listening to classical or jazz as background and listening to it as the main thing? When do you do which?",
    category: "music",
    tags: ["classical-jazz"],
  },
  {
    text: "What would be lost if classical music and jazz disappeared entirely? What is it they preserve that nothing else does?",
    category: "music",
    tags: ["classical-jazz"],
  },
  {
    text: "What does 'improvisation' mean to you — in music, and does that meaning carry over into how you live?",
    category: "music",
    tags: ["classical-jazz"],
  },

  // ─── MUSIC / ELECTRONIC & DANCE ────────────────────────────────────────────

  {
    text: "Is there a song that's made you feel genuinely euphoric — where the feeling was physical? What was it, and where were you?",
    category: "music",
    tags: ["electronic-dance"],
  },
  {
    text: "What's the best you've ever danced — where were you, what was playing, and what were you like in that moment?",
    category: "music",
    tags: ["electronic-dance"],
  },
  {
    text: "What's a track that captures a specific feeling you struggle to put into words anywhere else — what is the feeling, and why that track?",
    category: "music",
    tags: ["electronic-dance"],
  },
  {
    text: "What does the dancefloor feel like when it's working — and what makes it stop working?",
    category: "music",
    tags: ["electronic-dance"],
  },

  // ─── MUSIC / HIP-HOP & RAP ─────────────────────────────────────────────────

  {
    text: "What's a rap lyric that hit you like a statement about the world — not just a flex, something that actually said something true?",
    category: "music",
    tags: ["hip-hop-rap"],
  },
  {
    text: "What's the most technically impressive verse you've ever heard — where the craft itself, not just the content, stopped you?",
    category: "music",
    tags: ["hip-hop-rap"],
  },
  {
    text: "What does hip-hop give you that other genres don't?",
    category: "music",
    tags: ["hip-hop-rap"],
  },
  {
    text: "Your GOAT rap album.",
    follow_up: "Is there a specific listen — a time, a place, a moment in your life — where this album meant something it couldn't mean at any other time?",
    category: "music",
    tags: ["hip-hop-rap"],
  },

  // ─── MUSIC / METAL & ROCK ──────────────────────────────────────────────────

  {
    text: "What's the angriest song you love — and is the anger in the music the same as the anger you bring to it, or a different one entirely?",
    category: "music",
    tags: ["metal-rock"],
  },
  {
    text: "Which album do you think represents the peak of what the genre can do — the one you'd put in front of a sceptic?",
    category: "music",
    tags: ["metal-rock"],
  },
  {
    text: "What does catharsis mean to you — and when have you actually felt it in music?",
    category: "music",
    tags: ["metal-rock"],
  },
  {
    text: "What does metal or rock give you that other genres don't — what is it reaching in you that nothing else can?",
    category: "music",
    tags: ["metal-rock"],
  },

  // ─── STORIES & WORDS / LITERARY FICTION ────────────────────────────────────

  {
    text: "What's a book you've pressed into someone's hands — and what does it say about what you need people to understand about you?",
    category: "stories-and-words",
    tags: ["literary-fiction"],
  },
  {
    text: "What's a sentence from a book you've never forgotten? What is it, and why does it stay?",
    category: "stories-and-words",
    tags: ["literary-fiction"],
  },
  {
    text: "Has a book ever changed how you see a person in your life — not a character, a real person?",
    category: "stories-and-words",
    tags: ["literary-fiction"],
  },
  {
    text: "Which writer's voice feels so close to your own inner voice that reading them feels almost like eavesdropping on yourself?",
    category: "stories-and-words",
    tags: ["literary-fiction"],
  },
  {
    text: "What's the most uncomfortable thing a novel has ever made you feel about yourself?",
    category: "stories-and-words",
    tags: ["literary-fiction"],
  },
  {
    text: "Which novel made you grieve when it ended — not for the characters, but because you had to leave the world it built?",
    category: "stories-and-words",
    tags: ["literary-fiction"],
  },
  {
    text: "Which book did you read at exactly the wrong time — and what do you think it would mean to you now?",
    category: "stories-and-words",
    tags: ["literary-fiction"],
  },

  // ─── STORIES & WORDS / FANTASY & SCI-FI ───────────────────────────────────

  {
    text: "What's a fictional world you'd genuinely want to live in — and what does that choice say about what you feel is missing from this one?",
    category: "stories-and-words",
    tags: ["fantasy-sci-fi"],
  },
  {
    text: "What's a fictional species, race, or type of being you've found yourself identifying with more than you expected?",
    category: "stories-and-words",
    tags: ["fantasy-sci-fi"],
  },
  {
    text: "Which villain in fantasy or sci-fi do you secretly understand — what logic do they follow that you can actually see the sense in?",
    category: "stories-and-words",
    tags: ["fantasy-sci-fi"],
  },
  {
    text: "What does a fantasy or sci-fi story understand about the human condition that realist fiction can't reach?",
    category: "stories-and-words",
    tags: ["fantasy-sci-fi"],
  },

  // ─── STORIES & WORDS / FANFICTION ──────────────────────────────────────────

  {
    text: "What's the first fandom you ever truly fell into — and what was it about that story that made you need more of it?",
    category: "stories-and-words",
    tags: ["fanfiction"],
  },
  {
    text: "Have you ever read a fanfic that you thought was better than the source material? What did it do differently?",
    category: "stories-and-words",
    tags: ["fanfiction"],
  },
  {
    text: "Has loving a fandom ever made you feel embarrassed — and what do you think that embarrassment was really about?",
    category: "stories-and-words",
    tags: ["fanfiction"],
  },
  {
    text: "If you could fix one thing about how a canon story ended — just one — what would it be and why does it matter to you?",
    category: "stories-and-words",
    tags: ["fanfiction"],
  },

  // ─── SCREEN & STAGE / CINEMA ───────────────────────────────────────────────

  {
    text: "What's a film that genuinely changed how you see something — not confirmed what you already thought, actually changed it?",
    category: "screen-and-stage",
    tags: ["cinema"],
  },
  {
    text: "What's a scene — not a whole film, just a scene — that has stayed with you longer than it should? What is it about that specific one?",
    category: "screen-and-stage",
    tags: ["cinema"],
  },
  {
    text: "Which film do you think is genuinely great but isn't in the conversation it deserves to be in? What is it doing that people are missing?",
    category: "screen-and-stage",
    tags: ["cinema"],
  },
  {
    text: "Which film ending do you think is the most honest thing cinema has ever done? Why that one?",
    category: "screen-and-stage",
    tags: ["cinema"],
  },
  {
    text: "Your GOAT actor — one name, no hedging.",
    follow_up: "Name a performance of theirs that people overlook — not their most famous role, something quieter. What does it show you about what they can do?",
    category: "screen-and-stage",
    tags: ["cinema"],
  },
  {
    text: "Your GOAT villain — the one whose logic you can't entirely dismiss.",
    follow_up: "What is it they understand about the world that you find yourself unable to completely argue with?",
    category: "screen-and-stage",
    tags: ["cinema"],
  },

  // ─── SCREEN & STAGE / COMFORT TV ───────────────────────────────────────────

  {
    text: "What's the show you return to — not to discover, but just to be inside again? What does being in that world give you?",
    category: "screen-and-stage",
    tags: ["comfort-tv"],
  },
  {
    text: "Which character in a show do you feel genuinely protective of — someone you'd get unreasonably upset about if the show treated them badly?",
    category: "screen-and-stage",
    tags: ["comfort-tv"],
  },
  {
    text: "What's the scene you go back to when you need to feel something specific? What is it trying to give you?",
    category: "screen-and-stage",
    tags: ["comfort-tv"],
  },
  {
    text: "Your GOAT TV show — the one you'd put on a list and never take off.",
    follow_up: "What's the specific episode or scene that made you certain it was the one — and what did it do to you?",
    category: "screen-and-stage",
    tags: ["comfort-tv"],
  },

  // ─── SCREEN & STAGE / ANIME ────────────────────────────────────────────────

  {
    text: "What was the anime that first made the genre feel like yours — not just entertainment, but something that spoke to you specifically?",
    category: "screen-and-stage",
    tags: ["anime"],
  },
  {
    text: "Is there a character arc in anime that you think is the best piece of character writing you've encountered in any medium?",
    category: "screen-and-stage",
    tags: ["anime"],
  },
  {
    text: "What does anime reach that Western animation or live-action can't? What does the format uniquely make possible?",
    category: "screen-and-stage",
    tags: ["anime"],
  },

  // ─── UNIVERSAL / INNER LIFE — OVERTHINKER ──────────────────────────────────

  {
    text: "What's a thought you've turned over so many times that you've actually worn it smooth — where the sharp thing it used to be has become something almost comforting?",
    category: "universal",
    tags: ["overthinker"],
  },
  {
    text: "Which of your overthinking spirals has actually been worth it — where the excessive examination produced something you couldn't have arrived at any other way?",
    category: "universal",
    tags: ["overthinker"],
  },
  {
    text: "Is there a question you've been sitting with for years — not because you can't find the answer, but because finding it would mean something you're not ready for?",
    category: "universal",
    tags: ["overthinker"],
  },
  {
    text: "When does thinking become a way of not doing something? What is it you're usually not doing when the thinking takes over?",
    category: "universal",
    tags: ["overthinker"],
  },
  {
    text: "What's something you know intellectually but still can't seem to make yourself believe — where the reasoning is complete but the feeling hasn't caught up?",
    category: "universal",
    tags: ["overthinker"],
  },

  // ─── UNIVERSAL / INNER LIFE — NOSTALGIC ────────────────────────────────────

  {
    text: "What's a memory you return to that has no particular narrative importance — no lesson, no turning point — but that you keep anyway? What do you think you're keeping it for?",
    category: "universal",
    tags: ["nostalgic"],
  },
  {
    text: "Which version of yourself from the past do you miss most — not the circumstances of that time, but the person you actually were in it?",
    category: "universal",
    tags: ["nostalgic"],
  },
  {
    text: "What story do you tell about your own past that you suspect is at least partly a story — something you've shaped or softened or made more coherent than it was?",
    category: "universal",
    tags: ["nostalgic"],
  },
  {
    text: "What's something you thought you'd always have access to that you didn't realise you were experiencing for the last time until long after it was gone?",
    category: "universal",
    tags: ["nostalgic"],
  },

  // ─── UNIVERSAL / INNER LIFE — OBSERVER ─────────────────────────────────────

  {
    text: "What's something you notice in rooms that most people don't seem to register — what are you actually scanning for?",
    category: "universal",
    tags: ["observer"],
  },
  {
    text: "What's the difference between observing people because you're curious about them and observing because you're keeping a careful distance? Which one are you more often doing?",
    category: "universal",
    tags: ["observer"],
  },
  {
    text: "Has something you've noticed about the world ever changed how you move through it — a detail that quietly rewired something?",
    category: "universal",
    tags: ["observer"],
  },

  // ─── UNIVERSAL / INNER LIFE — MAKER ────────────────────────────────────────

  {
    text: "What happens to you when you go too long without making anything — what is the absence of it like?",
    category: "universal",
    tags: ["maker"],
  },
  {
    text: "What do you make that you never show anyone — the things that are purely for you, with no audience, no judgement? What are they for?",
    category: "universal",
    tags: ["maker"],
  },
  {
    text: "What is making things solving for you? What need does it meet that nothing else does in quite the same way?",
    category: "universal",
    tags: ["maker"],
  },
  {
    text: "What's the most honest thing you've ever made — the one where you put something in it that you weren't certain you wanted the world to be able to see?",
    category: "universal",
    tags: ["maker"],
  },

  // ─── UNIVERSAL / LIFE CHAPTER — IN TRANSITION ──────────────────────────────

  {
    text: "What did you think this in-between period would feel like, and how does it actually feel — what did you get wrong about it?",
    category: "universal",
    tags: ["in-transition"],
  },
  {
    text: "What are you holding onto from where you came from that you already know isn't going to make it through to the other side?",
    category: "universal",
    tags: ["in-transition"],
  },
  {
    text: "Who are you when you're between things — is the in-between revealing something about you that the before and after get covered over?",
    category: "universal",
    tags: ["in-transition"],
  },

  // ─── UNIVERSAL / LIFE CHAPTER — BUILDING ───────────────────────────────────

  {
    text: "What does working toward something give you that having the thing wouldn't — what's in the building itself that the built version won't contain?",
    category: "universal",
    tags: ["building"],
  },
  {
    text: "What has building this thing required you to become that you didn't expect when you started?",
    category: "universal",
    tags: ["building"],
  },
  {
    text: "What's the part of the process you've surprised yourself by enjoying — the piece you expected to be purely obstacle?",
    category: "universal",
    tags: ["building"],
  },

  // ─── UNIVERSAL / LIFE CHAPTER — RECOVERING ─────────────────────────────────

  {
    text: "What did that period show you about yourself that you're not sure you wanted to know?",
    category: "universal",
    tags: ["recovering"],
  },
  {
    text: "What are you doing now that you couldn't have done before — not because things are better, but because something in you was changed by it?",
    category: "universal",
    tags: ["recovering"],
  },
  {
    text: "What's the thing you now know how to do that you couldn't have learned any other way?",
    category: "universal",
    tags: ["recovering"],
  },

  // ─── UNIVERSAL / LIFE CHAPTER — EXPLORING ──────────────────────────────────

  {
    text: "What are you curious about right now that has no practical application — the thing you're following purely because it interests you, with no destination?",
    category: "universal",
    tags: ["exploring"],
  },
  {
    text: "What's something you've discovered about yourself in the absence of crisis — the part of you that only appears when there's nothing pressing?",
    category: "universal",
    tags: ["exploring"],
  },
  {
    text: "What does contentment feel like for you — is it warm, or is it a little bit terrifying, or both at once?",
    category: "universal",
    tags: ["exploring"],
  },

  // ─── UNIVERSAL / PURELY UNIVERSAL ──────────────────────────────────────────

  {
    text: "What's something you believe that you'd find difficult to defend out loud — not because it's wrong, but because the explanation would take longer than anyone would give you?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What are you afraid to want? Not afraid to admit you want — actually afraid to want, because wanting it would require you to take it seriously?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What do you know about yourself now that you wish the person you were ten years ago could have been told — and would that person have believed you?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What does the way you leave places say about you — parties, relationships, jobs, cities? Is there a pattern in how you make your exits?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What's something you've never said out loud that you think about more than once a year? Not a secret — just a thought you've kept entirely inside.",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What does the way you treat yourself when nobody is watching say about how you actually feel about yourself?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What's something you've forgiven in other people that you haven't managed to forgive in yourself?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What's the version of your life you chose against — the road you can still see from the one you took? Do you look at it often?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What's a compliment you've received that you've never quite been able to take in — where you heard it but couldn't let it land? What do you think was in the way?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What would change about your life if you stopped waiting for permission — and whose permission are you actually waiting for?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What have you been consistently wrong about across your life — a pattern of misjudgement that you can see clearly in retrospect?",
    category: "universal",
    tags: ["purely-universal"],
  },
  {
    text: "What's the thing you're most privately proud of that you never mention — not because it's embarrassing, but because explaining why it matters would require you to say too much about yourself?",
    category: "universal",
    tags: ["purely-universal"],
  },
];
