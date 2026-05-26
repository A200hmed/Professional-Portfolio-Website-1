document.addEventListener('DOMContentLoaded', () => {
            // ─── GLOBAL APP STATE ────────────────────────────────────────────────────────
            let portfolioData = null;
            let projectsData = [];
            let currentFilter = 'all';
            let searchQuery = '';
            let testimonialsIndex = 0;
            let testimonialsData = [];
            let currentLang = localStorage.getItem('portfolio-lang') || 'en';
            let isDataLoaded = false;
            let isProgressFinished = false;

            const API_URL = window.location.origin;

            // ─── ELEMENT REFS ────────────────────────────────────────────────────────────
            const titleEl = document.getElementById('dev-title');
            const bioEl = document.getElementById('dev-bio');
            const bioheroEl = document.getElementById('dev-bio-hero');
            const avatarEl = document.getElementById('dev-avatar');
            const resumeBtn = document.getElementById('dev-resume-btn');
            const heroResumeBtn = document.getElementById('hero-resume-btn');
            const contactEmailEl = document.getElementById('contact-email-val');
            const contactWhatsappEl = document.getElementById('contact-whatsapp-val');
            const contactLocEl = document.getElementById('contact-loc-val');
            const ytChannelLink = document.getElementById('yt-channel-link');
            const langToggleBtn = document.getElementById('lang-toggle-btn');
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-links a');

            // ─── SVG HELPERS (HOISTED) ───────────────────────────────────────────────────
            function svgGithub() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>'; }

            function svgLinkedin() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>'; }

            function svgYoutube() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>'; }

            function svgWhatsapp() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>'; }

            function svgTwitter() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>'; }

            function svgFacebook() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>'; }

            function svgInstagram() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>'; }

            function svgTelegram() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.19 2.82L2.04 10.19c-1.3.52-1.29 1.24-.24 1.56l4.92 1.53 11.41-7.19c.54-.33 1.03-.15.63.29l-9.25 8.35-.36 5.37c.52 0 .75-.24 1.04-.49l2.5-2.43 5.2 3.84c.96.53 1.65.26 1.89-.88l3.41-16.1c.35-1.4-.66-2.16-1.85-1.65z"></path></svg>'; }

            // ─── TRANSLATIONS ────────────────────────────────────────────────────────────
            const uiTranslations = {
                en: {
                    navHome: "Home",
                    navAbout: "About",
                    navSkills: "Skills",
                    navLanguages: "Languages",
                    navProjects: "Projects",
                    navYoutube: "YouTube",
                    navResume: "Resume",
                    navContact: "Contact",
                    btnGetResume: "Get Resume",
                    heroSubtitle: "Portfolio 2026 — Cairo, Egypt",
                    heroTitle: "Building <br> Digital Systems <br> & Teaching Devs.",
                    heroDesc: "Full Stack Developer, Software Engineer, and Educational Content Creator helping thousands of developers worldwide master modern programming.",
                    btnExploreProjects: "Explore Projects",
                    btnLetCollaborate: "Let's Collaborate",
                    btnContactMe: "Contact Me",
                    btnDownloadCv: "Download CV",
                    btnGithub: "GitHub",
                    aboutTitle: "About Me",
                    metricProjects: "Projects Built",
                    metricVideos: "YouTube Videos",
                    metricAwards: "Certifications",
                    metricStudents: "Students Reached",
                    skillsTitle: "Core Competencies",
                    skillsSubtitle: "Technical skills built over years of engineering, teaching, and delivering enterprise-grade digital systems.",
                    skillsDev: "Programming & Development",
                    skillsNetworking: "Networks & Cloud",
                    skillsAi: "Artificial Intelligence",
                    skillsCybersecurity: "Cyber Security",
                    projectsTitle: "Selected Showcase",
                    projectsSubtitle: "A curated catalog of high-quality, production-ready digital systems built to elite specifications.",
                    projectsSearchPlaceholder: "Search projects by name or technology...",
                    projectsTabAll: "All Systems",
                    projectsTabFullstack: "Full-Stack",
                    projectsTabFrontend: "Frontend / UI",
                    projectsTabBackend: "Backend",
                    projectsTabTools: "Dev Tools",
                    githubTitle: "Open Source Repositories",
                    githubSubtitle: "Live repository metrics fetched dynamically via secure server proxy.",
                    youtubeChannelName: "zero to code",
                    youtubeChannelBadge: "YouTube Creator",
                    youtubeTitle: "YouTube Content Creator",
                    youtubeSubtitle: "Educating developers worldwide through structured programming tutorials, full-stack walkthroughs, and software engineering deep-dives.",
                    ytStatStudents: "Followers & Students",
                    ytStatVideos: "Videos Published",
                    ytStatViews: "Total Views",
                    youtubeChannelBtn: "Visit YouTube Channel",
                    resumeTitle: "Career Milestones",
                    resumeSubtitle: "A professional timeline of engineering leadership, instructional excellence, and academic achievements.",
                    certsTitle: "Certifications & Honors",
                    certsSubtitle: "Professional certifications from leading technology organizations validating engineering excellence.",
                    honorsTitle: "Career Honors",
                    honorsSubtitle: "Recognition and awards for software engineering and educational impact.",
                    testimonialsTitle: "Industry Endorsements",
                    testimonialsSubtitle: "Verified feedback from senior engineers, technical directors, and students around the world.",
                    contactTitle: "Let's Build Together",
                    contactSubtitle: "Open to collaborations, consulting, workshops, and corporate training. Submit your inquiry below.",
                    contactEmailTitle: "Direct Email",
                    contactWhatsappTitle: "WhatsApp",
                    contactWhatsappVal: "Open Chat on WhatsApp",
                    contactLocTitle: "Location",
                    contactSocialTitle: "Connect Online",
                    formLabelName: "Your Name",
                    formPlaceholderName: "John Doe",
                    formLabelEmail: "Email Address",
                    formPlaceholderEmail: "john@company.com",
                    formLabelSubject: "Subject",
                    formPlaceholderSubject: "Project Collaboration / Training Request",
                    formLabelMessage: "Message",
                    formPlaceholderMessage: "Describe your project, training need, or collaboration idea...",
                    formBtnSend: "Send Message",
                    noProjectsFound: "No projects found matching your search.",
                    learnMore: "Learn More",
                    liveDemo: "Live Demo",
                    keyFeatures: "Key Features",
                    visitLivePlatform: "Visit Live Platform",
                    viewSourceCode: "View Source Code",
                    viewRepo: "View Repo →",
                    failedRepos: "Could not load repositories.",
                    sendingMsg: "Sending your message...",
                    msgSuccess: "✓ Message sent! Ahmed will get back to you soon.",
                    msgError: "Failed to send message.",
                    connError: "Connection error. Please try again.",
                    langsTitle: "Programming Languages",
                    langsSubtitle: "Languages I write fluently — from systems programming to scripting, backend APIs, and mobile apps.",
                    langsFrontend: "Frontend Development",
                    langsBackend: "Backend Development",
                    langsMobile: "Mobile Applications",
                    langsSystems: "Systems & Tools",
                    loadingText: "Initializing Digital Environment..."
                },
                ar: {
                    navHome: "الرئيسية",
                    navAbout: "من أنا",
                    navSkills: "المهارات",
                    navLanguages: "اللغات",
                    navProjects: "المشاريع",
                    navYoutube: "يوتيوب",
                    navResume: "السيرة الذاتية",
                    navContact: "اتصل بي",
                    btnGetResume: "السيرة الذاتية",
                    heroSubtitle: "معرض الأعمال 2026 — القاهرة، مصر",
                    heroTitle: "بناء <br> الأنظمة الرقمية <br> وتدريس المبرمجين.",
                    heroDesc: "مهندس برمجيات ومطور ويب شامل وصانع محتوى تعليمي أساعد آلاف المطورين حول العالم على احتراف البرمجة الحديثة.",
                    btnExploreProjects: "استكشف مشاريعي",
                    btnLetCollaborate: "دعنا نتعاون",
                    btnContactMe: "اتصل بي",
                    btnDownloadCv: "تنزيل الـ CV",
                    btnGithub: "جيت هاب",
                    aboutTitle: "من أنا",
                    metricProjects: "المشاريع المنجزة",
                    metricVideos: "فيديو يوتيوب",
                    metricAwards: "الشهادات التقنية",
                    metricStudents: "الطلاب والمتابعين",
                    skillsTitle: "الكفاءات الأساسية",
                    skillsSubtitle: "المهارات التقنية التي تم بناؤها على مدار سنوات من العمل الهندسي والتعليم وتقديم الأنظمة الرقمية.",
                    skillsDev: "البرمجة والتطوير",
                    skillsNetworking: "الشبكات والسحابة",
                    skillsAi: "الذكاء الاصطناعي",
                    skillsCybersecurity: "الأمن السيبراني",
                    projectsTitle: "مشاريع مختارة",
                    projectsSubtitle: "كتالوج منسق من الأنظمة الرقمية عالية الجودة والجاهزة للإنتاج والمبنية وفقاً لأعلى المعايير.",
                    projectsSearchPlaceholder: "ابحث عن المشاريع بالاسم أو التقنية...",
                    projectsTabAll: "جميع الأنظمة",
                    projectsTabFullstack: "شامل (Full-Stack)",
                    projectsTabFrontend: "الواجهة الأمامية",
                    projectsTabBackend: "الواجهة الخلفية",
                    projectsTabTools: "أدوات التطوير",
                    githubTitle: "مستودعات مفتوحة المصدر",
                    githubSubtitle: "مقاييس المستودعات الحية التي يتم جلبها ديناميكياً عبر وسيط الخادم الآمن.",
                    youtubeChannelName: "زيرو تو كود",
                    youtubeChannelBadge: "صانع محتوى",
                    youtubeTitle: "صانع محتوى على يوتيوب",
                    youtubeSubtitle: "تعليم المطورين في جميع أنحاء العالم من خلال دروس برمجة منظمة وشروحات شاملة وتعمق في هندسة البرمجيات.",
                    ytStatStudents: "متابع وطالب",
                    ytStatVideos: "فيديو منشور",
                    ytStatViews: "إجمالي المشاهدات",
                    youtubeChannelBtn: "زيارة قناة يوتيوب",
                    resumeTitle: "محطات المسيرة المهنية",
                    resumeSubtitle: "جدول زمني احترافي للقيادة الهندسية والتميز التعليمي والإنجازات الأكاديمية.",
                    certsTitle: "الشهادات والجوائز",
                    certsSubtitle: "الشهادات المهنية من الشركات التقنية الرائدة التي تثبت التميز الهندسي.",
                    honorsTitle: "جوائز المسيرة المهنية",
                    honorsSubtitle: "التقدير والجوائز الممنوحة لهندسة البرمجيات والتأثير التعليمي.",
                    testimonialsTitle: "توصيات وشهادات",
                    testimonialsSubtitle: "آراء موثقة من كبار المهندسين والمديرين التقنيين والطلاب من جميع أنحاء العالم.",
                    contactTitle: "فلنبنِ معاً",
                    contactSubtitle: "متاح للتعاون البرمجي والاستشارات وورش العمل والتدريب للشركات. أرسل استفسارك أدناه.",
                    contactEmailTitle: "البريد الإلكتروني المباشر",
                    contactWhatsappTitle: "واتساب",
                    contactWhatsappVal: "بدء محادثة على واتساب",
                    contactLocTitle: "الموقع",
                    contactSocialTitle: "تواصل معي عبر الإنترنت",
                    formLabelName: "الاسم",
                    formPlaceholderName: "أدخل اسمك الكريم",
                    formLabelEmail: "البريد الإلكتروني",
                    formPlaceholderEmail: "name@example.com",
                    formLabelSubject: "الموضوع",
                    formPlaceholderSubject: "طلب تعاون في مشروع / طلب تدريب",
                    formLabelMessage: "الرسالة",
                    formPlaceholderMessage: "صف مشروعك، أو احتياجاتك التدريبية، أو فكرة التعاون...",
                    formBtnSend: "إرسال الرسالة",
                    noProjectsFound: "لم يتم العثور على مشاريع تطابق بحثك.",
                    learnMore: "التفاصيل",
                    liveDemo: "العرض الحي",
                    keyFeatures: "الميزات الرئيسية",
                    visitLivePlatform: "زيارة المنصة الحية",
                    viewSourceCode: "عرض الكود المصدر",
                    viewRepo: "عرض المستودع ←",
                    failedRepos: "تعذر تحميل المستودعات.",
                    sendingMsg: "جاري إرسال رسالتك...",
                    msgSuccess: "✓ تم إرسال رسالتك بنجاح! سيتواصل معك أحمد قريباً.",
                    msgError: "فشل إرسال الرسالة.",
                    connError: "خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
                    langsTitle: "لغات البرمجة",
                    langsSubtitle: "اللغات التي أكتبها بطلاقة — من برمجة الأنظمة إلى السكريبتينج وواجهات API والتطبيقات.",
                    langsFrontend: "تطوير الواجهات الأمامية",
                    langsBackend: "تطوير الواجهات الخلفية",
                    langsMobile: "تطبيقات الهاتف المحمول",
                    langsSystems: "الأنظمة والأدوات",
                    loadingText: "جاري تهيئة البيئة الرقمية..."
                }
            };

            // ─── RENDERING FUNCTIONS ─────────────────────────────────────────────────────
            function renderSocialLinks(info, container) {
                if (!container) return;
                container.innerHTML = `
            ${info.githubUrl    ? `<a href="${info.githubUrl}"    target="_blank" class="social-link" title="GitHub">${svgGithub()}</a>`    : ''}
            ${info.linkedinUrl  ? `<a href="${info.linkedinUrl}"  target="_blank" class="social-link" title="LinkedIn">${svgLinkedin()}</a>`  : ''}
            ${info.youtubeUrl   ? `<a href="${info.youtubeUrl}"   target="_blank" class="social-link" title="YouTube">${svgYoutube()}</a>`    : ''}
            ${info.twitterUrl   ? `<a href="${info.twitterUrl}"   target="_blank" class="social-link" title="Twitter">${svgTwitter()}</a>`    : ''}
            ${info.facebookUrl  ? `<a href="${info.facebookUrl}"  target="_blank" class="social-link" title="Facebook">${svgFacebook()}</a>`  : ''}
            ${info.instagramUrl ? `<a href="${info.instagramUrl}" target="_blank" class="social-link" title="Instagram">${svgInstagram()}</a>`: ''}
            ${info.telegramUrl  ? `<a href="${info.telegramUrl}"  target="_blank" class="social-link" title="Telegram">${svgTelegram()}</a>`  : ''}
            ${info.whatsapp     ? `<a href="${info.whatsapp}"     target="_blank" class="social-link" title="WhatsApp">${svgWhatsapp()}</a>`  : ''}
        `;
    }

    function renderHeroSocials(info) {
        const container = document.getElementById('hero-social-links');
        if (!container) return;
        const links = [
            { url: info.githubUrl, icon: svgGithub(), label: 'GitHub' },
            { url: info.linkedinUrl, icon: svgLinkedin(), label: 'LinkedIn' },
            { url: info.youtubeUrl, icon: svgYoutube(), label: 'YouTube' },
            { url: info.whatsapp, icon: svgWhatsapp(), label: 'WhatsApp' },
            { url: info.facebookUrl, icon: svgFacebook(), label: 'Facebook' },
            { url: info.telegramUrl, icon: svgTelegram(), label: 'Telegram' },
        ].filter(l => l.url);

        container.innerHTML = links.map(l => `
            <a href="${l.url}" target="_blank" title="${l.label}" class="hero-social-tag" style="
                display: inline-flex; align-items: center; gap: 6px;
                padding: 8px 18px; border-radius: 20px;
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(255,255,255,0.06);
                color: var(--text-secondary);
                text-decoration: none;
                font-size: 0.85rem; font-weight: 500;
                transition: all 0.25s ease;
            ">
                ${l.icon} ${l.label}
            </a>
        `).join('');
    }

    function renderSkills(skills) {
        const containers = { dev: document.getElementById('skills-dev'), networking: document.getElementById('skills-networking'), ai: document.getElementById('skills-ai'), cybersecurity: document.getElementById('skills-cybersecurity') };
        Object.values(containers).forEach(el => { if (el) el.innerHTML = ''; });
        skills.forEach(skill => {
            const container = containers[skill.category];
            if (container) container.insertAdjacentHTML('beforeend', `<span class="skill-pill">${currentLang === 'ar' ? (skill.name_ar || skill.name) : skill.name}</span>`);
        });
    }

    function renderLanguages(langs) {
        const containers = { frontend: document.getElementById('languages-frontend-grid'), backend: document.getElementById('languages-backend-grid'), mobile: document.getElementById('languages-mobile-grid'), systems: document.getElementById('languages-systems-grid') };
        const groupWrappers = { frontend: document.getElementById('group-lang-frontend'), backend: document.getElementById('group-lang-backend'), mobile: document.getElementById('group-lang-mobile'), systems: document.getElementById('group-lang-systems') };
        Object.values(containers).forEach(el => { if (el) el.innerHTML = ''; });
        Object.values(groupWrappers).forEach(el => { if (el) el.style.display = 'none'; });

        langs.forEach(lang => {
            const cat = lang.category || 'backend';
            const grid = containers[cat];
            if (grid) {
                if (groupWrappers[cat]) groupWrappers[cat].style.display = 'block';
                const displayName = currentLang === 'ar' ? (lang.name_ar || lang.name) : lang.name;
                grid.insertAdjacentHTML('beforeend', `
                    <div class="lang-card">
                        <div class="lang-card-header">
                            <span class="lang-name">${displayName}</span>
                            <span class="lang-level-pct">${lang.level}%</span>
                        </div>
                        <div class="lang-bar-bg"><div class="lang-bar-fill" style="width:${lang.level}%"></div></div>
                    </div>
                `);
            }
        });
    }

    function renderTimeline(items) {
        const container = document.getElementById('timeline-list');
        if (!container) return;
        container.innerHTML = items.map(item => `
            <div class="timeline-item">
                <div class="timeline-meta">
                    <span class="timeline-duration">${item.duration}</span>
                    <span class="timeline-role">${currentLang === 'ar' ? (item.role_ar || item.role) : item.role}</span>
                </div>
                <div class="timeline-company">${currentLang === 'ar' ? (item.company_ar || item.company) : item.company}</div>
                <p class="timeline-desc">${currentLang === 'ar' ? (item.description_ar || item.description) : item.description}</p>
            </div>
        `).join('');
    }

    function renderAchievements(achievements) {
        const container = document.getElementById('achievements-grid');
        if (!container) return;
        container.innerHTML = achievements.map(item => `
            <div class="glass-card text-center" style="padding:28px;">
                <h3 class="text-gradient">${currentLang === 'ar' ? (item.title_ar || item.title) : item.title}</h3>
                <div style="color:var(--accent-cyan);">${currentLang === 'ar' ? (item.issuer_ar || item.issuer) : item.issuer}</div>
            </div>
        `).join('');
    }

    function renderCertificates(certs) {
        const container = document.getElementById('certificates-grid');
        if (!container) return;
        container.innerHTML = certs.map(cert => `
            <div class="cert-carousel-card" onclick="openCertModal('${cert.image}')">
                <div class="cert-img-container" style="background:#fff; height:200px; border-radius:12px; overflow:hidden;">
                    <embed src="${cert.image}#toolbar=0" type="application/pdf" width="100%" height="100%" style="pointer-events:none;">
                </div>
                <div class="cert-carousel-label">
                    <span class="cert-carousel-title">${currentLang === 'ar' ? (cert.title_ar || cert.title) : cert.title}</span>
                </div>
            </div>
        `).join('');
    }

    function renderYouTube(videos, info) {
        const container = document.getElementById('youtube-grid');
        if (!container) return;
        container.innerHTML = videos.map(v => `
            <a href="${v.url}" target="_blank" class="yt-card glass-card">
                <div class="yt-thumb-wrap">
                    <img src="${v.thumbnail}" alt="${v.title}" class="yt-thumb">
                    <div class="yt-play-btn">▶</div>
                </div>
                <h3 class="yt-title">${currentLang === 'ar' ? (v.title_ar || v.title) : v.title}</h3>
            </a>
        `).join('');
    }

    function renderTestimonials() {
        const wrapper = document.getElementById('testimonials-wrapper');
        if (!wrapper || testimonialsData.length === 0) return;
        wrapper.innerHTML = testimonialsData.map(item => `
            <div class="glass-card testimonial-card">
                <p>"${currentLang === 'ar' ? (item.message_ar || item.message) : item.message}"</p>
                <div class="testimonial-profile">
                    <strong>${item.name}</strong> - ${item.role} @ ${item.company}
                </div>
            </div>
        `).join('');
    }

    function renderProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        let filtered = currentFilter === 'all' ? projectsData : projectsData.filter(p => p.category === currentFilter);
        if (searchQuery) filtered = filtered.filter(p => (p.title + (p.title_ar || '')).toLowerCase().includes(searchQuery));
        
        projectsGrid.innerHTML = filtered.map(p => `
            <div class="glass-card project-card">
                <img src="${p.image}" alt="${p.title}" class="project-image">
                <div style="padding:20px;">
                    <h3 class="project-title text-gradient">${currentLang === 'ar' ? (p.title_ar || p.title) : p.title}</h3>
                    <p class="project-desc">${currentLang === 'ar' ? (p.description_ar || p.description) : p.description}</p>
                    <button onclick="openProjectModal('${p.id}')" class="btn btn-secondary">Learn More</button>
                </div>
            </div>
        `).join('');
    }

    // ─── LANGUAGE SWITCHER ───────────────────────────────────────────────────────
    function setLanguage(lang) {
        localStorage.setItem('portfolio-lang', lang);
        currentLang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        if (langToggleBtn) langToggleBtn.textContent = lang === 'en' ? 'العربية' : 'English';

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (uiTranslations[lang] && uiTranslations[lang][key]) {
                const translation = uiTranslations[lang][key];
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.setAttribute('placeholder', translation);
                } else {
                    if (translation.includes('<br>') || translation.includes('<span>')) {
                        el.innerHTML = translation;
                    } else {
                        el.textContent = translation;
                    }
                }
            }
        });

        if (portfolioData) {
            try {
                const info = portfolioData.personalInfo;
                if (info) {
                    if (titleEl) titleEl.textContent = lang === 'ar' ? (info.title_ar || info.title) : info.title;
                    if (bioEl) bioEl.textContent = lang === 'ar' ? (info.bio_ar || info.bio) : info.bio;
                    if (bioheroEl) bioheroEl.textContent = lang === 'ar' ? (info.bio_ar || info.bio) : info.bio;
                    if (contactLocEl) contactLocEl.textContent = lang === 'ar' ? (info.location_ar || info.location) : info.location;
                    if (avatarEl && info.avatar) avatarEl.src = info.avatar;
                    if (resumeBtn && info.resumeUrl && info.resumeUrl !== '#') { resumeBtn.href = info.resumeUrl; resumeBtn.target = "_blank"; }
                    if (heroResumeBtn && info.resumeUrl && info.resumeUrl !== '#') { heroResumeBtn.href = info.resumeUrl; heroResumeBtn.target = "_blank"; }
                    if (contactEmailEl) { contactEmailEl.textContent = info.email; contactEmailEl.href = `mailto:${info.email}`; }
                    if (contactWhatsappEl && info.whatsapp) { contactWhatsappEl.href = info.whatsapp; }
                    if (ytChannelLink && info.youtubeUrl) { ytChannelLink.href = info.youtubeUrl; }

                    const footerLogo = document.querySelector('.footer-logo');
                    if (footerLogo) footerLogo.innerHTML = `${lang === 'ar' ? (info.name_ar || info.name) : info.name} <span></span>`;
                    const footerCopy = document.querySelector('.footer-copy');
                    if (footerCopy) {
                        footerCopy.textContent = lang === 'ar' ?
                            `© 2026 ${info.name_ar || info.name}. جميع الحقوق محفوظة.` :
                            `© 2026 ${info.name}. All Rights Reserved.`;
                    }
                    renderSocialLinks(info, document.querySelector('.social-links'));
                    renderHeroSocials(info);
                }
                if (portfolioData.skills) renderSkills(portfolioData.skills);
                if (portfolioData.languages) renderLanguages(portfolioData.languages);
                if (portfolioData.timeline) renderTimeline(portfolioData.timeline);
                if (portfolioData.achievements) renderAchievements(portfolioData.achievements);
                if (portfolioData.testimonials) { testimonialsData = portfolioData.testimonials; renderTestimonials(); }
                if (portfolioData.certificates) renderCertificates(portfolioData.certificates);
                if (portfolioData.youtubeVideos) renderYouTube(portfolioData.youtubeVideos, portfolioData.personalInfo);
                renderProjects();
            } catch (e) { console.error('Render error:', e); }
        }
    }

    // ─── BOOT SEQUENCE ───────────────────────────────────────────────────────────
    async function loadPortfolioData() {
        if (window.INITIAL_PORTFOLIO_DATA) {
            portfolioData = window.INITIAL_PORTFOLIO_DATA;
            if (portfolioData.projects) projectsData = portfolioData.projects;
            if (portfolioData.testimonials) testimonialsData = portfolioData.testimonials;
            finalizeBoot();
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/settings`);
            portfolioData = await res.json();
            if (portfolioData.projects) projectsData = portfolioData.projects;
            if (portfolioData.testimonials) testimonialsData = portfolioData.testimonials;
            finalizeBoot();
        } catch (e) { console.error('Load failed:', e); isDataLoaded = true; checkReadyState(); }
    }

    function finalizeBoot() {
        if (!portfolioData) { isDataLoaded = true; checkReadyState(); return; }
        const stats = (portfolioData.personalInfo && portfolioData.personalInfo.stats) || {};
        const statMap = { 'stat-students': stats.students, 'yt-stat-tutorials': stats.tutorials, 'yt-stat-views': stats.views, 'yt-stat-students': stats.students };
        Object.entries(statMap).forEach(([id, val]) => { const el = document.getElementById(id); if (el && val) el.textContent = val; });

        const yt = (portfolioData.personalInfo && portfolioData.personalInfo.youtube) || {};
        if (yt.title && document.getElementById('yt-section-title')) document.getElementById('yt-section-title').textContent = yt.title;
        if (yt.description && document.getElementById('yt-section-desc')) document.getElementById('yt-section-desc').textContent = yt.description;
        if (yt.badgeImage && document.getElementById('yt-badge-img')) document.getElementById('yt-badge-img').src = yt.badgeImage;

        const info = portfolioData.personalInfo || {};
        if (info.avatar && avatarEl) avatarEl.src = info.avatar;
        const countEl = document.getElementById('count-projects');
        if (countEl && projectsData) countEl.textContent = projectsData.length;

        setLanguage(currentLang);
        bindScrollObservers();
        
        if (langToggleBtn) langToggleBtn.onclick = () => setLanguage(currentLang === 'en' ? 'ar' : 'en');

        isDataLoaded = true;
        checkReadyState();
    }

    // ─── PRELOADER LOGIC ─────────────────────────────────────────────────────────
    function startLoadingSequence() {
        const fill = document.getElementById('loader-fill');
        const text = document.getElementById('load-percentage');
        let progress = 0;
        const interval = setInterval(() => {
            progress += isDataLoaded ? 8 : 2;
            if (progress >= 100) { progress = 100; clearInterval(interval); isProgressFinished = true; checkReadyState(); }
            if (fill) fill.style.width = progress + '%';
            if (text) text.textContent = Math.floor(progress);
        }, 120);
        setTimeout(() => { if (!isProgressFinished) revealWebsite(); }, 7000);
    }

    function checkReadyState() { if (isDataLoaded && isProgressFinished) revealWebsite(); }

    function revealWebsite() {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
            document.body.classList.remove('loading');
            document.documentElement.classList.remove('loading');
        }
    }

    // ─── TERMINAL TYPEWRITER ──────────────────────────────────────────────────────
    function startTerminalTypewriter() {
        const steps = [
            { text: 'npm install @ahmed-khaled/fullstack-kit', delay: 1000, color: 'green-text' },
            { text: 'added 128 packages in 1.2s',              delay: 900,  color: 'gray-text'  },
            { text: 'node -v',                                  delay: 700,  color: 'green-text' },
            { text: 'v24.0.0',                                  delay: 600,  color: 'white-text' },
            { text: 'ahmed --deploy --production',              delay: 1400, color: 'green-text' },
            { text: '✔ Building optimized production bundle...', delay: 900, color: 'white-text' },
            { text: '✔ Deploying to cloud infrastructure...',   delay: 900,  color: 'white-text' },
            { text: '✔ Platform live → https://ahmed.dev',      delay: 3500, color: 'gray-text'  }
        ];
        const body = document.getElementById('terminal-body-code');
        if (!body) return;
        let index = 0;
        function renderNext() {
            if (index >= steps.length) { body.innerHTML = ''; index = 0; }
            const step = steps[index];
            const prefix = step.color === 'green-text' ? '$ ' : '';
            body.insertAdjacentHTML('beforeend', `<div class="terminal-line ${step.color}">${prefix}${step.text}</div>`);
            body.scrollTop = body.scrollHeight;
            index++;
            setTimeout(renderNext, step.delay);
        }
        renderNext();
    }

    // ─── SCROLL OBSERVERS ─────────────────────────────────────────────────────────
    function bindScrollObservers() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); } });
        }, { threshold: 0.15 });
        document.querySelectorAll('.reveal').forEach(s => observer.observe(s));
    }

    // ─── GLOBAL REPO FETCH ───────────────────────────────────────────────────────
    async function loadGitHubRepos() {
        const container = document.getElementById('github-grid');
        if (!container) return;
        try {
            const res = await fetch(`${API_URL}/api/github`);
            const repos = await res.json();
            container.innerHTML = repos.map(repo => `
                <div class="glass-card" style="padding:24px;">
                    <h3 style="font-size:1.1rem; margin-bottom:8px;">${repo.name}</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary);">${repo.description}</p>
                    <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.75rem; color:var(--accent-cyan); font-weight:700;">${repo.language}</span>
                        <a href="${repo.url}" target="_blank" style="font-size:0.8rem; color:#fff;">View Repo →</a>
                    </div>
                </div>
            `).join('');
        } catch { container.innerHTML = 'Could not load repositories.'; }
    }

    // ─── GLOBAL MODALS ───────────────────────────────────────────────────────────
    window.openCertModal = (pdfUrl) => {
        const modal = document.getElementById('cert-modal');
        const body = document.getElementById('cert-modal-body');
        if (modal && body) { body.innerHTML = `<iframe src="${pdfUrl}" style="width:100%; height:80vh; border:none;"></iframe>`; modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    };
    window.closeCertModal = () => { const modal = document.getElementById('cert-modal'); if (modal) modal.classList.remove('active'); document.body.style.overflow = ''; };
    window.openProjectModal = (id) => {
        const p = projectsData.find(x => x.id === id);
        const modal = document.getElementById('project-modal');
        if (!p || !modal) return;
        document.getElementById('modal-title').textContent = currentLang === 'ar' ? (p.title_ar || p.title) : p.title;
        document.getElementById('modal-body').innerHTML = `
            <img src="${p.image}" style="width:100%; border-radius:12px; margin-bottom:20px;">
            <p>${currentLang === 'ar' ? (p.longDescription_ar || p.longDescription || p.description_ar || p.description) : (p.longDescription || p.description)}</p>
        `;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };
    window.closeProjectModal = () => { const modal = document.getElementById('project-modal'); if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; } };
    window.filterProjects = (cat, btn) => { currentFilter = cat; document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); renderProjects(); };
    window.slideTestimonials = (dir) => { const wrapper = document.getElementById('testimonials-wrapper'); if (!wrapper || testimonialsData.length === 0) return; testimonialsIndex = (testimonialsIndex + dir + testimonialsData.length) % testimonialsData.length; wrapper.style.transform = `translateX(-${testimonialsIndex * 100}%)`; };

    // ─── START ───────────────────────────────────────────────────────────────────
    startLoadingSequence();
    loadPortfolioData();
    loadGitHubRepos();
    startTerminalTypewriter();

    const searchInputEl = document.getElementById('project-search');
    if (searchInputEl) searchInputEl.oninput = () => { searchQuery = searchInputEl.value.toLowerCase(); renderProjects(); };
});