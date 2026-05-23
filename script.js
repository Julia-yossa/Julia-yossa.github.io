document.addEventListener('DOMContentLoaded', () => {

    // --- LIVE CLOCK ---
    const clockEl = document.getElementById('live-clock');
    if (clockEl) {
        function updateClock() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = `${h}:${m}:${s}`;
        }
        setInterval(updateClock, 1000);
        updateClock();
    }

    // --- THEME TOGGLE ---
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    // --- SMOOTH SCROLLING FOR NAVIGATION LINKS ---
    // Selects all anchor links that start with '#' and adds a click event listener.
    // On click, it prevents the default jump and smoothly scrolls to the target section.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            // Close mobile menu on link click
            const mobileMenu = document.getElementById('mobile-menu');
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // --- LANGUAGE TOGGLE FUNCTIONALITY ---
    // Handles switching the website's language between English and French.
    const langToggle = document.getElementById('lang-toggle');
    const aboutEn = document.getElementById('about-en');
    const aboutFr = document.getElementById('about-fr');
    const initialLangParam = new URLSearchParams(window.location.search).get('lang');
    let currentLang = initialLangParam === 'fr' ? 'fr' : 'en';
    document.documentElement.lang = currentLang;

    langToggle.addEventListener('click', () => {
        // Determine the new language
        currentLang = currentLang === 'en' ? 'fr' : 'en';
        // Set the lang attribute on the HTML element for accessibility
        document.documentElement.lang = currentLang;

        // Toggle visibility of the bilingual 'About Me' sections when present
        if (aboutEn && aboutFr) {
            aboutEn.classList.toggle('hidden');
            aboutFr.classList.toggle('hidden');
        }

        // Translate all elements with data-lang attributes
        const elementsToTranslate = document.querySelectorAll('[data-lang-en]');
        elementsToTranslate.forEach(el => {
            // Skip elements that have the 'data-no-translate' attribute
            if (el.hasAttribute('data-no-translate')) {
                return;
            }

            const text = el.getAttribute(`data-lang-${currentLang}`);
            if (text) {
                // Handle form inputs and textareas differently from other elements
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else {
                    el.innerText = text;
                }
            }
        });

        // Reload blog posts if on blog page
        if (blogPostsContainer) {
            loadBlogPosts();
        }

        if (postContent) {
            syncLanguageQueryParam();
            loadPostDetail();
        }

        // Restart typing animation on pages that include the typing element
        if (typingElement) {
            restartTypingAnimation();
        }
    });

    // --- MOBILE MENU TOGGLE ---
    // Handles the opening and closing of the mobile navigation menu.
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });



    // --- TYPING ANIMATION ---
    const englishTitles = ['Infrastructure Analyst', 'Data Analyst', 'Cybersecurity Analyst', 'AI Engineer', 'IT Project Manager'];
    const frenchTitles = ['Analyste TI', 'Analyste de Données', 'Analyste en Cybersécurité', 'Ingénieure en IA', 'Gestionnaire de Projet TI'];
    
    let activeTitles = englishTitles; // Default to English
    const typingElement = document.getElementById('typing-text');
    let titleIndex = 0;
    let charIndex = 0;
    let typingTimeout;
    let erasingTimeout;

    const TYPING_SPEED = 100; // ms per character
    const DELETING_SPEED = 50; // ms per character
    const HOLD_TIME = 2000; // 2 seconds

    // Attach the cursor class initially
    if (typingElement) {
        typingElement.classList.add('typing-cursor');
    }

    function type() {
        const currentTitle = activeTitles[titleIndex];
        if (charIndex < currentTitle.length) {
            typingElement.textContent += currentTitle.charAt(charIndex);
            charIndex++;
            typingTimeout = setTimeout(type, TYPING_SPEED);
        } else {
            // Text is fully typed, now wait and then delete
            erasingTimeout = setTimeout(erase, HOLD_TIME);
        }
    }

    function erase() {
        const currentTitle = activeTitles[titleIndex];
        if (charIndex > 0) {
            typingElement.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            erasingTimeout = setTimeout(erase, DELETING_SPEED);
        } else {
            // Text is fully erased, move to the next title
            titleIndex = (titleIndex + 1) % activeTitles.length; // Cycle through titles
            charIndex = 0; // Reset character index for the next title
            typingTimeout = setTimeout(type, TYPING_SPEED); // Start typing the next title
        }
    }

    function restartTypingAnimation() {
        // Clear any ongoing timeouts
        clearTimeout(typingTimeout);
        clearTimeout(erasingTimeout);

        // Set active titles based on current language
        activeTitles = (currentLang === 'en') ? englishTitles : frenchTitles;
        
        // Reset animation state
        titleIndex = 0;
        charIndex = 0;
        typingElement.textContent = ''; // Clear current text
        
        // Start typing the first title of the new language
        type();
    }

    // Initial start of the animation
    if (typingElement) {
        restartTypingAnimation();
    }

    // --- BLOG NAVIGATION / DETAIL PAGE ---
    const postImage = document.getElementById('post-image');
    const postTitle = document.getElementById('post-title');
    const postDate = document.getElementById('post-date');
    const postContent = document.getElementById('post-content');
    const postError = document.getElementById('post-error');

    // --- LOAD BLOG POSTS FOR BLOG PAGE ---
    const fallbackPosts = [
        {
            image: "https://picsum.photos/seed/artai-web/600/400",
            titleEn: "A Social Web Project: Art and Artificial Intelligence",
            titleFr: "Un projet sur le Web social : Art et Intelligence Artificielle",
            dateEn: "Published on May 23, 2026",
            dateFr: "Publié le 23 mai 2026",
            excerptEn: "An analysis of visibility, user engagement, and key factors in running a social web initiative on the theme of art and AI.",
            excerptFr: "Une analyse de la visibilité, de l'engagement des usagers et des facteurs clés d'une initiative sur le Web social autour de l'art et de l'IA.",
            fullContentEn: `<p class='mb-4 italic text-text-main-light dark:text-text-main-dark border-l-2 border-border-light dark:border-border-dark pl-4'>In April, I began an activity linked to my course on the social web. The goal was to explore the social web, create an initiative, and communicate around it in order to understand the impact of my communications on its visibility.</p><div class='flex flex-wrap gap-2 mb-6'><span class='px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'>#INF6107</span><span class='px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700'>#ActivitesB</span></div><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>the initiative</p><h3 class='text-3xl font-bold'>Art and AI — A Gallery</h3><p class='text-text-main-light dark:text-text-main-dark'>The theme I chose for this activity is the use of code and AI in design and computer-assisted art. My initiative took several forms, but it is primarily a gallery that brings together various creations and creators who contribute, in one way or another, to computer-aided art. The initiative can be found at <a href='https://julia-yossa.github.io/art-ai.html' target='_blank' class='text-indigo-500 hover:underline'>julia-yossa.github.io/art-ai.html</a>, as an extension of my personal page. It went through several iterations to remain focused and properly represent a gallery or platform for creators. This page was created with the assistance of artificial intelligence, but the original idea and the choice of how to represent the information are my own. It includes links to profiles and creations of other people, as well as their names and a very brief summary of what interested me.</p></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>strategy</p><h3 class='text-3xl font-bold'>Acquisition Channels and Communication</h3><p class='text-text-main-light dark:text-text-main-dark'>For the visibility of my initiative, I undertook a few actions that consisted of using my existing online presence to communicate about the initiative. My presence on platforms such as X and LinkedIn served as communication tools to disseminate the project. I also joined various groups on art through code and AI on Facebook and LinkedIn to communicate there.</p><p class='text-text-main-light dark:text-text-main-dark'>The Analytics tool was used to gather popularity statistics for my initiative. By analyzing my efforts, I noticed a major difference in engagement depending on the channels used:</p><div class='overflow-x-auto rounded-xl border border-border-light dark:border-border-dark my-4'><table class='w-full text-sm text-left'><thead class='bg-card-light dark:bg-card-dark text-text-muted-light dark:text-text-muted-dark'><tr><th class='px-4 py-3 font-semibold'>Communication Channel</th><th class='px-4 py-3 font-semibold text-center'>Visits Generated</th><th class='px-4 py-3 font-semibold'>Observation</th></tr></thead><tbody class='divide-y divide-border-light dark:divide-border-dark'><tr class='bg-base-light dark:bg-base-dark'><td class='px-4 py-3 font-medium'><strong>Personal pages &amp; profiles</strong> (LinkedIn / X)</td><td class='px-4 py-3 text-center font-bold text-indigo-500'>30 visits</td><td class='px-4 py-3'>Most effective initial communication. My direct presence was the most important referrer.</td></tr><tr class='bg-card-light dark:bg-card-dark'><td class='px-4 py-3 font-medium'><strong>Specialized groups</strong> (Facebook / LinkedIn)</td><td class='px-4 py-3 text-center font-bold text-indigo-500'>7 visits</td><td class='px-4 py-3'>Lower impact. Posts were made at different dates, showing weaker direct receptivity.</td></tr></tbody></table></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>behaviour</p><h3 class='text-3xl font-bold'>User Engagement</h3><p class='text-text-main-light dark:text-text-main-dark'>In total, I had <strong>37 distinct users</strong> who connected and explored the platform for a combined total of <strong>311 events</strong>, including visits leading to other links available on the page.</p><div class='grid grid-cols-1 md:grid-cols-2 gap-4 my-4'><div class='rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-2'>Average Engagement Duration</p><p class='text-2xl font-bold'>1.13 min</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-2'>Spillover Effect</p><p class='text-sm text-text-main-light dark:text-text-main-dark'>Visits to the initiative positively contributed to the visibility of other sections of my site, including my personal site and blog.</p></div></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>geographic origin</p><h3 class='text-3xl font-bold'>Geographic Distribution and Anomaly Analysis</h3><p class='text-text-main-light dark:text-text-main-dark'>In terms of user origin, the majority are in Canada and the United States, followed by a global spread:</p><div class='overflow-x-auto rounded-xl border border-border-light dark:border-border-dark my-4'><table class='w-full text-sm text-left'><thead class='bg-card-light dark:bg-card-dark text-text-muted-light dark:text-text-muted-dark'><tr><th class='px-4 py-3 font-semibold'>Country of Origin</th><th class='px-4 py-3 font-semibold text-center'>Unique Users</th><th class='px-4 py-3 font-semibold'>Observed Behaviour</th></tr></thead><tbody class='divide-y divide-border-light dark:divide-border-dark'><tr class='bg-base-light dark:bg-base-dark'><td class='px-4 py-3'>Canada and United States</td><td class='px-4 py-3 text-center font-bold'>13</td><td class='px-4 py-3'>Majority of users, smooth navigation.</td></tr><tr class='bg-card-light dark:bg-card-dark'><td class='px-4 py-3'>United Kingdom</td><td class='px-4 py-3 text-center font-bold'>2</td><td class='px-4 py-3'>Active unique visitors.</td></tr><tr class='bg-base-light dark:bg-base-dark'><td class='px-4 py-3'>Cameroon, Germany, France, India, Indonesia, Russia, Monaco</td><td class='px-4 py-3 text-center font-bold'>1 each</td><td class='px-4 py-3'>1 unique user per region.</td></tr></tbody></table></div><blockquote class='rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 my-4'><p class='text-xs font-semibold text-amber-500 mb-2 uppercase tracking-widest'>Critical Analysis — Technical Anomaly</p><p class='text-text-main-light dark:text-text-main-dark text-sm'>I received private feedback from Cameroon indicating that the initiative page was inaccessible to most users there. Thanks to the exhaustive Analytics data, I know that despite having a user recorded in certain countries, they show <strong>0 seconds of engagement</strong> for the most part. This appears to be directly linked to the unavailability I mentioned. The direct cause of this problem is not yet clear and will be the subject of a separate investigation.</p></blockquote></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>key factors</p><h3 class='text-3xl font-bold'>Factors Influencing Visibility</h3><div class='space-y-4 text-text-main-light dark:text-text-main-dark'><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3 font-semibold'>01</span><strong>The choice of initiative itself:</strong> It directly determines the audience it will receive — in this case, a niche audience interested in code and computer art.</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3 font-semibold'>02</span><strong>The author's current influence:</strong> My personal influence and starting network determine the audience and the reach of the communication.</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3 font-semibold'>03</span><strong>Communication frequency:</strong> The only moments when I had new events were moments when communication had been relaunched. Not communicating frequently about an initiative negatively influences it.</p></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>conclusions</p><h3 class='text-3xl font-bold'>What This Taught Me</h3><blockquote class='rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 italic'>My personal influence greatly determines the initial visibility of my initiatives. Furthermore, continuous communication is essential, as it maintains the connection and user interest in my initiative.</blockquote></section>`,
            fullContentFr: `<p class='mb-4 italic text-text-main-light dark:text-text-main-dark border-l-2 border-border-light dark:border-border-dark pl-4'>En avril, j'ai entamé une activité en lien avec mon cours sur le Web social. Il était question pour moi d'explorer le Web social, de créer une initiative et de communiquer autour de celle-ci pour comprendre l'impact de mes communications sur sa visibilité.</p><div class='flex flex-wrap gap-2 mb-6'><span class='px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'>#INF6107</span><span class='px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700'>#ActivitesB</span></div><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>l'initiative</p><h3 class='text-3xl font-bold'>Art et IA — Une Galerie</h3><p class='text-text-main-light dark:text-text-main-dark'>Le thème que j'ai choisi pour cette activité est l'usage du code et de l'IA dans le design et l'art assisté par ordinateur. Mon initiative a pris plusieurs formes, mais elle est plutôt une galerie qui regroupe diverses créations et des créateurs qui contribuent, d'une manière ou d'une autre, à l'art aidé par ordinateur. L'initiative se trouve sur le lien suivant : <a href='https://julia-yossa.github.io/art-ai.html' target='_blank' class='text-indigo-500 hover:underline'>julia-yossa.github.io/art-ai.html</a>, comme une extension de ma page personnelle. Elle a eu à passer par plusieurs modifications pour rester directe et bien représenter une galerie ou une plateforme pour des créateurs. Cette page a été créée avec l'assistance de l'intelligence artificielle, mais l'idée originale et le choix de la représentation des informations sont les miens. Elle inclut des liens vers des profils et des créations d'autres personnes, ainsi que leurs noms et un très bref résumé de ce qui m'a intéressé.</p></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>stratégie</p><h3 class='text-3xl font-bold'>Acquisition et canaux de communication</h3><p class='text-text-main-light dark:text-text-main-dark'>Pour la visibilité de mon initiative, j'ai entrepris quelques actions qui consistaient à user de ma présence actuelle en ligne pour communiquer sur l'initiative. Ma présence sur des plateformes comme X et LinkedIn a servi d'outil de communication pour diffuser mon projet. Aussi, j'ai rejoint divers groupes d'art grâce au code et à l'IA sur Facebook et LinkedIn pour y communiquer.</p><p class='text-text-main-light dark:text-text-main-dark'>L'outil Analytics a été utilisé pour recueillir les statistiques de popularité sur mon initiative. En analysant mes démarches, j'ai remarqué une différence majeure d'engagement selon les canaux utilisés :</p><div class='overflow-x-auto rounded-xl border border-border-light dark:border-border-dark my-4'><table class='w-full text-sm text-left'><thead class='bg-card-light dark:bg-card-dark text-text-muted-light dark:text-text-muted-dark'><tr><th class='px-4 py-3 font-semibold'>Canal de communication choisi</th><th class='px-4 py-3 font-semibold text-center'>Visites générées</th><th class='px-4 py-3 font-semibold'>Observation sur l'impact</th></tr></thead><tbody class='divide-y divide-border-light dark:divide-border-dark'><tr class='bg-base-light dark:bg-base-dark'><td class='px-4 py-3 font-medium'><strong>Pages et profils personnels</strong> (LinkedIn / X)</td><td class='px-4 py-3 text-center font-bold text-indigo-500'>30 visites</td><td class='px-4 py-3'>Communication initiale la plus performante. Ma présence directe a été le référent le plus important.</td></tr><tr class='bg-card-light dark:bg-card-dark'><td class='px-4 py-3 font-medium'><strong>Groupes spécialisés</strong> (Facebook / LinkedIn)</td><td class='px-4 py-3 text-center font-bold text-indigo-500'>7 visites</td><td class='px-4 py-3'>Impact plus faible. Ces publications ont été faites à des dates différentes, démontrant une moins bonne réceptivité directe.</td></tr></tbody></table></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>comportement</p><h3 class='text-3xl font-bold'>Engagement des utilisateurs</h3><p class='text-text-main-light dark:text-text-main-dark'>Au total, j'ai eu <strong>37 usagers distincts</strong> qui se sont connectés et ont exploré la plateforme pour un ensemble de <strong>311 événements</strong>, incluant des visites menant à d'autres liens disponibles sur la page.</p><div class='grid grid-cols-1 md:grid-cols-2 gap-4 my-4'><div class='rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-2'>Durée d'engagement moyenne</p><p class='text-2xl font-bold'>1,13 min</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-2'>Effet de débordement (Spillover)</p><p class='text-sm text-text-main-light dark:text-text-main-dark'>Les visites sur mon initiative ont positivement contribué à la visibilité d'autres sections de mon site, incluant mon site personnel et mon blogue.</p></div></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>provenance géographique</p><h3 class='text-3xl font-bold'>Provenance géographique et analyse des anomalies</h3><p class='text-text-main-light dark:text-text-main-dark'>En matière de provenance des utilisateurs, la majorité se situe au Canada et aux États-Unis, suivis d'une dispersion globale :</p><div class='overflow-x-auto rounded-xl border border-border-light dark:border-border-dark my-4'><table class='w-full text-sm text-left'><thead class='bg-card-light dark:bg-card-dark text-text-muted-light dark:text-text-muted-dark'><tr><th class='px-4 py-3 font-semibold'>Pays de provenance</th><th class='px-4 py-3 font-semibold text-center'>Usagers uniques</th><th class='px-4 py-3 font-semibold'>Comportement et engagement</th></tr></thead><tbody class='divide-y divide-border-light dark:divide-border-dark'><tr class='bg-base-light dark:bg-base-dark'><td class='px-4 py-3'>Canada et États-Unis</td><td class='px-4 py-3 text-center font-bold'>13</td><td class='px-4 py-3'>Majorité des usagers, navigation fluide.</td></tr><tr class='bg-card-light dark:bg-card-dark'><td class='px-4 py-3'>Royaume-Uni</td><td class='px-4 py-3 text-center font-bold'>2</td><td class='px-4 py-3'>Visiteurs uniques actifs.</td></tr><tr class='bg-base-light dark:bg-base-dark'><td class='px-4 py-3'>Cameroun, Allemagne, France, Inde, Indonésie, Russie, Monaco</td><td class='px-4 py-3 text-center font-bold'>1 par pays</td><td class='px-4 py-3'>1 utilisateur unique par région.</td></tr></tbody></table></div><blockquote class='rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 my-4'><p class='text-xs font-semibold text-amber-500 mb-2 uppercase tracking-widest'>Analyse critique d'une anomalie technique</p><p class='text-text-main-light dark:text-text-main-dark text-sm'>J'ai eu un retour privé du Cameroun indiquant que la page de mon initiative n'y était pas accessible pour la plupart. Grâce aux données exhaustive d'Analytics, je sais que malgré le fait que j'ai eu un usager dans certains pays, ils affichent <strong>0 seconde d'engagement</strong> pour la plupart. Cela semble directement lié à l'indisponibilité que j'ai mentionnée plus haut. La cause directe de ce problème n'est pas encore claire et cela sera l'objet d'une enquête différente de celle-ci.</p></blockquote></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>facteurs clés</p><h3 class='text-3xl font-bold'>Les facteurs influençant la visibilité</h3><div class='space-y-4 text-text-main-light dark:text-text-main-dark'><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3 font-semibold'>01</span><strong>Le choix de l'initiative en lui-même :</strong> Il détermine directement l'audience qu'elle recevra (un public de niche intéressé par le code et l'art par ordinateur).</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3 font-semibold'>02</span><strong>L'influence actuelle de l'auteur :</strong> Mon influence personnelle et mon réseau de départ déterminent l'audience et la portée de la communication.</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3 font-semibold'>03</span><strong>La fréquence de communication :</strong> Les seuls moments où j'avais de nouveaux événements étaient des moments où la communication avait été relancée. Ne pas communiquer fréquemment sur une initiative influence négativement celle-ci.</p></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>conclusions</p><h3 class='text-3xl font-bold'>Ce que cette activité m'a appris</h3><blockquote class='rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 italic'>Mon influence personnelle détermine grandement la visibilité initiale de mes initiatives. De plus, la communication continue est essentielle, car elle permet de maintenir le lien et l'intérêt des utilisateurs envers mon initiative.</blockquote></section>`
        },
        {
            image: 'https://picsum.photos/seed/blog1/600/400',
            titleEn: 'Understanding Zero Trust',
            titleFr: 'Comprendre le Zero Trust',
            dateEn: 'Published on November 8, 2025',
            dateFr: 'Publie le 8 novembre 2025',
            excerptEn: 'Zero Trust is a mindset built around verification, least privilege, and resilient system design.',
            excerptFr: "Le Zero Trust est un etat d'esprit fonde sur la verification, le moindre privilege et une conception resiliente des systemes.",
            fullContentEn: `<p class='mb-4 italic text-text-main-light dark:text-text-main-dark border-l-2 border-border-light dark:border-border-dark pl-4'>Zero Trust is not a product you buy or a setting you switch on. It is a mindset: assume nothing is safe, verify everything, and build systems that hold up even when something goes wrong.</p><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>core principles</p><h3 class='text-3xl font-bold'>Three ideas that underpin everything</h3><p class='text-text-main-light dark:text-text-main-dark'>Zero Trust rejects the old perimeter model, where being inside the network meant being trusted. In its place, three principles govern every access decision.</p><div class='grid grid-cols-1 md:grid-cols-3 gap-4'><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-3'>01</p><h4 class='font-semibold mb-2'>Verify explicitly</h4><p>Authenticate and authorize every request based on identity, device health, and context. No free passes.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-3'>02</p><h4 class='font-semibold mb-2'>Least privilege</h4><p>Grant the minimum access needed, nothing more. Scope creep is a vulnerability.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-3'>03</p><h4 class='font-semibold mb-2'>Assume breach</h4><p>Design as if the attacker is already inside. Segment systems, monitor continuously, limit blast radius.</p></div></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>tooling</p><h3 class='text-3xl font-bold'>What makes it operational</h3><p class='text-text-main-light dark:text-text-main-dark'>The principles are only as strong as their implementation. Zero Trust depends on a layered stack of controls working together across identity, access, endpoints, and visibility.</p><div class='flex flex-wrap gap-2 text-sm text-text-main-light dark:text-text-main-dark'><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>MFA</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>RBAC</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>Microsegmentation</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>Endpoint compliance</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>SIEM</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>Encryption</span></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>why it matters</p><h3 class='text-3xl font-bold'>Built for the way we work now</h3><p class='text-text-main-light dark:text-text-main-dark'>Hybrid environments, cloud infrastructure, and remote workforces have made the traditional network perimeter obsolete. Zero Trust addresses this directly by treating every access request as untrusted by default, regardless of where it originates. The result is reduced attack surface, stronger compliance posture, and resilience that holds up when a breach occurs rather than assuming it will not.</p></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>my approach</p><h3 class='text-3xl font-bold'>How I put it into practice</h3><div class='space-y-4 text-text-main-light dark:text-text-main-dark'><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3'>01</span><strong>Policy design</strong> Building secure access policies that reflect real world risk, not just theoretical compliance checkboxes.</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3'>02</span><strong>Network segmentation</strong> Using pfSense and Proxmox to isolate systems and limit lateral movement in the event of a compromise.</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3'>03</span><strong>User training</strong> Leading workshops that equip teams to recognize threats and respond with confidence, not just awareness.</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3'>04</span><strong>Resilience modeling</strong> Building risk frameworks that assume breach from the start and prioritize recovery as much as prevention.</p></div></section>`,
            fullContentFr: `<p class='mb-4 italic text-text-main-light dark:text-text-main-dark border-l-2 border-border-light dark:border-border-dark pl-4'>Le Zero Trust n'est pas un produit que l'on achete ni un parametre que l'on active. C'est un etat d'esprit : ne rien tenir pour acquis, tout verifier, et construire des systemes capables de tenir meme lorsqu'un incident survient.</p><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>principes fondamentaux</p><h3 class='text-3xl font-bold'>Trois idees qui soutiennent l'ensemble</h3><p class='text-text-main-light dark:text-text-main-dark'>Le Zero Trust rejette l'ancien modele perimetrique ou etre a l'interieur du reseau signifiait etre digne de confiance. A sa place, trois principes guident chaque decision d'acces.</p><div class='grid grid-cols-1 md:grid-cols-3 gap-4'><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-3'>01</p><h4 class='font-semibold mb-2'>Verifier explicitement</h4><p>Authentifier et autoriser chaque demande selon l'identite, l'etat de l'appareil et le contexte. Aucun passe droit.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-3'>02</p><h4 class='font-semibold mb-2'>Moindre privilege</h4><p>Accorder uniquement l'acces necessaire, rien de plus. L'exces d'autorisations est une vulnerabilite.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><p class='text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-3'>03</p><h4 class='font-semibold mb-2'>Supposer la compromission</h4><p>Concevoir comme si l'attaquant etait deja a l'interieur. Segmenter les systemes, surveiller en continu, limiter l'impact.</p></div></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>outils</p><h3 class='text-3xl font-bold'>Ce qui le rend concret</h3><p class='text-text-main-light dark:text-text-main-dark'>Les principes ne valent que par leur mise en oeuvre. Le Zero Trust repose sur un ensemble de controles qui travaillent ensemble autour de l'identite, des acces, des terminaux et de la visibilite.</p><div class='flex flex-wrap gap-2 text-sm text-text-main-light dark:text-text-main-dark'><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>MFA</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>RBAC</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>Microsegmentation</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>Conformite des terminaux</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>SIEM</span><span class='px-3 py-1 rounded-md border border-border-light dark:border-border-dark'>Chiffrement</span></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>pourquoi c'est important</p><h3 class='text-3xl font-bold'>Concu pour notre facon de travailler</h3><p class='text-text-main-light dark:text-text-main-dark'>Les environnements hybrides, les infrastructures cloud et le travail a distance ont rendu obsolete le perimetre reseau traditionnel. Le Zero Trust repond directement a cette realite en traitant chaque demande d'acces comme non fiable par defaut, peu importe son origine. Le resultat est une surface d'attaque reduite, une posture de conformite plus forte et une resilience qui tient lorsqu'une compromission survient au lieu de supposer qu'elle n'arrivera pas.</p></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs lowercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>mon approche</p><h3 class='text-3xl font-bold'>Comment je l'applique</h3><div class='space-y-4 text-text-main-light dark:text-text-main-dark'><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3'>01</span><strong>Conception des politiques</strong> Elaborer des politiques d'acces securisees qui refletent les risques reels, et non seulement des exigences theoriques de conformite.</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3'>02</span><strong>Segmentation reseau</strong> Utiliser pfSense et Proxmox pour isoler les systemes et limiter les mouvements lateraux en cas de compromission.</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3'>03</span><strong>Formation des utilisateurs</strong> Animer des ateliers qui aident les equipes a reconnaitre les menaces et a reagir avec assurance, pas seulement avec vigilance.</p><p><span class='text-text-muted-light dark:text-text-muted-dark mr-3'>04</span><strong>Modelisation de la resilience</strong> Construire des cadres de risque qui supposent la compromission des le depart et accordent autant d'importance a la reprise qu'a la prevention.</p></div></section>`
        },
        {
            image: 'https://picsum.photos/seed/blog2/600/400',
            titleEn: 'Studying While Working Full Time',
            titleFr: 'Etudier en travaillant a temps plein',
            dateEn: 'Published on November 8, 2025',
            dateFr: 'Publie le 8 novembre 2025',
            excerptEn: 'Balancing a job and ongoing studies is a test of clarity, motivation, and discipline.',
            excerptFr: "Concilier un emploi et des etudes continues est un vrai test de clarte, de motivation et de discipline.",
            fullContentEn: `<p class='mb-4 italic text-text-main-light dark:text-text-main-dark border-l-2 border-border-light dark:border-border-dark pl-4'>Balancing a job and ongoing studies is not just a scheduling problem. It is a test of clarity, motivation, and the discipline to protect your own energy.</p><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>How I Stay Grounded</p><h3 class='text-3xl font-bold'>Four things that actually work</h3><p class='text-text-main-light dark:text-text-main-dark'>No system survives contact with a hectic week unchanged. What has helped me most is not a perfect routine. It is a handful of principles I return to when things get messy.</p><div class='grid grid-cols-1 md:grid-cols-2 gap-4'><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><h4 class='font-semibold mb-2'>Structured planning</h4><p>Weekly overviews and visual task boards keep priorities visible, not just theoretical.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><h4 class='font-semibold mb-2'>Energy scheduling</h4><p>Complex tasks go in peak focus windows. Admin fills the rest.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><h4 class='font-semibold mb-2'>Microlearning</h4><p>Twenty five minute sprints beat three hour sessions I keep postponing.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><h4 class='font-semibold mb-2'>Firm boundaries</h4><p>Evenings and weekends are protected time. Rest is not a reward. It is part of the system.</p></div></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>Why It Is Worth It</p><h3 class='text-3xl font-bold'>The overlap is the point</h3><p class='text-text-main-light dark:text-text-main-dark'>Every course, every late night reading session, feeds directly back into my work. Refining a policy, leading a workshop, building a more inclusive digital experience, the things I am studying and the things I am doing are rarely far apart. The overlap is not a burden. It is what makes both feel meaningful.</p><blockquote class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-6 italic'>Learning to prioritize progress over perfection is the hardest part. Once you do, the whole thing becomes sustainable.</blockquote></section>`,
            fullContentFr: `<p class='mb-4 italic text-text-main-light dark:text-text-main-dark border-l-2 border-border-light dark:border-border-dark pl-4'>Concilier un emploi et des etudes continues n'est pas seulement un probleme d'horaire. C'est un test de clarte, de motivation et de discipline pour proteger sa propre energie.</p><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>Ce qui m'aide a rester ancree</p><h3 class='text-3xl font-bold'>Quatre choses qui fonctionnent vraiment</h3><p class='text-text-main-light dark:text-text-main-dark'>Aucune methode ne resiste intacte a une semaine chaotique. Ce qui m'aide le plus n'est pas une routine parfaite. Ce sont quelques principes auxquels je reviens quand tout devient plus lourd.</p><div class='grid grid-cols-1 md:grid-cols-2 gap-4'><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><h4 class='font-semibold mb-2'>Planification structuree</h4><p>Des apercus hebdomadaires et des tableaux visuels gardent les priorites visibles et concretes.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><h4 class='font-semibold mb-2'>Organisation selon l'energie</h4><p>Les taches complexes vont dans les moments de concentration maximale. L administratif remplit le reste.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><h4 class='font-semibold mb-2'>Microapprentissage</h4><p>Des sprints de vingt cinq minutes valent mieux que des sessions de trois heures que je remets toujours.</p></div><div class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5'><h4 class='font-semibold mb-2'>Limites claires</h4><p>Les soirs et les weekends sont proteges. Le repos n'est pas une recompense. Il fait partie du systeme.</p></div></div></section><hr class='border-border-light dark:border-border-dark my-8'><section class='space-y-5'><p class='text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark font-semibold'>Pourquoi cela en vaut la peine</p><h3 class='text-3xl font-bold'>Le chevauchement est essentiel</h3><p class='text-text-main-light dark:text-text-main-dark'>Chaque cours, chaque lecture tardive, nourrit directement mon travail. Qu'il s'agisse d'affiner une politique, d'animer un atelier ou de construire une experience numerique plus inclusive, ce que j'etudie et ce que je fais restent tres proches. Ce chevauchement n'est pas un fardeau. C'est ce qui donne du sens aux deux.</p><blockquote class='rounded-xl bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-6 italic'>Apprendre a privilegier le progres plutot que la perfection est la partie la plus difficile. Une fois ce cap passe, tout devient plus durable.</blockquote></section>`
        },
        {
            image: 'https://picsum.photos/seed/blog3/600/400',
            titleEn: 'The Role of AI in Cybersecurity',
            titleFr: "Le role de l'IA en cybersecurite",
            dateEn: 'Published on October 5, 2025',
            dateFr: 'Publie le 5 octobre 2025',
            excerptEn: 'How AI is improving threat detection and response.',
            excerptFr: "Comment l'IA ameliore la detection et la reponse aux menaces.",
            fullContentEn: `<p class='mb-4 italic text-text-main-light dark:text-text-main-dark'>Machine learning is not just automating threat detection. It is fundamentally changing how organizations think about defense, response, and resilience.</p><hr class='border-border-light dark:border-border-dark my-6'><div class='space-y-6'><section><p class='text-xs uppercase tracking-widest text-sky-400 font-semibold mb-2'>Smarter Threat Detection</p><h3 class='text-2xl font-bold mb-3'>Beyond rules based thinking</h3><p class='text-text-main-light dark:text-text-main-dark'>Traditional security systems rely on predefined signatures, known attack patterns catalogued in advance. AI flips that model. Instead of matching threats to a list, machine learning looks for unusual behavior and surface anomalies such as account logins at 3 a.m. from an unfamiliar country or a sudden spike in outbound data transfers. These behavioral signals often catch attacks that rules based tools miss entirely.</p></section><hr class='border-border-light dark:border-border-dark'><section><p class='text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2'>Real Time Response</p><h3 class='text-2xl font-bold mb-3'>Cutting reaction time to seconds</h3><p class='text-text-main-light dark:text-text-main-dark'>When a threat is detected, speed is everything. AI powered systems can act autonomously by isolating compromised endpoints, revoking access tokens, or blocking suspicious traffic before a human analyst even opens an alert. In large scale or distributed environments, that automated first response can be the difference between a contained incident and a full breach.</p></section><hr class='border-border-light dark:border-border-dark'><section><p class='text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2'>Adaptive Defense</p><h3 class='text-2xl font-bold mb-3'>Defense that gets smarter over time</h3><p class='text-text-main-light dark:text-text-main-dark'>Static firewalls are built for yesterday's threat landscape. AI driven defenses evolve continuously by ingesting new incident data, refining their models, and adapting to emerging attack vectors. This makes them particularly well suited to dynamic environments such as cloud infrastructure that changes daily, hybrid workforces using a mix of personal and managed devices, and SaaS ecosystems with complex trust boundaries.</p></section><hr class='border-border-light dark:border-border-dark'><section><p class='text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2'>Perspective</p><h3 class='text-2xl font-bold mb-3'>AI as ally, not replacement</h3><p class='text-text-main-light dark:text-text-main-dark'>In my own work, AI principles shape everything from risk modeling to team training. Teaching people to recognize phishing patterns, using anomaly detection to harden virtual environments, and building a security culture that treats humans and technology as complementary, these are not separate efforts. The most resilient organizations treat AI as a force multiplier for human judgment, not a substitute for it. The tools are only as good as the people who understand and guide them.</p></section></div><blockquote class='mt-8 rounded-lg bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5 italic'>The question is not whether AI belongs in your security stack. It is whether your team has the context to use it well.</blockquote>`,
            fullContentFr: `<p class='mb-4 italic text-text-main-light dark:text-text-main-dark'>L'apprentissage automatique ne se contente pas d'automatiser la detection des menaces. Il transforme en profondeur la facon dont les organisations pensent la defense, la reponse et la resilience.</p><hr class='border-border-light dark:border-border-dark my-6'><div class='space-y-6'><section><p class='text-xs uppercase tracking-widest text-sky-400 font-semibold mb-2'>Detection intelligente</p><h3 class='text-2xl font-bold mb-3'>Au dela des regles statiques</h3><p class='text-text-main-light dark:text-text-main-dark'>Les systemes de securite traditionnels s'appuient sur des signatures predefinies, c'est a dire des modeles d'attaque repertories a l'avance. L'IA change cette logique. Au lieu de comparer chaque menace a une liste figee, l'apprentissage automatique cherche les comportements inhabituels et les anomalies visibles, comme une connexion a 3 h du matin depuis un pays inconnu ou une hausse soudaine des transferts de donnees sortants. Ces signaux comportementaux permettent souvent de detecter des attaques que les outils bases sur des regles ne voient pas.</p></section><hr class='border-border-light dark:border-border-dark'><section><p class='text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2'>Reponse en temps reel</p><h3 class='text-2xl font-bold mb-3'>Reduire la reaction a quelques secondes</h3><p class='text-text-main-light dark:text-text-main-dark'>Lorsqu'une menace est detectee, la vitesse est essentielle. Les systemes propulses par l'IA peuvent agir de facon autonome en isolant des postes compromis, en revoquant des jetons d'acces ou en bloquant un trafic suspect avant meme qu'un analyste n'ouvre l'alerte. Dans des environnements distribues ou a grande echelle, cette premiere reponse automatisee peut faire la difference entre un incident contenu et une compromission complete.</p></section><hr class='border-border-light dark:border-border-dark'><section><p class='text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2'>Defense adaptative</p><h3 class='text-2xl font-bold mb-3'>Une defense qui devient plus intelligente avec le temps</h3><p class='text-text-main-light dark:text-text-main-dark'>Les pare feu statiques sont construits pour le paysage de menaces d'hier. Les defenses alimentees par l'IA evoluent en continu en integrant de nouvelles donnees d'incident, en affinant leurs modeles et en s'adaptant aux vecteurs d'attaque emergents. Elles sont particulierement pertinentes dans des environnements dynamiques comme les infrastructures cloud qui changent chaque jour, les equipes hybrides utilisant des appareils personnels et geres, et les ecosystemes SaaS avec des frontieres de confiance complexes.</p></section><hr class='border-border-light dark:border-border-dark'><section><p class='text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2'>Perspective</p><h3 class='text-2xl font-bold mb-3'>L'IA comme alliee, pas comme remplacement</h3><p class='text-text-main-light dark:text-text-main-dark'>Dans mon propre travail, les principes de l'IA influencent autant la modelisation des risques que la formation des equipes. Apprendre aux personnes a reconnaitre les signes de l'hameconnage, utiliser la detection d'anomalies pour renforcer des environnements virtuels, et construire une culture de securite ou humains et technologie se completent, tout cela fait partie du meme effort. Les organisations les plus resilientes considerent l'IA comme un multiplicateur du jugement humain, et non comme un substitut. Les outils ne valent que par les personnes qui savent les comprendre et les orienter.</p></section></div><blockquote class='mt-8 rounded-lg bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark border border-border-light dark:border-border-dark p-5 italic'>La vraie question n'est pas de savoir si l'IA a sa place dans votre arsenal de securite. C'est de savoir si votre equipe a le contexte necessaire pour bien l'utiliser.</blockquote>`
        }
    ];

    const blogPostsContainer = document.getElementById('blog-posts');
    if (blogPostsContainer) {
        loadBlogPosts();
    }

    function renderBlogPosts(posts) {
        const blogPostsContainer = document.getElementById('blog-posts');
        blogPostsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg overflow-hidden shadow-lg transition-shadow hover:shadow-xl';

            const title = post[`title${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`];
            const date = post[`date${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`];
            const excerpt = post[`excerpt${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`];
            const fullContent = post[`fullContent${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`];

            postElement.innerHTML = `
                <img src="${post.image}" alt="${title}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-2xl font-bold mb-2">${title}</h3>
                    <p class="text-sm text-text-muted-light dark:text-text-muted-dark mb-2">${date}</p>
                    <p class="text-text-muted-light dark:text-text-muted-dark text-sm mb-4">${excerpt}</p>
                    <a href="${buildPostUrl(post)}" class="read-more-btn inline-flex w-full items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors" data-lang-en="Read More" data-lang-fr="Lire la Suite">Read More</a>
                </div>
            `;

            postElement.setAttribute(`data-full-content-${currentLang}`, fullContent);
            blogPostsContainer.appendChild(postElement);
        });
    }

    function loadBlogPosts() {
        loadPosts(renderBlogPosts);
    }

    function loadPostDetail() {
        loadPosts(posts => {
            const selectedPost = findSelectedPost(posts);

            if (!selectedPost) {
                showPostError(
                    currentLang === 'fr'
                        ? 'Article introuvable.'
                        : 'Post not found.'
                );
                return;
            }

            renderPostDetail(selectedPost);
        });
    }

    function loadPosts(onSuccess) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'posts.json', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
                    try {
                        onSuccess(JSON.parse(xhr.responseText));
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                        onSuccess(fallbackPosts);
                    }
                } else {
                    onSuccess(fallbackPosts);
                }
            }
        };
        xhr.onerror = function() {
            onSuccess(fallbackPosts);
        };
        xhr.send();
    }

    function renderPostDetail(post) {
        if (!postImage || !postTitle || !postDate || !postContent) {
            return;
        }

        const title = post[`title${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`];
        const date = post[`date${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`];
        const fullContent = post[`fullContent${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`];

        document.title = `${title} | Julia Yossa`;
        postImage.src = post.image;
        postImage.alt = title;
        postTitle.textContent = title;
        postDate.textContent = date;
        postContent.innerHTML = fullContent;

        if (postError) {
            postError.classList.add('hidden');
            postError.textContent = '';
        }
    }

    function showPostError(message) {
        if (!postError || !postContent) {
            return;
        }

        postContent.innerHTML = '';
        postError.textContent = message;
        postError.classList.remove('hidden');
    }

    function findSelectedPost(posts) {
        const params = new URLSearchParams(window.location.search);
        const requestedPost = params.get('post');

        if (!requestedPost) {
            return posts[0] || null;
        }

        return posts.find(post => getPostSlug(post) === requestedPost) || null;
    }

    function buildPostUrl(post) {
        return `post.html?post=${encodeURIComponent(getPostSlug(post))}&lang=${encodeURIComponent(currentLang)}`;
    }

    function syncLanguageQueryParam() {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', currentLang);
        window.history.replaceState({}, '', url);
    }

    function getPostSlug(post) {
        return post.titleEn
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function attachStaticReadMoreLinks() {
        const readMoreButtons = document.querySelectorAll('button.read-more-btn');

        readMoreButtons.forEach(button => {
            button.addEventListener('click', () => {
                const card = button.closest('.bg-gray-900');
                const titleElement = card ? card.querySelector('h3') : null;
                const titleEn = titleElement?.getAttribute('data-lang-en') || titleElement?.textContent;

                if (!titleEn) {
                    return;
                }

                window.location.href = buildPostUrl({ titleEn });
            });
        });
    }

    if (postContent) {
        loadPostDetail();
    } else if (!blogPostsContainer) {
        attachStaticReadMoreLinks();
    }
});
