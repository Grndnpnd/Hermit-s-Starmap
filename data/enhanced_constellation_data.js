// Enhanced Feywild Star Constellation Data
// Consolidated, non-overlapping seasonal system with state persistence and movement

const ENHANCED_CONSTELLATIONS = [
    // === YEAR-ROUND CONSTELLATIONS (Always Visible) ===
    {
        id: 1,
        name: "The Centaur",
        alternateName: "Guided Arrow",
        shape: "A rearing centaur with a drawn bow pointing southeast",
        season: "year-round",
        seasonCategory: "eternal",
        symbolism: "Guidance, destiny, protection on the road",
        direction: "Southeast",
        coordinates: { x: 70, y: 75, direction: "southeast", elevation: "mid" },
        currentAlignment: "Points southeast—used by navigators toward distant realms",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Always points to true southeast, brightest during travel decisions",
        mythicResonance: "guidance",
        navigationValue: 5, // High value for navigation
        magicalIntensity: 3,
        movementType: "anchor" // Never moves
    },
    {
        id: 2,
        name: "The Mask and Mirror",
        alternateName: "Twin Reflections",
        shape: "A stylized mask split by a mirrored crack",
        season: "year-round",
        seasonCategory: "eternal",
        symbolism: "Identity, deception, reflection, duality of truth",
        direction: "Variable",
        coordinates: { x: 25, y: 25, direction: "variable", elevation: "high" },
        currentAlignment: "Shifts position based on observer's nature",
        emotionalTriggers: ["revelation"],
        visibility: "visible",
        specialEffects: "Appears different to each observer; brightest during revelations",
        mythicResonance: "revelation",
        navigationValue: 2,
        magicalIntensity: 5,
        movementType: "chaotic"
    },
    {
        id: 3,
        name: "The Lantern Bearer",
        alternateName: "Hope's Light",
        shape: "A cloaked figure holding aloft a flickering flame",
        season: "year-round",
        seasonCategory: "eternal",
        symbolism: "Hope in darkness, guidance through despair, divine protection",
        direction: "Zenith",
        coordinates: { x: 50, y: 15, direction: "zenith", elevation: "high" },
        currentAlignment: "Directly overhead at midnight",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Flame flickers with the hope in observers' hearts; grants advantage on Insight checks",
        mythicResonance: "hope",
        navigationValue: 4,
        magicalIntensity: 4,
        movementType: "anchor" // Never moves
    },
    {
        id: 4,
        name: "The Shattered Path",
        alternateName: "Broken Road",
        shape: "A broken star trail across the sky",
        season: "year-round",
        seasonCategory: "eternal",
        symbolism: "Change, catastrophe, transformation, chaos",
        direction: "Variable",
        coordinates: { x: 80, y: 45, direction: "variable", elevation: "variable" },
        currentAlignment: "Never in the same position twice",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Path cannot be followed directly; appears before major changes",
        mythicResonance: "transformation",
        navigationValue: 1, // Unreliable for navigation
        magicalIntensity: 5,
        movementType: "chaotic"
    },

    // === SPRING CONSTELLATIONS ===
    {
        id: 5,
        name: "The Blooming Fang",
        alternateName: "Treacherous Beauty",
        shape: "A flower with fang-like petals curling inward",
        season: "spring",
        seasonCategory: "spring",
        symbolism: "Beauty with danger, hidden threats, false promises",
        direction: "East",
        coordinates: { x: 85, y: 65, direction: "east", elevation: "mid" },
        currentAlignment: "Rises with the dawn during spring months",
        emotionalTriggers: ["betrayal"],
        visibility: "visible",
        specialEffects: "Petals seem to pulse when betrayal is near; warns of false friends",
        mythicResonance: "betrayal",
        navigationValue: 3,
        magicalIntensity: 4,
        movementType: "seasonal"
    },
    {
        id: 6,
        name: "The Lily",
        alternateName: "Pure Renewal",
        shape: "A blooming lily with petals reaching skyward",
        season: "spring",
        seasonCategory: "spring",
        symbolism: "Renewal, purity, new beginnings, resurrection",
        direction: "Northeast",
        coordinates: { x: 75, y: 30, direction: "northeast", elevation: "mid" },
        currentAlignment: "Heralds the spring equinox",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Glows softly during ceremonies of new life and growth rituals",
        mythicResonance: "renewal",
        navigationValue: 3,
        magicalIntensity: 3,
        movementType: "steady"
    },
    {
        id: 7,
        name: "The Swan (Upper)",
        alternateName: "Ascending Grace",
        shape: "A graceful swan in flight, wings spread wide",
        season: "spring",
        seasonCategory: "spring",
        symbolism: "Grace, ascension, transformation, freedom",
        direction: "Southeast",
        coordinates: { x: 70, y: 55, direction: "southeast", elevation: "mid-high" },
        currentAlignment: "Flies highest during spring storms",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Wings seem to beat slowly; inspires courage for new journeys",
        mythicResonance: "transformation",
        navigationValue: 3,
        magicalIntensity: 3,
        movementType: "steady"
    },

    // === SUMMER CONSTELLATIONS ===
    {
        id: 8,
        name: "The Silent Step",
        alternateName: "Hunter's Trail",
        shape: "Pawprints leading across the stars in a hunting pattern",
        season: "summer",
        seasonCategory: "summer",
        symbolism: "Stealth, hunting, patience, survival",
        direction: "North",
        coordinates: { x: 45, y: 35, direction: "north", elevation: "mid" },
        currentAlignment: "Follows the prey across summer skies",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Pawprints fade and reappear; hunters claim luck improves beneath it",
        mythicResonance: "stealth",
        navigationValue: 4,
        magicalIntensity: 2,
        movementType: "wandering"
    },
    {
        id: 9,
        name: "The Spider",
        alternateName: "The Great Weaver",
        shape: "An eight-legged spider crouched with web lines extending",
        season: "summer",
        seasonCategory: "summer",
        symbolism: "Patience, crafting, fate weaving, interconnection",
        direction: "East",
        coordinates: { x: 85, y: 35, direction: "east", elevation: "mid-high" },
        currentAlignment: "Weaves its web across the eastern sky",
        emotionalTriggers: ["bargain"],
        visibility: "visible",
        specialEffects: "Web lines glow when destinies intersect; strongest during bargains",
        mythicResonance: "fate",
        navigationValue: 2,
        magicalIntensity: 4,
        movementType: "mystical"
    },
    {
        id: 10,
        name: "The Flying Mantis",
        alternateName: "Patient Hunter",
        shape: "A winged mantis mid-flight with foreclaws extended",
        season: "summer",
        seasonCategory: "summer",
        symbolism: "Patience, precision, spiritual hunting, meditation",
        direction: "East-Northeast",
        coordinates: { x: 80, y: 25, direction: "east-northeast", elevation: "high" },
        currentAlignment: "Stalks across summer dawns",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Appears clearly to those practicing patience and watching",
        mythicResonance: "vigilance",
        navigationValue: 3,
        magicalIntensity: 3,
        movementType: "wandering"
    },

    // === AUTUMN CONSTELLATIONS ===
    {
        id: 11,
        name: "The Inverted Crown",
        alternateName: "Fallen Majesty",
        shape: "A crown with stars spilling downward like lost jewels",
        season: "autumn",
        seasonCategory: "autumn",
        symbolism: "Fallen power, humility, the temporary nature of authority",
        direction: "West",
        coordinates: { x: 15, y: 40, direction: "west", elevation: "mid" },
        currentAlignment: "Sets with the dying year's power",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "When seen upside-down, foretells political change; jewels fall like tears",
        mythicResonance: "power",
        navigationValue: 3,
        magicalIntensity: 4,
        movementType: "seasonal"
    },
    {
        id: 12,
        name: "The Heartroot",
        alternateName: "Memory's Anchor",
        shape: "A knot of stars in the shape of roots curling inward toward a bright center",
        season: "autumn",
        seasonCategory: "autumn",
        symbolism: "Memory, ancestry, emotional truth, connection to the past",
        direction: "Southwest",
        coordinates: { x: 25, y: 70, direction: "southwest", elevation: "low" },
        currentAlignment: "Visible over sacred groves and ancient sites",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Pulses gently during ancestor veneration; strongest at family gatherings",
        mythicResonance: "memory",
        navigationValue: 2,
        magicalIntensity: 4,
        movementType: "seasonal"
    },
    {
        id: 13,
        name: "The Chalice",
        alternateName: "Sacred Vessel",
        shape: "A goblet-like form with five radiant stars forming the rim",
        season: "autumn",
        seasonCategory: "autumn",
        symbolism: "Sacrifice, offerings, spiritual fulfillment, harvest gratitude",
        direction: "South",
        coordinates: { x: 50, y: 80, direction: "south", elevation: "low" },
        currentAlignment: "Rests on the southern horizon during harvest festivals",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Shimmers brightest during rituals of thanksgiving and sacrifice",
        mythicResonance: "sacrifice",
        navigationValue: 3,
        magicalIntensity: 4,
        movementType: "steady"
    },

    // === WINTER CONSTELLATIONS ===
    {
        id: 14,
        name: "The Mourning Tree",
        alternateName: "Sorrow's Sentinel",
        shape: "A leafless tree with stars dripping from its branches like tears",
        season: "winter",
        seasonCategory: "winter",
        symbolism: "Loss, grief, acceptance, the beauty in endings",
        direction: "North",
        coordinates: { x: 50, y: 30, direction: "north", elevation: "mid" },
        currentAlignment: "Stands vigil over the northern wastes",
        emotionalTriggers: ["mourning"],
        visibility: "visible",
        specialEffects: "Star-tears fall most clearly after loss; provides comfort in grief",
        mythicResonance: "mourning",
        navigationValue: 2,
        magicalIntensity: 5,
        movementType: "seasonal"
    },
    {
        id: 15,
        name: "The Driftcloak",
        alternateName: "Wanderer's Mantle",
        shape: "A twisting path resembling a windswept cloak flowing across the sky",
        season: "winter",
        seasonCategory: "winter",
        symbolism: "Journey, transition, leaving the past behind, exile",
        direction: "Northwest",
        coordinates: { x: 20, y: 25, direction: "northwest", elevation: "mid" },
        currentAlignment: "Flows across winter skies like a traveling companion",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Seems to ripple and flow; guides those leaving one life for another",
        mythicResonance: "transition",
        navigationValue: 4,
        magicalIntensity: 3,
        movementType: "wandering"
    },
    {
        id: 16,
        name: "The Swan (Lower)",
        alternateName: "Resting Grace",
        shape: "A swan near water's edge, wings folded, head turned in contemplation",
        season: "winter",
        seasonCategory: "winter",
        symbolism: "Rest, reflection, inner journey, preparation for rebirth",
        direction: "Southwest",
        coordinates: { x: 30, y: 75, direction: "southwest", elevation: "low" },
        currentAlignment: "Rests on winter waters before spring's return",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Sometimes appears as a reflection; heralds major life transitions",
        mythicResonance: "rebirth",
        navigationValue: 2,
        magicalIntensity: 4,
        movementType: "steady"
    },

    // === RARE/SEASONAL VARIANTS ===
    {
        id: 17,
        name: "The Sibling Moons",
        alternateName: "Twin Destinies",
        shape: "Two overlapping crescent moons in eternal dance",
        season: "equinox", // Special: appears only during equinoxes
        seasonCategory: "special",
        symbolism: "Duality, balance, difficult choices, twin fates",
        direction: "Zenith",
        coordinates: { x: 50, y: 10, direction: "zenith", elevation: "high" },
        currentAlignment: "Appears only when day and night are in perfect balance",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Only visible during spring and autumn equinoxes; guides difficult decisions",
        mythicResonance: "duality",
        navigationValue: 5, // Extremely valuable when visible
        magicalIntensity: 5,
        movementType: "mystical"
    },
    {
        id: 18,
        name: "The Mask Twins",
        alternateName: "Truth and Lies",
        shape: "Two mirrored masks—one upright showing joy, one inverted showing sorrow",
        season: "solstice", // Special: appears only during solstices
        seasonCategory: "special",
        symbolism: "Hidden truth, revealed secrets, the duality of all things",
        direction: "Variable",
        coordinates: { x: 65, y: 45, direction: "variable", elevation: "mid" },
        currentAlignment: "Positions shift to reveal hidden truths",
        emotionalTriggers: ["revelation"],
        visibility: "visible",
        specialEffects: "Most vivid during moments of deception or truth revelation",
        mythicResonance: "duality",
        navigationValue: 3,
        magicalIntensity: 5,
        movementType: "chaotic"
    },
    {
        id: 19,
        name: "The Dreaming Head",
        alternateName: "Prophet's Vision",
        shape: "A serene head with closed eyes and flowing hair made of stardust",
        season: "eclipse", // Special: appears only during eclipses
        seasonCategory: "special",
        symbolism: "Prophecy, dreams made manifest, the veil between worlds",
        direction: "South",
        coordinates: { x: 45, y: 85, direction: "south", elevation: "low" },
        currentAlignment: "Sleeps until the stars align for prophecy",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Eyes open only during eclipses; visions flow like stardust",
        mythicResonance: "prophecy",
        navigationValue: 1, // Unreliable timing
        magicalIntensity: 5,
        movementType: "mystical"
    },
    {
        id: 20,
        name: "The Antler Tree",
        alternateName: "Season's Crown",
        shape: "A tree-like figure with branches that form intricate antler patterns",
        season: "seasonal-transition", // Special: appears during season changes
        seasonCategory: "special",
        symbolism: "Natural cycles, wisdom of the seasons, growth and renewal",
        direction: "Northwest",
        coordinates: { x: 20, y: 35, direction: "northwest", elevation: "high" },
        currentAlignment: "Branches shift to match the incoming season",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Antlers change pattern with each season; strongest during transitions",
        mythicResonance: "wisdom",
        navigationValue: 4,
        magicalIntensity: 3,
        movementType: "mystical"
    },
    
// Insert them before the closing bracket ];

// === ADDITIONAL YEAR-ROUND CONSTELLATIONS ===
    {
        id: 21,
        name: "The Clockwork Phoenix",
        alternateName: "Eternal Cycle",
        shape: "A mechanical bird with gears for feathers, wings spread in perpetual flight",
        season: "year-round",
        seasonCategory: "eternal",
        symbolism: "Rebirth, eternal return, the intersection of magic and mechanism",
        direction: "East",
        coordinates: { x: 90, y: 20, direction: "east", elevation: "high" },
        currentAlignment: "Rises with dawn, sets with dusk, marking the daily cycle",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Gears turn visibly as the hours pass; sparks fly during mechanical failures",
        mythicResonance: "cycles",
        navigationValue: 5,
        magicalIntensity: 4,
        movementType: "mystical"
    },

    {
        id: 22,
        name: "The Weeping Maiden",
        alternateName: "Sorrow's Crown",
        shape: "A kneeling figure with tears that fall as shooting stars",
        season: "year-round", 
        seasonCategory: "eternal",
        symbolism: "Eternal grief, lost love, the beauty in sadness",
        direction: "West",
        coordinates: { x: 10, y: 60, direction: "west", elevation: "mid" },
        currentAlignment: "Always visible to those who have lost someone dear",
        emotionalTriggers: ["mourning"],
        visibility: "visible",
        specialEffects: "Star-tears fall more frequently during times of great loss",
        mythicResonance: "grief",
        navigationValue: 2,
        magicalIntensity: 5,
        movementType: "steady"
    },

    // === ADDITIONAL SPRING CONSTELLATIONS ===
    {
        id: 23,
        name: "The Dancing Sprites",
        alternateName: "Ring of Joy",
        shape: "Seven small figures holding hands in a circular dance",
        season: "spring",
        seasonCategory: "spring",
        symbolism: "Celebration, community, the joy of new life",
        direction: "Southeast",
        coordinates: { x: 60, y: 40, direction: "southeast", elevation: "mid" },
        currentAlignment: "Spins faster during spring festivals and celebrations",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "The ring rotates slowly; music can sometimes be heard on still nights",
        mythicResonance: "joy",
        navigationValue: 3,
        magicalIntensity: 3,
        movementType: "mystical"
    },

    {
        id: 24,
        name: "The Thornbound Crown",
        alternateName: "Price of Power",
        shape: "A regal crown wrapped in thorny vines",
        season: "spring",
        seasonCategory: "spring", 
        symbolism: "Authority earned through suffering, leadership's burden",
        direction: "North",
        coordinates: { x: 40, y: 25, direction: "north", elevation: "high" },
        currentAlignment: "Appears during times of political upheaval in spring",
        emotionalTriggers: ["betrayal"],
        visibility: "visible",
        specialEffects: "Thorns grow longer when rulers abuse their power",
        mythicResonance: "authority",
        navigationValue: 4,
        magicalIntensity: 4,
        movementType: "seasonal"
    },

    {
        id: 25,
        name: "The Butterfly Swarm",
        alternateName: "Change's Herald",
        shape: "Dozens of small butterfly-shaped star clusters in constant motion",
        season: "spring",
        seasonCategory: "spring",
        symbolism: "Transformation, metamorphosis, the beauty of change",
        direction: "Variable",
        coordinates: { x: 55, y: 35, direction: "variable", elevation: "mid" },
        currentAlignment: "Never in the same configuration twice",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Individual butterflies break away and reform in new patterns",
        mythicResonance: "transformation",
        navigationValue: 1,
        magicalIntensity: 3,
        movementType: "chaotic"
    },

    // === ADDITIONAL SUMMER CONSTELLATIONS ===
    {
        id: 26,
        name: "The Forge of Stars",
        alternateName: "Celestial Smithy",
        shape: "An anvil with hammer raised, sparks flying in all directions",
        season: "summer",
        seasonCategory: "summer",
        symbolism: "Creation, craftsmanship, the forging of destiny",
        direction: "South",
        coordinates: { x: 50, y: 70, direction: "south", elevation: "low" },
        currentAlignment: "Burns hottest during the peak of summer",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Sparks fly brighter when great works are being created",
        mythicResonance: "creation",
        navigationValue: 4,
        magicalIntensity: 4,
        movementType: "steady"
    },

    {
        id: 27,
        name: "The Laughing Fool",
        alternateName: "Wisdom's Jest",
        shape: "A capering figure with bells, mouth open in eternal laughter",
        season: "summer",
        seasonCategory: "summer",
        symbolism: "Wisdom through folly, the importance of joy, breaking conventions",
        direction: "Southwest",
        coordinates: { x: 30, y: 65, direction: "southwest", elevation: "mid" },
        currentAlignment: "Dances across the summer sky during festivals",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Bells seem to jingle; appears upside-down to the overly serious",
        mythicResonance: "wisdom",
        navigationValue: 2,
        magicalIntensity: 3,
        movementType: "chaotic"
    },

    {
        id: 28,
        name: "The Merchant's Scale",
        alternateName: "Balance of Worth",
        shape: "A perfectly balanced scale with mysterious weights on each side",
        season: "summer",
        seasonCategory: "summer",
        symbolism: "Fair trade, justice in commerce, the true value of things",
        direction: "East",
        coordinates: { x: 75, y: 50, direction: "east", elevation: "mid" },
        currentAlignment: "Tips toward justice when witnessed by those making deals",
        emotionalTriggers: ["bargain"],
        visibility: "visible",
        specialEffects: "Scale tips based on the fairness of nearby transactions",
        mythicResonance: "justice",
        navigationValue: 4,
        magicalIntensity: 3,
        movementType: "steady"
    },

    {
        id: 29,
        name: "The Honey Hive",
        alternateName: "Summer's Bounty",
        shape: "A hexagonal structure with worker bee stars buzzing around it",
        season: "summer",
        seasonCategory: "summer",
        symbolism: "Industry, cooperation, the sweetness of hard work",
        direction: "Southeast",
        coordinates: { x: 65, y: 55, direction: "southeast", elevation: "mid" },
        currentAlignment: "Busiest during the height of summer productivity",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Bees fly between flowers; hive glows golden during good harvests",
        mythicResonance: "industry",
        navigationValue: 3,
        magicalIntensity: 2,
        movementType: "wandering"
    },

    // === ADDITIONAL AUTUMN CONSTELLATIONS ===
    {
        id: 30,
        name: "The Sleeping Dragon",
        alternateName: "Hoarded Dreams",
        shape: "A massive coiled dragon with one eye perpetually half-open",
        season: "autumn",
        seasonCategory: "autumn",
        symbolism: "Hidden power, accumulated wisdom, the patience of ages",
        direction: "North",
        coordinates: { x: 45, y: 20, direction: "north", elevation: "high" },
        currentAlignment: "Stirs restlessly during times of great change",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Eye opens wider when great treasures are hidden or found",
        mythicResonance: "patience",
        navigationValue: 4,
        magicalIntensity: 5,
        movementType: "mystical"
    },

    {
        id: 31,
        name: "The Harvest Maiden",
        alternateName: "Abundance's Gift", 
        shape: "A woman with arms full of grain sheaves and fruit",
        season: "autumn",
        seasonCategory: "autumn",
        symbolism: "Abundance, gratitude, the fruits of patience",
        direction: "South",
        coordinates: { x: 55, y: 75, direction: "south", elevation: "low" },
        currentAlignment: "Richest during harvest time, dimmer during lean years",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Grain and fruit change based on local harvest conditions",
        mythicResonance: "abundance",
        navigationValue: 3,
        magicalIntensity: 3,
        movementType: "seasonal"
    },

    {
        id: 32,
        name: "The Gilded Mask",
        alternateName: "False Prosperity",
        shape: "An ornate golden mask with hollow eyes",
        season: "autumn",
        seasonCategory: "autumn",
        symbolism: "Deception, false wealth, the danger of greed",
        direction: "West",
        coordinates: { x: 20, y: 55, direction: "west", elevation: "mid" },
        currentAlignment: "Appears during times of economic deception",
        emotionalTriggers: ["betrayal"],
        visibility: "visible",
        specialEffects: "Gold tarnishes when wealth is gained through deception",
        mythicResonance: "deception",
        navigationValue: 2,
        magicalIntensity: 4,
        movementType: "chaotic"
    },

    {
        id: 33,
        name: "The Philosopher's Lamp",
        alternateName: "Seeker's Light",
        shape: "An oil lamp with flame that burns in impossible colors",
        season: "autumn",
        seasonCategory: "autumn",
        symbolism: "Knowledge seeking, illumination of truth, scholarly pursuit",
        direction: "Northeast",
        coordinates: { x: 70, y: 30, direction: "northeast", elevation: "mid" },
        currentAlignment: "Burns brighter during moments of great discovery",
        emotionalTriggers: ["revelation"],
        visibility: "visible",
        specialEffects: "Flame color changes based on the type of knowledge being sought",
        mythicResonance: "knowledge",
        navigationValue: 3,
        magicalIntensity: 4,
        movementType: "steady"
    },

    // === ADDITIONAL WINTER CONSTELLATIONS ===
    {
        id: 34,
        name: "The Frozen Throne",
        alternateName: "Winter's Seat",
        shape: "An ornate throne made entirely of crystalline ice",
        season: "winter",
        seasonCategory: "winter",
        symbolism: "Cold authority, the loneliness of power, crystalline perfection",
        direction: "North",
        coordinates: { x: 35, y: 15, direction: "north", elevation: "high" },
        currentAlignment: "Most visible during the deepest cold",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Ice crystals form and shatter based on the harshness of rule",
        mythicResonance: "authority",
        navigationValue: 4,
        magicalIntensity: 4,
        movementType: "anchor"
    },

    {
        id: 35,
        name: "The Wolf Pack",
        alternateName: "Winter's Hunt",
        shape: "Seven wolves running in formation across the sky",
        season: "winter",
        seasonCategory: "winter",
        symbolism: "Survival, pack loyalty, the strength found in unity",
        direction: "Northwest",
        coordinates: { x: 25, y: 40, direction: "northwest", elevation: "mid" },
        currentAlignment: "Runs fastest during the coldest nights",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Pack spreads out or tightens based on nearby dangers",
        mythicResonance: "unity",
        navigationValue: 4,
        magicalIntensity: 3,
        movementType: "wandering"
    },

    {
        id: 36,
        name: "The Widow's Candle",
        alternateName: "Vigil's End",
        shape: "A single tall candle with wax tears frozen mid-drip",
        season: "winter",
        seasonCategory: "winter",
        symbolism: "Solitary grief, faithfulness beyond death, eternal remembrance",
        direction: "Southwest",
        coordinates: { x: 35, y: 80, direction: "southwest", elevation: "low" },
        currentAlignment: "Burns steadiest on the anniversary of great losses",
        emotionalTriggers: ["mourning"],
        visibility: "visible",
        specialEffects: "Flame gutters in the wind but never dies; wax tears fall as shooting stars",
        mythicResonance: "remembrance",
        navigationValue: 2,
        magicalIntensity: 5,
        movementType: "steady"
    },

    // === ADDITIONAL SPECIAL EVENT CONSTELLATIONS ===
    {
        id: 37,
        name: "The Truth Scales",
        alternateName: "Judgment's Balance",
        shape: "Massive scales that weigh truth against falsehood",
        season: "equinox",
        seasonCategory: "special",
        symbolism: "Perfect justice, the weighing of souls, moral balance",
        direction: "Zenith",
        coordinates: { x: 45, y: 5, direction: "zenith", elevation: "high" },
        currentAlignment: "Appears only when cosmic balance hangs in question",
        emotionalTriggers: ["revelation"],
        visibility: "visible",
        specialEffects: "Scales tip dramatically during moments of great moral choice",
        mythicResonance: "justice",
        navigationValue: 5,
        magicalIntensity: 5,
        movementType: "mystical"
    },

    {
        id: 38,
        name: "The Chaos Star",
        alternateName: "Order's End",
        shape: "An eight-pointed star that constantly shifts and writhes",
        season: "eclipse",
        seasonCategory: "special",
        symbolism: "Pure chaos, the breakdown of order, creative destruction",
        direction: "Variable",
        coordinates: { x: 60, y: 60, direction: "variable", elevation: "variable" },
        currentAlignment: "Never appears in the same place twice",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Points extend and retract randomly; causes nearby constellations to flicker",
        mythicResonance: "chaos",
        navigationValue: 0,
        magicalIntensity: 5,
        movementType: "chaotic"
    },

    {
        id: 39,
        name: "The Binding Chain",
        alternateName: "Fate's Link",
        shape: "An enormous chain that spans from horizon to horizon",
        season: "solstice",
        seasonCategory: "special",
        symbolism: "Fate, binding oaths, the unbreakable connections between souls",
        direction: "East-West",
        coordinates: { x: 50, y: 50, direction: "variable", elevation: "mid" },
        currentAlignment: "Spans the entire sky during moments of great binding",
        emotionalTriggers: ["bargain"],
        visibility: "visible",
        specialEffects: "Individual links glow when oaths are made; chain rattles when bonds are tested",
        mythicResonance: "fate",
        navigationValue: 3,
        magicalIntensity: 5,
        movementType: "mystical"
    },

    {
        id: 40,
        name: "The Phoenix Egg",
        alternateName: "Tomorrow's Promise",
        shape: "A glowing egg surrounded by protective flames",
        season: "seasonal-transition",
        seasonCategory: "special",
        symbolism: "Potential, new beginnings, the promise of rebirth",
        direction: "East",
        coordinates: { x: 80, y: 35, direction: "east", elevation: "mid" },
        currentAlignment: "Glows brightest at the exact moment seasons change",
        emotionalTriggers: [],
        visibility: "visible",
        specialEffects: "Cracks slightly during each seasonal transition; flames change color with the incoming season",
        mythicResonance: "rebirth",
        navigationValue: 4,
        magicalIntensity: 5,
        movementType: "mystical"
    }
];

