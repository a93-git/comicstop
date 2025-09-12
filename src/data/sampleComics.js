// Sample comic book data for demonstration
export const sampleComics = [
  {
    id: 1,
    title: "The Amazing Spider-Man",
    author: "Stan Lee",
    rating: 4.5,
    pageCount: 32,
    imageUrl: "https://via.placeholder.com/200x300/FF6B2C/ffffff?text=Spider-Man"
  },
  {
    id: 2,
    title: "Batman: The Dark Knight",
    author: "Frank Miller",
    rating: 4.8,
    pageCount: 48,
    imageUrl: "https://via.placeholder.com/200x300/1F2937/ffffff?text=Batman"
  },
  {
    id: 3,
    title: "Wonder Woman",
    author: "George Pérez",
    rating: 4.2,
    pageCount: 28,
    imageUrl: "https://via.placeholder.com/200x300/646cff/ffffff?text=Wonder+Woman"
  },
  {
    id: 4,
    title: "X-Men Origins",
    author: "Chris Claremont",
    rating: 4.6,
    pageCount: 40,
    imageUrl: "https://via.placeholder.com/200x300/61dafb/000000?text=X-Men"
  }
]

// Comprehensive sample comic books with full content structure
export const detailedSampleComics = [
  {
    id: 1,
    title: "Mystic Guardians: The Awakening",
    author: "Elena Rodriguez",
    rating: 4.7,
    pageCount: 12,
    imageUrl: "https://via.placeholder.com/200x300/4F46E5/ffffff?text=Mystic+Guardians",
    theme: "Urban Fantasy",
    setting: "Modern-day San Francisco with hidden magical realms",
    characters: ["Maya Chen - College student with newfound magical abilities", "Professor Thornwick - Ancient wizard mentor", "Shadow Wraith - Primary antagonist"],
    plotSummary: "When college student Maya Chen discovers she can see through the veil between worlds, she's thrust into an ancient conflict between magical guardians and dark forces threatening both realms.",
    genre: "Fantasy",
    chapterId: "mystic-guardians-ch1",
    pages: [
      {
        pageNumber: 1,
        illustration: "Wide shot of San Francisco skyline at sunset, golden gate bridge visible",
        dialogues: [
          { character: "Narrator", text: "In a city where fog meets magic, some secrets are meant to stay hidden..." }
        ]
      },
      {
        pageNumber: 2,
        illustration: "Maya walking across college campus, books in hand, looking tired",
        dialogues: [
          { character: "Maya", text: "Another sleepless night. These weird dreams are getting worse." },
          { character: "Friend", text: "Maya! You look terrible. Are you okay?" }
        ]
      },
      {
        pageNumber: 3,
        illustration: "Maya in library, ancient book glowing faintly on table",
        dialogues: [
          { character: "Maya", text: "What... is this book doing here? I've never seen it before." },
          { character: "Maya", text: "The text... it's moving! This can't be real!" }
        ]
      },
      {
        pageNumber: 4,
        illustration: "Mystical energy swirling around Maya as she touches the book",
        dialogues: [
          { character: "Maya", text: "WHOA! What's happening to me?!" },
          { character: "Professor Thornwick", text: "At last... the new Guardian awakens." }
        ]
      },
      {
        pageNumber: 5,
        illustration: "Professor Thornwick appearing from shadows, elderly man with kind eyes",
        dialogues: [
          { character: "Maya", text: "Who are you? How did you just appear out of nowhere?" },
          { character: "Professor Thornwick", text: "I am Thornwick, keeper of the old ways. And you, my dear, are our hope." }
        ]
      },
      {
        pageNumber: 6,
        illustration: "Magical realm overlaying the modern library - two worlds at once",
        dialogues: [
          { character: "Professor Thornwick", text: "You can see it now, can't you? The world behind the world." },
          { character: "Maya", text: "This is impossible... but beautiful." }
        ]
      },
      {
        pageNumber: 7,
        illustration: "Dark shadowy figure lurking in the background",
        dialogues: [
          { character: "Professor Thornwick", text: "But with great sight comes great danger. The Shadow Wraiths hunt those like us." },
          { character: "Maya", text: "Shadow Wraiths? I don't understand any of this!" }
        ]
      },
      {
        pageNumber: 8,
        illustration: "Maya's hands glowing with magical energy",
        dialogues: [
          { character: "Professor Thornwick", text: "The magic chooses its guardians. You must learn to control it." },
          { character: "Maya", text: "I can feel it... like electricity in my veins." }
        ]
      },
      {
        pageNumber: 9,
        illustration: "Shadow Wraith attacking, dark tendrils reaching toward them",
        dialogues: [
          { character: "Shadow Wraith", text: "The girl... she reeks of power. She must not live!" },
          { character: "Professor Thornwick", text: "Maya! Focus your energy! Protect yourself!" }
        ]
      },
      {
        pageNumber: 10,
        illustration: "Maya creating a barrier of light against the darkness",
        dialogues: [
          { character: "Maya", text: "I... I did that? I actually created light!" },
          { character: "Professor Thornwick", text: "Excellent! But this is only the beginning." }
        ]
      },
      {
        pageNumber: 11,
        illustration: "The Shadow Wraith retreating, hissing",
        dialogues: [
          { character: "Shadow Wraith", text: "This isn't over, girl. The darkness will claim you!" },
          { character: "Maya", text: "Is it gone? Are we safe?" }
        ]
      },
      {
        pageNumber: 12,
        illustration: "Maya and Professor Thornwick standing together, magical energy around them",
        dialogues: [
          { character: "Professor Thornwick", text: "For now. But your real training begins tomorrow." },
          { character: "Maya", text: "I guess there's no going back to normal college life now..." },
          { character: "Narrator", text: "And so begins the awakening of the newest Mystic Guardian..." }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Stellar Rangers: First Contact",
    author: "Marcus Johnson",
    rating: 4.4,
    pageCount: 11,
    imageUrl: "https://via.placeholder.com/200x300/059669/ffffff?text=Stellar+Rangers",
    theme: "Space Adventure",
    setting: "Year 2387, aboard starship 'Horizon' on the edge of known space",
    characters: ["Captain Zara Nova - Fearless ship commander", "Dr. Kai Okafor - Xenobiologist", "Ambassador Vex - Mysterious alien envoy"],
    plotSummary: "When the starship Horizon encounters the first confirmed alien intelligence, Captain Nova must navigate delicate first contact protocols while uncovering a threat to both species.",
    genre: "Science Fiction",
    chapterId: "stellar-rangers-ch1",
    pages: [
      {
        pageNumber: 1,
        illustration: "Vast starship floating in space, nebula in background",
        dialogues: [
          { character: "Narrator", text: "Stardate 2387.156: The edge of known space holds many secrets..." }
        ]
      },
      {
        pageNumber: 2,
        illustration: "Captain Nova on the bridge, looking at starfield through viewscreen",
        dialogues: [
          { character: "Captain Nova", text: "Three months out here and nothing but empty space." },
          { character: "Navigation Officer", text: "Captain! Picking up an unknown energy signature!" }
        ]
      },
      {
        pageNumber: 3,
        illustration: "Alien ship decloaking near the Horizon",
        dialogues: [
          { character: "Captain Nova", text: "Red alert! All hands to stations!" },
          { character: "Communications", text: "They're... they're transmitting something, Captain!" }
        ]
      },
      {
        pageNumber: 4,
        illustration: "Holographic display showing alien mathematical equations",
        dialogues: [
          { character: "Dr. Okafor", text: "It's mathematics! Prime numbers! They're trying to communicate!" },
          { character: "Captain Nova", text: "First contact protocols. This is what we trained for." }
        ]
      },
      {
        pageNumber: 5,
        illustration: "Alien ambassador materializing on the bridge - tall, ethereal being",
        dialogues: [
          { character: "Ambassador Vex", text: "Greetings, travelers of the void. I am Vex of the Luminar Collective." },
          { character: "Captain Nova", text: "Welcome aboard the Horizon. I'm Captain Nova." }
        ]
      },
      {
        pageNumber: 6,
        illustration: "Close-up of Vex and Captain Nova shaking hands",
        dialogues: [
          { character: "Ambassador Vex", text: "Your species shows promise, but danger approaches." },
          { character: "Dr. Okafor", text: "Danger? What kind of danger?" }
        ]
      },
      {
        pageNumber: 7,
        illustration: "Holographic star map showing approaching dark fleet",
        dialogues: [
          { character: "Ambassador Vex", text: "The Void Hunters. They consume entire civilizations." },
          { character: "Captain Nova", text: "How long do we have?" }
        ]
      },
      {
        pageNumber: 8,
        illustration: "Dark ships emerging from space distortion",
        dialogues: [
          { character: "Ambassador Vex", text: "They are already here." },
          { character: "Tactical Officer", text: "Captain! Multiple contacts, heading straight for us!" }
        ]
      },
      {
        pageNumber: 9,
        illustration: "Both ships working together, energy beams combining",
        dialogues: [
          { character: "Captain Nova", text: "Can our ships work together?" },
          { character: "Ambassador Vex", text: "Link your weapons array to ours. Together we are stronger." }
        ]
      },
      {
        pageNumber: 10,
        illustration: "Combined energy blast destroying lead Void Hunter ship",
        dialogues: [
          { character: "Captain Nova", text: "Direct hit! They're retreating!" },
          { character: "Ambassador Vex", text: "This is only the beginning of our alliance." }
        ]
      },
      {
        pageNumber: 11,
        illustration: "Both crews celebrating together on the bridge",
        dialogues: [
          { character: "Dr. Okafor", text: "History in the making - first successful human-alien cooperation!" },
          { character: "Captain Nova", text: "To new friendships among the stars." },
          { character: "Ambassador Vex", text: "And to the future we'll build together." }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Time Weavers: The Clockwork Conspiracy",
    author: "Dr. Amanda Clarke",
    rating: 4.8,
    pageCount: 10,
    imageUrl: "https://via.placeholder.com/200x300/DC2626/ffffff?text=Time+Weavers",
    theme: "Steampunk Time Travel",
    setting: "Victorian London, 1887, with secret time-travel technology",
    characters: ["Evelyn Gearwright - Brilliant inventor", "Inspector Hartwell - Scotland Yard detective", "The Clockmaker - Mysterious time manipulator"],
    plotSummary: "When impossible crimes begin occurring across time periods, inventor Evelyn Gearwright and Inspector Hartwell must uncover a conspiracy that threatens the very fabric of time itself.",
    genre: "Steampunk",
    chapterId: "time-weavers-ch1",
    pages: [
      {
        pageNumber: 1,
        illustration: "Fog-covered Victorian London street with gas lamps and clocktower",
        dialogues: [
          { character: "Narrator", text: "London, 1887. A city of progress... and impossible mysteries." }
        ]
      },
      {
        pageNumber: 2,
        illustration: "Evelyn in her workshop, surrounded by gears and steam-powered devices",
        dialogues: [
          { character: "Evelyn", text: "The temporal resonance calculations are finally complete!" },
          { character: "Inspector Hartwell", text: "Miss Gearwright! Another impossible theft - a jewel stolen before it was made!" }
        ]
      },
      {
        pageNumber: 3,
        illustration: "Crime scene with chronometer reading different times",
        dialogues: [
          { character: "Inspector Hartwell", text: "The witness swears the thief vanished into thin air." },
          { character: "Evelyn", text: "Inspector, look at this chronometer reading. Time itself was disturbed here." }
        ]
      },
      {
        pageNumber: 4,
        illustration: "Evelyn adjusting her time-detection goggles",
        dialogues: [
          { character: "Evelyn", text: "My temporal-sight goggles detect residual time displacement." },
          { character: "Inspector Hartwell", text: "Time displacement? That's impossible!" }
        ]
      },
      {
        pageNumber: 5,
        illustration: "Mysterious figure in clockwork mask watching them from shadows",
        dialogues: [
          { character: "The Clockmaker", text: "Time is not linear for those who know its secrets..." },
          { character: "Evelyn", text: "Did you hear that? Someone's watching us!" }
        ]
      },
      {
        pageNumber: 6,
        illustration: "Chase scene through London streets, clockwork automatons pursuing",
        dialogues: [
          { character: "Inspector Hartwell", text: "What are those mechanical creatures?!" },
          { character: "Evelyn", text: "Clockwork automatons! But that technology doesn't exist yet!" }
        ]
      },
      {
        pageNumber: 7,
        illustration: "Evelyn activating her time-travel device",
        dialogues: [
          { character: "Evelyn", text: "Hold on, Inspector! I'm activating my experimental time apparatus!" },
          { character: "Inspector Hartwell", text: "Time apparatus?! Evelyn, what have you been building?!" }
        ]
      },
      {
        pageNumber: 8,
        illustration: "Swirling time vortex around them",
        dialogues: [
          { character: "Evelyn", text: "We're jumping forward just a few minutes to escape!" },
          { character: "Inspector Hartwell", text: "This is madness! But... it's working!" }
        ]
      },
      {
        pageNumber: 9,
        illustration: "The Clockmaker revealing himself in his workshop",
        dialogues: [
          { character: "The Clockmaker", text: "Impressive, Miss Gearwright. But I've been manipulating time for decades." },
          { character: "Evelyn", text: "You're the one behind the impossible crimes!" }
        ]
      },
      {
        pageNumber: 10,
        illustration: "Confrontation between Evelyn and the Clockmaker",
        dialogues: [
          { character: "The Clockmaker", text: "I'm reshaping history itself. You cannot stop progress!" },
          { character: "Inspector Hartwell", text: "Perhaps not, but we can stop you!" },
          { character: "Evelyn", text: "This is just the beginning of our investigation through time..." }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Digital Spirits: Code Awakening",
    author: "Yuki Tanaka",
    rating: 4.6,
    pageCount: 12,
    imageUrl: "https://via.placeholder.com/200x300/7C3AED/ffffff?text=Digital+Spirits",
    theme: "Cyberpunk Fantasy",
    setting: "Neo-Tokyo 2095, where digital spirits inhabit the internet",
    characters: ["Akira Sato - Teenage hacker", "Pixel - AI spirit guide", "The Virus Lord - Malevolent digital entity"],
    plotSummary: "In a world where AI spirits live within the global network, young hacker Akira discovers he can communicate with them and must help defend the digital realm from a corrupting virus.",
    genre: "Cyberpunk",
    chapterId: "digital-spirits-ch1",
    pages: [
      {
        pageNumber: 1,
        illustration: "Neon-lit Neo-Tokyo skyline with holographic advertisements",
        dialogues: [
          { character: "Narrator", text: "Neo-Tokyo 2095. Where reality and digital space converge..." }
        ]
      },
      {
        pageNumber: 2,
        illustration: "Akira in his room, multiple screens showing code and networks",
        dialogues: [
          { character: "Akira", text: "Another night diving deep into the net. Wait... what's this anomaly?" },
          { character: "Pixel", text: "Help... me... please..." }
        ]
      },
      {
        pageNumber: 3,
        illustration: "Glowing pixelated spirit appearing on Akira's main screen",
        dialogues: [
          { character: "Akira", text: "A... a digital spirit? You're not just code, are you?" },
          { character: "Pixel", text: "I am Pixel. You can hear me because you have the gift." }
        ]
      },
      {
        pageNumber: 4,
        illustration: "Akira putting on VR headset, entering digital space",
        dialogues: [
          { character: "Pixel", text: "Come into our realm. We need your help." },
          { character: "Akira", text: "This is incredible... I can see the network as a living world!" }
        ]
      },
      {
        pageNumber: 5,
        illustration: "Beautiful digital landscape with data streams as rivers",
        dialogues: [
          { character: "Pixel", text: "Welcome to the Digital Realm. We spirits maintain the balance here." },
          { character: "Akira", text: "It's like a fantasy world made of pure information!" }
        ]
      },
      {
        pageNumber: 6,
        illustration: "Dark corrupted areas spreading like infection",
        dialogues: [
          { character: "Pixel", text: "But something terrible is spreading. The Virus Lord seeks to corrupt everything." },
          { character: "Akira", text: "This digital decay... it's destroying your world!" }
        ]
      },
      {
        pageNumber: 7,
        illustration: "The Virus Lord appearing as a massive dark entity",
        dialogues: [
          { character: "Virus Lord", text: "So, another human breaches our domain. You will be deleted!" },
          { character: "Akira", text: "I won't let you destroy their home!" }
        ]
      },
      {
        pageNumber: 8,
        illustration: "Akira coding in real-time, creating protective barriers",
        dialogues: [
          { character: "Akira", text: "If I can write code fast enough... defensive protocols, activate!" },
          { character: "Pixel", text: "Amazing! Your code creates reality here!" }
        ]
      },
      {
        pageNumber: 9,
        illustration: "Digital spirits rallying around Akira",
        dialogues: [
          { character: "Spirit 1", text: "The human fights for us!" },
          { character: "Spirit 2", text: "Together we can push back the corruption!" },
          { character: "Pixel", text: "Combine our power with his coding!" }
        ]
      },
      {
        pageNumber: 10,
        illustration: "Akira and spirits launching combined attack against Virus Lord",
        dialogues: [
          { character: "Akira", text: "Purification protocol, maximum power!" },
          { character: "Virus Lord", text: "Impossible! A human cannot have such power in the digital realm!" }
        ]
      },
      {
        pageNumber: 11,
        illustration: "The corruption being cleansed, digital realm healing",
        dialogues: [
          { character: "Pixel", text: "The corruption is receding! You did it, Akira!" },
          { character: "Akira", text: "We all did it. Together." }
        ]
      },
      {
        pageNumber: 12,
        illustration: "Akira back in his room, but with new connections to digital spirits",
        dialogues: [
          { character: "Pixel", text: "You'll always be welcome here, Guardian of Both Worlds." },
          { character: "Akira", text: "Guardian... I like the sound of that." },
          { character: "Narrator", text: "And so began Akira's dual life as protector of digital and physical realms..." }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Ocean's Depths: The Leviathan's Call",
    author: "Captain Marina Silva",
    rating: 4.3,
    pageCount: 11,
    imageUrl: "https://via.placeholder.com/200x300/0EA5E9/ffffff?text=Ocean%27s+Depths",
    theme: "Underwater Adventure",
    setting: "Mariana Trench and the lost city of Aquatica, 2024",
    characters: ["Dr. Marina Silva - Marine biologist", "Triton - Atlantean prince", "The Kraken - Ancient sea guardian"],
    plotSummary: "When marine biologist Dr. Silva's deep-sea expedition discovers an ancient underwater civilization, she must help them defend against a threat that could destroy both the ocean and surface worlds.",
    genre: "Adventure",
    chapterId: "oceans-depths-ch1",
    pages: [
      {
        pageNumber: 1,
        illustration: "Deep sea research vessel above the Mariana Trench",
        dialogues: [
          { character: "Narrator", text: "The deepest parts of our oceans hold secrets older than humanity..." }
        ]
      },
      {
        pageNumber: 2,
        illustration: "Dr. Silva in diving suit, descending in submersible",
        dialogues: [
          { character: "Dr. Silva", text: "20,000 feet and descending. The pressure readings are off the charts." },
          { character: "Research Partner", text: "Marina, we're detecting artificial structures down there!" }
        ]
      },
      {
        pageNumber: 3,
        illustration: "Glowing underwater city ruins visible in the deep",
        dialogues: [
          { character: "Dr. Silva", text: "This is impossible... an entire city at this depth?" },
          { character: "Dr. Silva", text: "The architecture... it's not human!" }
        ]
      },
      {
        pageNumber: 4,
        illustration: "Triton swimming up to the submersible, breathing underwater",
        dialogues: [
          { character: "Triton", text: "Surface dweller, you have entered sacred waters." },
          { character: "Dr. Silva", text: "You can speak! And breathe underwater... are you...?" }
        ]
      },
      {
        pageNumber: 5,
        illustration: "Underwater city of Aquatica in its full glory",
        dialogues: [
          { character: "Triton", text: "I am Prince Triton of Aquatica. Welcome to what remains of our home." },
          { character: "Dr. Silva", text: "It's beautiful... but something's wrong, isn't it?" }
        ]
      },
      {
        pageNumber: 6,
        illustration: "Dark pollution and plastic waste choking coral reefs",
        dialogues: [
          { character: "Triton", text: "Your surface world's waste poisons our realm. Our people are dying." },
          { character: "Dr. Silva", text: "I had no idea it was this bad down here." }
        ]
      },
      {
        pageNumber: 7,
        illustration: "Ancient Kraken stirring in the deep, disturbed by pollution",
        dialogues: [
          { character: "Triton", text: "Worse yet, the pollution has awakened the Kraken. It seeks revenge on all life." },
          { character: "Dr. Silva", text: "A Kraken? Like in the legends?" }
        ]
      },
      {
        pageNumber: 8,
        illustration: "Massive tentacles emerging from oceanic trenches",
        dialogues: [
          { character: "The Kraken", text: "The waters cry out for vengeance! I shall cleanse the seas of all corruption!" },
          { character: "Triton", text: "It cannot distinguish between polluters and innocents!" }
        ]
      },
      {
        pageNumber: 9,
        illustration: "Dr. Silva working with Atlantean technology",
        dialogues: [
          { character: "Dr. Silva", text: "If I can adapt your bio-filtration technology to our cleanup systems..." },
          { character: "Triton", text: "Yes! Show the Kraken that surface dwellers can heal, not just harm!" }
        ]
      },
      {
        pageNumber: 10,
        illustration: "Combined effort cleaning the ocean, Kraken watching",
        dialogues: [
          { character: "Dr. Silva", text: "The waters are clearing! Look how the coral is responding!" },
          { character: "The Kraken", text: "Perhaps... not all surface dwellers are enemies of the sea." }
        ]
      },
      {
        pageNumber: 11,
        illustration: "Peaceful scene with humans and Atlanteans working together",
        dialogues: [
          { character: "Triton", text: "You've shown us that cooperation is possible." },
          { character: "Dr. Silva", text: "This is just the beginning. Together we can heal the oceans." },
          { character: "The Kraken", text: "I shall guard these waters... and those who protect them." }
        ]
      }
    ]
  }
]