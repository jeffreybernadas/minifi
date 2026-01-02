/**
 * Fun loading quotes displayed during redirect
 * Each quote has text and an emoji
 */
export const LOADING_QUOTES = [
	// Tech & Internet themed
	{ text: "Warming up the teleporter...", emoji: "🚀" },
	{ text: "Asking the internet for directions...", emoji: "🗺️" },
	{ text: "Untangling the URL spaghetti...", emoji: "🍝" },
	{ text: "Convincing electrons to move faster...", emoji: "⚡" },
	{ text: "Bribing the server hamsters...", emoji: "🐹" },
	{ text: "Calculating the shortest route...", emoji: "📐" },
	{ text: "Polishing the redirect button...", emoji: "✨" },
	{ text: "Teaching bits to fly...", emoji: "🦅" },
	{ text: "Negotiating with the firewall...", emoji: "🔥" },
	{ text: "Waking up the link fairies...", emoji: "🧚" },
	{ text: "Consulting the URL oracle...", emoji: "🔮" },
	{ text: "Inflating the data balloons...", emoji: "🎈" },
	{ text: "Assembling the redirect squad...", emoji: "🦸" },
	{ text: "Dusting off the hyperlinks...", emoji: "🧹" },
	{ text: "Charging the quantum tunneler...", emoji: "⚛️" },

	// Space & Science themed
	{ text: "Aligning the satellite dish...", emoji: "📡" },
	{ text: "Engaging warp drive...", emoji: "🌌" },
	{ text: "Calibrating the flux capacitor...", emoji: "⏰" },
	{ text: "Asking NASA for coordinates...", emoji: "🛸" },
	{ text: "Launching into hyperspace...", emoji: "🚀" },
	{ text: "Bending space-time slightly...", emoji: "🌀" },
	{ text: "Summoning the internet spirits...", emoji: "👻" },
	{ text: "Activating ludicrous speed...", emoji: "💨" },
	{ text: "Consulting the algorithm gods...", emoji: "🙏" },
	{ text: "Spinning up the quantum computer...", emoji: "💻" },

	// Animal themed
	{ text: "Herding digital cats...", emoji: "🐱" },
	{ text: "Teaching pigeons to carry packets...", emoji: "🐦" },
	{ text: "Waking up the server dogs...", emoji: "🐕" },
	{ text: "Asking the wise owl for directions...", emoji: "🦉" },
	{ text: "Racing with the internet turtle...", emoji: "🐢" },
	{ text: "Following the white rabbit...", emoji: "🐰" },
	{ text: "Convincing the sloth to hurry...", emoji: "🦥" },
	{ text: "Deploying carrier pigeons...", emoji: "🕊️" },

	// Food & Drink themed
	{ text: "Brewing some fresh data...", emoji: "☕" },
	{ text: "Cooking up your destination...", emoji: "👨‍🍳" },
	{ text: "Adding a pinch of magic...", emoji: "🧂" },
	{ text: "Stirring the URL soup...", emoji: "🥣" },
	{ text: "Letting the links marinate...", emoji: "🍖" },
	{ text: "Preparing your digital meal...", emoji: "🍽️" },

	// Magic & Fantasy themed
	{ text: "Casting the redirect spell...", emoji: "🪄" },
	{ text: "Consulting the magic 8-ball...", emoji: "🎱" },
	{ text: "Summoning the portal wizard...", emoji: "🧙" },
	{ text: "Sprinkling redirect dust...", emoji: "✨" },
	{ text: "Opening the magic portal...", emoji: "🌀" },
	{ text: "Awakening the ancient servers...", emoji: "🏛️" },
	{ text: "Reading the digital tea leaves...", emoji: "🍵" },
	{ text: "Consulting the crystal ball...", emoji: "🔮" },

	// Sports & Games themed
	{ text: "Doing some URL gymnastics...", emoji: "🤸" },
	{ text: "Running the redirect marathon...", emoji: "🏃" },
	{ text: "Scoring the winning redirect...", emoji: "⚽" },
	{ text: "Rolling the dice of destiny...", emoji: "🎲" },
	{ text: "Playing connect the links...", emoji: "🔗" },
	{ text: "Speedrunning to your destination...", emoji: "🎮" },

	// Music & Arts themed
	{ text: "Composing the redirect symphony...", emoji: "🎵" },
	{ text: "Painting your path forward...", emoji: "🎨" },
	{ text: "Dancing through the network...", emoji: "💃" },
	{ text: "Conducting the data orchestra...", emoji: "🎼" },

	// Weather & Nature themed
	{ text: "Surfing the data waves...", emoji: "🏄" },
	{ text: "Riding the digital wind...", emoji: "🌊" },
	{ text: "Growing your connection...", emoji: "🌱" },
	{ text: "Catching the redirect lightning...", emoji: "⚡" },
	{ text: "Navigating through the cloud...", emoji: "☁️" },

	// Miscellaneous fun
	{ text: "Asking Siri for help...", emoji: "📱" },
	{ text: "Googling the answer...", emoji: "🔍" },
	{ text: "Checking under the couch cushions...", emoji: "🛋️" },
	{ text: "Pressing all the right buttons...", emoji: "🔘" },
	{ text: "Turning it off and on again...", emoji: "🔄" },
	{ text: "Downloading more RAM...", emoji: "💾" },
	{ text: "Updating Adobe Reader...", emoji: "📄" },
	{ text: "Closing unnecessary tabs...", emoji: "🗂️" },
	{ text: "Clearing the browser cache...", emoji: "🧊" },
	{ text: "Rebooting the mainframe...", emoji: "🖥️" },
	{ text: "Defragmenting the internet...", emoji: "🧩" },
	{ text: "Optimizing the redirect algorithm...", emoji: "📊" },
	{ text: "Establishing secure connection...", emoji: "🔐" },
	{ text: "Pinging the mothership...", emoji: "🛰️" },
	{ text: "Compiling your destination...", emoji: "⚙️" },
	{ text: "Decrypting the secret path...", emoji: "🔓" },
	{ text: "Handshaking with the server...", emoji: "🤝" },
	{ text: "Verifying your awesomeness...", emoji: "😎" },
	{ text: "Almost there, promise...", emoji: "🤞" },
	{ text: "Loading... loading... still loading...", emoji: "⏳" },
] as const;

export type LoadingQuote = (typeof LOADING_QUOTES)[number];

/**
 * Get a random loading quote
 */
export function getRandomLoadingQuote(): LoadingQuote {
	return LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)];
}