// Enhanced Season Categories for Non-Overlapping Logic
const SEASON_CATEGORIES = {
    eternal: {
        name: "Eternal Constellations",
        description: "Always visible regardless of season",
        visibility: "always",
        constellations: ["year-round"]
    },
    spring: {
        name: "Spring Constellations", 
        description: "Visible during spring months",
        visibility: "spring-only",
        constellations: ["spring"],
        months: ["late-bloom", "high-spring"]
    },
    summer: {
        name: "Summer Constellations",
        description: "Visible during summer months", 
        visibility: "summer-only",
        constellations: ["summer"],
        months: ["late-summer", "mid-summer"]
    },
    autumn: {
        name: "Autumn Constellations",
        description: "Visible during autumn months",
        visibility: "autumn-only", 
        constellations: ["autumn"],
        months: ["mid-autumn", "late-autumn"]
    },
    winter: {
        name: "Winter Constellations",
        description: "Visible during winter months",
        visibility: "winter-only",
        constellations: ["winter"], 
        months: ["winter", "deep-winter"]
    },
    special: {
        name: "Special Event Constellations",
        description: "Visible only during specific celestial events",
        visibility: "event-only",
        constellations: ["equinox", "solstice", "eclipse", "seasonal-transition"]
    }
};

// Enhanced Seasonal Mapping
const ENHANCED_SEASON_MAP = {
    'all': ['year-round', 'spring', 'summer', 'autumn', 'winter', 'equinox', 'solstice', 'eclipse', 'seasonal-transition'],
    'late-bloom': ['year-round', 'spring'],
    'high-spring': ['year-round', 'spring', 'equinox'],
    'mid-summer': ['year-round', 'summer'],
    'late-summer': ['year-round', 'summer', 'solstice'],
    'mid-autumn': ['year-round', 'autumn', 'equinox'], 
    'late-autumn': ['year-round', 'autumn'],
    'winter': ['year-round', 'winter', 'solstice'],
    'deep-winter': ['year-round', 'winter'],
    'equinox': ['year-round', 'equinox'], // Special filter for equinox-only viewing
    'solstice': ['year-round', 'solstice'], // Special filter for solstice-only viewing
    'eclipse': ['year-round', 'eclipse'] // Special filter for eclipse events
};

// Emotional trigger categories with enhanced descriptions
const ENHANCED_EMOTIONAL_TRIGGERS = {
    MOURNING: {
        key: "mourning",
        name: "Mourning",
        description: "Grief, loss, remembrance of the departed",
        color: "59, 130, 246", // Blue
        intensity: "deep"
    },
    REVELATION: {
        key: "revelation", 
        name: "Revelation",
        description: "Truth unveiled, secrets revealed, sudden understanding",
        color: "251, 191, 36", // Gold
        intensity: "bright"
    },
    BARGAIN: {
        key: "bargain",
        name: "Bargain", 
        description: "Deals struck, fate negotiations, binding agreements",
        color: "34, 197, 94", // Green
        intensity: "steady"
    },
    BETRAYAL: {
        key: "betrayal",
        name: "Betrayal",
        description: "Broken trust, hidden malice, false friendship",
        color: "239, 68, 68", // Red  
        intensity: "harsh"
    }
};

// Movement profile definitions
const CONSTELLATION_MOVEMENT_PROFILES = {
    // Anchor stars - never move
    "anchor": {
        orbitalSpeed: 0,
        rotationSpeed: 0,
        randomFactor: 0,
        description: "Navigation anchors that never move"
    },
    
    // Steady movers - predictable movement
    "steady": {
        orbitalSpeed: 1.0,
        rotationSpeed: 1.0,
        randomFactor: 0.1,
        description: "Reliable, predictable celestial movement"
    },
    
    // Wandering stars - more random movement
    "wandering": {
        orbitalSpeed: 1.3,
        rotationSpeed: 1.2,
        randomFactor: 0.4,
        description: "Gentle wandering across the sky"
    },
    
    // Chaotic movers - highly unpredictable
    "chaotic": {
        orbitalSpeed: 1.5,
        rotationSpeed: 1.8,
        randomFactor: 0.6,
        description: "Erratic, unpredictable movement"
    },
    
    // Seasonal shifters - movement varies by season
    "seasonal": {
        orbitalSpeed: 1.1,
        rotationSpeed: 0.9,
        randomFactor: 0.3,
        description: "Movement changes with the seasons"
    },
    
    // Mystical drifters - smooth, ethereal movement
    "mystical": {
        orbitalSpeed: 0.8,
        rotationSpeed: 1.4,
        randomFactor: 0.2,
        description: "Ethereal, otherworldly movement patterns"
    }
};

// Function to get movement profile for a constellation
function getMovementProfile(constellationName) {
    // Find constellation data
    const constellation = ENHANCED_CONSTELLATIONS.find(c => c.name === constellationName);
    
    if (constellation && constellation.movementType) {
        const profile = CONSTELLATION_MOVEMENT_PROFILES[constellation.movementType];
        if (profile) {
            return { ...profile, type: constellation.movementType };
        }
    }
    
    // Default profile for unlisted constellations
    return {
        orbitalSpeed: 1.0,
        rotationSpeed: 1.0,
        randomFactor: 0.25,
        type: "default",
        description: "Standard celestial movement"
    };
}

// State persistence utilities
const StarMapState = {
    save: function(state) {
        const stateData = {
            viewState: state.viewState,
            filters: state.filters,
            displayOptions: state.displayOptions,
            timestamp: Date.now()
        };
        sessionStorage.setItem('starmap_state', JSON.stringify(stateData));
    },
    
    load: function() {
        try {
            const saved = sessionStorage.getItem('starmap_state');
            if (saved) {
                const data = JSON.parse(saved);
                // Only load if saved within last hour to prevent stale state
                if (Date.now() - data.timestamp < 3600000) {
                    return data;
                }
            }
        } catch (e) {
            console.warn('Failed to load saved state:', e);
        }
        return null;
    },
    
    clear: function() {
        sessionStorage.removeItem('starmap_state');
    }
};

// Enhanced constellation filtering logic with movement awareness
const ConstellationFilter = {
    bySeasonEnhanced: function(constellations, selectedSeason) {
        const validSeasons = ENHANCED_SEASON_MAP[selectedSeason] || [selectedSeason];
        
        return constellations.filter(constellation => {
            // Year-round constellations always show
            if (constellation.season === 'year-round') {
                return true;
            }
            
            // Check if constellation's season matches any valid season
            return validSeasons.includes(constellation.season);
        });
    },
    
    byEmotionalTriggers: function(constellations, activeEmotions) {
        if (activeEmotions.length === 0) {
            return constellations; // Show all if no emotional filters active
        }
        
        return constellations.filter(constellation => {
            // Always show constellations with no triggers
            if (constellation.emotionalTriggers.length === 0) {
                return true;
            }
            
            // Show if any trigger matches active emotions
            return constellation.emotionalTriggers.some(trigger => 
                activeEmotions.includes(trigger.toLowerCase())
            );
        });
    },
    
    byTimeOfNight: function(constellations, hour) {
        return constellations.filter(constellation => {
            // Anchor constellations are always visible
            if (constellation.movementType === "anchor") {
                return true;
            }
            
            // Special timing for special constellations
            switch (constellation.season) {
                case 'eclipse':
                    return hour >= 0 && hour <= 24; // Always visible during eclipse events
                case 'equinox':
                    return hour >= 6 && hour <= 18; // Daylight hours during equinox
                case 'solstice':
                    return (hour >= 20 || hour <= 6); // Extended evening/early morning for solstice
                case 'seasonal-transition':
                    // Visible during transition times (dawn/dusk)
                    return (hour >= 5 && hour <= 8) || (hour >= 18 && hour <= 21);
                default:
                    // Most constellations have enhanced visibility windows
                    return this.getVisibilityByMagicalIntensity(constellation, hour);
            }
        });
    },
    
    // New method to determine visibility based on magical intensity
    getVisibilityByMagicalIntensity: function(constellation, hour) {
    const intensity = constellation.magicalIntensity || 3;
    
    if (intensity >= 4) {
        // High magical intensity - visible most of the time
        return hour >= 12 || hour <= 10;
    } else if (intensity >= 3) {
        // Medium intensity - visible during evening/night/morning
        return hour >= 15 || hour <= 7;
    } else if (intensity >= 2) {
        // Lower intensity - visible during darker hours
        return hour >= 20 || hour <= 5;
    } else {
        // Very low intensity - visible during deepest night
        return hour >= 22 || hour <= 3;
    }
}
};

// Export for use in web application
if (typeof window !== 'undefined') {
    window.EnhancedConstellationData = { 
        CONSTELLATIONS: ENHANCED_CONSTELLATIONS,
        SEASON_CATEGORIES,
        SEASON_MAP: ENHANCED_SEASON_MAP,
        EMOTIONAL_TRIGGERS: ENHANCED_EMOTIONAL_TRIGGERS,
        CONSTELLATION_MOVEMENT_PROFILES,
        getMovementProfile,
        StarMapState,
        ConstellationFilter
    };
}
