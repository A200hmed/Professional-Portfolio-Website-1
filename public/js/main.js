document.addEventListener('DOMContentLoaded', () => {
            // Global App State
            let portfolioData = null;
            let projectsData = [];
            let currentFilter = 'all';
            let searchQuery = '';
            let testimonialsIndex = 0;
            let testimonialsData = [];
            let currentLang = localStorage.getItem('portfolio-lang') || 'en';

            const API_URL = window.location.origin;

            // Element Refs
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

            // Navigation Active Tracking
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-links a');

            // Translation Dictionary
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
                    metricVideos: "YouTube Tutorials",
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
                    ytStatStudents: "Students",
                    ytStatVideos: "Tutorials Published",
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
                    langsSystems: "Systems & Tools"
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
                    metricVideos: "شروحات يوتيوب",
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
                    ytStatStudents: "طالب ومتابع",
                    ytStatVideos: "درس منشور",
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
                    langsSystems: "الأنظمة والأدوات"
                }
            };

            // ─── LANGUAGE SWITCHER ───────────────────────────────────────────────────────
            function setLanguage(lang) {
                localStorage.setItem('portfolio-lang', lang);
                currentLang = lang;

                // Set page direction and lang
                document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = lang;

                // Update toggle button text to show the opposite option
                if (langToggleBtn) {
                    langToggleBtn.textContent = lang === 'en' ? 'العربية' : 'English';
                }

                // Translate all static nodes
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

                // Re-render dynamic portfolio elements with active language
                if (portfolioData) {
                    const info = portfolioData.personalInfo;
                    if (info) {
                        if (titleEl) titleEl.textContent = lang === 'ar' ? (info.title_ar || info.title) : info.title;
                        if (bioEl) bioEl.textContent = lang === 'ar' ? (info.bio_ar || info.bio) : info.bio;
                        if (bioheroEl) bioheroEl.textContent = lang === 'ar' ? (info.bio_ar || info.bio) : info.bio;
                        if (contactLocEl) contactLocEl.textContent = lang === 'ar' ? (info.location_ar || info.location) : info.location;
                        if (avatarEl && info.avatar) avatarEl.src = info.avatar;
                        if (resumeBtn && info.resumeUrl && info.resumeUrl !== '#') {
                            resumeBtn.href = info.resumeUrl;
                            resumeBtn.target = "_blank";
                        }
                        if (heroResumeBtn && info.resumeUrl && info.resumeUrl !== '#') {
                            heroResumeBtn.href = info.resumeUrl;
                            heroResumeBtn.target = "_blank";
                        }

                        if (contactEmailEl) {
                            contactEmailEl.textContent = info.email;
                            contactEmailEl.href = `mailto:${info.email}`;
                        }
                        if (contactWhatsappEl && info.whatsapp) {
                            contactWhatsappEl.href = info.whatsapp;
                        }
                        if (ytChannelLink && info.youtubeUrl) {
                            ytChannelLink.href = info.youtubeUrl;
                        }

                        // Footer
                        const footerLogo = document.querySelector('.footer-logo');
                        if (footerLogo) footerLogo.innerHTML = `${lang === 'ar' ? (info.name_ar || info.name) : info.name} <span></span>`;
                        const footerCopy = document.querySelector('.footer-copy');
                        if (footerCopy) {
                            footerCopy.textContent = lang === 'ar' ?
                                `© 2026 ${info.name_ar || info.name}. جميع الحقوق محفوظة. | مهندس برمجيات وصانع محتوى تعليمي` :
                                `© 2026 ${info.name}. All Rights Reserved. | Software Engineer & Educational Content Creator`;
                        }

                        // Social icons in contact section
                        renderSocialLinks(info, document.querySelector('.social-links'));

                        // Hero social quick links
                        renderHeroSocials(info);
                    }

                    if (portfolioData.skills && portfolioData.skills.length > 0) renderSkills(portfolioData.skills);
                    if (portfolioData.languages && portfolioData.languages.length > 0) renderLanguages(portfolioData.languages);
                    if (portfolioData.timeline && portfolioData.timeline.length > 0) renderTimeline(portfolioData.timeline);
                    if (portfolioData.achievements && portfolioData.achievements.length > 0) renderAchievements(portfolioData.achievements);
                    if (portfolioData.testimonials && portfolioData.testimonials.length > 0) {
                        testimonialsData = portfolioData.testimonials;
                        renderTestimonials();
                    }
                    if (portfolioData.certificates && portfolioData.certificates.length > 0) renderCertificates(portfolioData.certificates);
                    if (portfolioData.youtubeVideos && portfolioData.youtubeVideos.length > 0) renderYouTube(portfolioData.youtubeVideos, portfolioData.personalInfo);
                    renderProjects();
                }
            }

            // ─── MAIN BOOT ───────────────────────────────────────────────────────────────
            async function loadPortfolioData() {
                try {
                    const res = await fetch(`${API_URL}/api/settings`);
                    portfolioData = await res.json();

                    // Update stats from database
                    const stats = portfolioData.personalInfo ? .stats || {};
                    if (stats.students) {
                        const el = document.getElementById('stat-students');
                        if (el) el.textContent = stats.students;
                    }
                    if (stats.tutorials) {
                        const el = document.getElementById('yt-stat-tutorials');
                        if (el) el.textContent = stats.tutorials;
                    }
                    if (stats.views) {
                        const el = document.getElementById('yt-stat-views');
                        if (el) el.textContent = stats.views;
                    }
                    if (stats.students) {
                        const el = document.getElementById('yt-stat-students');
                        if (el) el.textContent = stats.students;
                    }

                    // Update YouTube section from database
                    const yt = portfolioData.personalInfo ? .youtube || {};
                    if (yt.title) {
                        const el = document.getElementById('yt-section-title');
                        if (el) el.textContent = yt.title;
                    }
                    if (yt.description) {
                        const el = document.getElementById('yt-section-desc');
                        if (el) el.textContent = yt.description;
                    }
                    if (yt.badgeImage) {
                        const el = document.getElementById('yt-badge-img');
                        if (el) el.src = yt.badgeImage;
                    }

                    // Update avatar from database
                    const info = portfolioData.personalInfo || {};
                    if (info.avatar) {
                        const el = document.getElementById('dev-avatar');
                        if (el) el.src = info.avatar;
                    }

                    // Fetch projects
                    await loadProjects();

                    // Set initial language
                    setLanguage(currentLang);

                    // Setup language toggle button event listener
                    if (langToggleBtn) {
                        langToggleBtn.addEventListener('click', () => {
                            const nextLang = currentLang === 'en' ? 'ar' : 'en';
                            setLanguage(nextLang);
                        });
                    }

                    bindScrollObservers();
                } catch (error) {
                    console.error('Failed to load portfolio data:', error);
                }
            }

            // ─── SOCIAL LINKS RENDER ─────────────────────────────────────────────────────
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
      { url: info.githubUrl,    icon: svgGithub(),    label: 'GitHub'    },
      { url: info.linkedinUrl,  icon: svgLinkedin(),  label: 'LinkedIn'  },
      { url: info.youtubeUrl,   icon: svgYoutube(),   label: 'YouTube'   },
      { url: info.whatsapp,     icon: svgWhatsapp(),  label: 'WhatsApp'  },
      { url: info.facebookUrl,  icon: svgFacebook(),  label: 'Facebook'  },
      { url: info.telegramUrl,  icon: svgTelegram(),  label: 'Telegram'  },
    ].filter(l => l.url);

    container.innerHTML = links.map(l => `
      <a href="${l.url}" target="_blank" title="${l.label}" style="
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 18px; border-radius: 20px;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.85rem; font-weight: 500;
        transition: all 0.25s ease;
      " onmouseover="this.style.borderColor='rgba(56,189,248,0.3)'; this.style.color='var(--accent-cyan)';"
         onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'; this.style.color='var(--text-secondary)';">
        ${l.icon} ${l.label}
      </a>
    `).join('');
  }

  // ─── SVG ICON HELPERS ─────────────────────────────────────────────────────────
  function svgGithub()    { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`; }
  function svgLinkedin()  { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>`; }
  function svgYoutube()   { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"></polygon></svg>`; }
  function svgTwitter()   { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>`; }
  function svgFacebook()  { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`; }
  function svgInstagram() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>`; }
  function svgTelegram()  { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`; }
  function svgWhatsapp()  { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`; }

  // ─── SKILLS ───────────────────────────────────────────────────────────────────
  function renderSkills(skills) {
    const containers = {
      dev:           document.getElementById('skills-dev'),
      networking:    document.getElementById('skills-networking'),
      ai:            document.getElementById('skills-ai'),
      cybersecurity: document.getElementById('skills-cybersecurity')
    };
    Object.values(containers).forEach(el => { if (el) el.innerHTML = ''; });

    skills.forEach(skill => {
      const container = containers[skill.category];
      if (!container) return;
      const label = currentLang === 'ar' ? (skill.name_ar || skill.name) : skill.name;
      container.insertAdjacentHTML('beforeend', `<span class="skill-pill">${label}</span>`);
    });
  }

  // ─── PROGRAMMING LANGUAGES ───────────────────────────────────────────────────
  function renderLanguages(langs) {
    const containers = {
      frontend: document.getElementById('languages-frontend-grid'),
      backend:  document.getElementById('languages-backend-grid'),
      mobile:   document.getElementById('languages-mobile-grid'),
      systems:  document.getElementById('languages-systems-grid')
    };

    const groupWrappers = {
      frontend: document.getElementById('group-lang-frontend'),
      backend:  document.getElementById('group-lang-backend'),
      mobile:   document.getElementById('group-lang-mobile'),
      systems:  document.getElementById('group-lang-systems')
    };

    // Reset grids
    Object.values(containers).forEach(el => { if (el) el.innerHTML = ''; });
    // Hide all wrappers by default, we will show them only if they have entries
    Object.values(groupWrappers).forEach(el => { if (el) el.style.display = 'none'; });

    langs.forEach(lang => {
      const cat = lang.category || 'backend';
      const grid = containers[cat];
      const wrapper = groupWrappers[cat];
      if (!grid) return;

      // Show the wrapper since it has at least one language card
      if (wrapper) wrapper.style.display = 'block';

      const displayName = currentLang === 'ar' ? (lang.name_ar || lang.name) : lang.name;
      const color = lang.color || '#38bdf8';
      // Convert hex color to rgba for subtle backgrounds
      const hexToRgb = hex => {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `${r},${g},${b}`;
      };
      const rgb = hexToRgb(color);
      const levelLabel = lang.level >= 90 ? (currentLang === 'ar' ? 'متقن' : 'Expert')
                       : lang.level >= 80 ? (currentLang === 'ar' ? 'متقدم' : 'Advanced')
                       : lang.level >= 70 ? (currentLang === 'ar' ? 'جيد جداً' : 'Proficient')
                       : (currentLang === 'ar' ? 'متوسط' : 'Intermediate');

      const cardHtml = `
        <div class="lang-card" style="--lang-color: ${color}; --lang-color-bg: rgba(${rgb},0.08); --lang-color-border: rgba(${rgb},0.2);">
          <div class="lang-card-header">
            <div class="lang-icon">${lang.icon || '💻'}</div>
            <span class="lang-name">${displayName}</span>
            <span class="lang-level-pct">${lang.level}%</span>
          </div>
          <div class="lang-bar-bg">
            <div class="lang-bar-fill" data-target="${lang.level}"></div>
          </div>
          <div class="lang-label">${levelLabel}</div>
        </div>
      `;
      grid.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Animate bars when they scroll into view
    const allBars = document.querySelectorAll('.lang-bar-fill');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          bar.style.width = bar.dataset.target + '%';
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });
    allBars.forEach(bar => observer.observe(bar));
  }

  // ─── TIMELINE ─────────────────────────────────────────────────────────────────
  function renderTimeline(items) {
    const container = document.getElementById('timeline-list');
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
      const typeIcon = item.type === 'education' ? '🎓' : '💼';
      const displayRole    = currentLang === 'ar' ? (item.role_ar    || item.role)    : item.role;
      const displayCompany = currentLang === 'ar' ? (item.company_ar || item.company) : item.company;
      const displayDesc    = currentLang === 'ar' ? (item.description_ar || item.description) : item.description;
      container.insertAdjacentHTML('beforeend', `
        <div class="timeline-item">
          <div class="timeline-dot" title="${item.type}"></div>
          <div class="timeline-meta">
            <span class="timeline-duration">${item.duration}</span>
            <span class="timeline-role">${typeIcon} ${displayRole}</span>
          </div>
          <div class="timeline-company">${displayCompany}</div>
          <p class="timeline-desc">${displayDesc}</p>
        </div>
      `);
    });
  }

  // ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
  function renderAchievements(achievements) {
    const container = document.getElementById('achievements-grid');
    if (!container) return;
    container.innerHTML = '';

    achievements.forEach(item => {
      let iconSymbol = '★';
      if (item.icon === 'award') iconSymbol = '🏆';
      else if (item.icon === 'shield') iconSymbol = '🛡️';
      else if (item.icon === 'cpu') iconSymbol = '💻';

      const displayTitle  = currentLang === 'ar' ? (item.title_ar  || item.title)  : item.title;
      const displayIssuer = currentLang === 'ar' ? (item.issuer_ar || item.issuer) : item.issuer;

      container.insertAdjacentHTML('beforeend', `
        <div class="glass-card text-center" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 28px;">
          <div style="font-size: 2.5rem; margin-bottom: 16px;">${iconSymbol}</div>
          <h3 class="text-gradient" style="font-size: 1.1rem; margin-bottom: 8px; font-weight:700;">${displayTitle}</h3>
          <div style="color: var(--accent-cyan); font-size: 0.85rem; font-weight:600; margin-bottom: 4px;">${displayIssuer}</div>
          <div style="color: var(--text-muted); font-size: 0.8rem;">${item.year}</div>
        </div>
      `);
    });

    const awardCountEl = document.getElementById('count-awards');
    if (awardCountEl) awardCountEl.textContent = achievements.length;
  }

  // ─── CERTIFICATES ─────────────────────────────────────────────────────────────
  function renderCertificates(certificates) {
    const container = document.getElementById('certificates-grid');
    if (!container) return;
    container.innerHTML = '';

    const countEl = document.getElementById('count-certs');
    if (countEl) countEl.textContent = certificates.length;

    certificates.forEach(cert => {
      const displayTitle = currentLang === 'ar' ? (cert.title_ar || cert.title) : cert.title;
      const isPdf = cert.image.toLowerCase().endsWith('.pdf');
      
      // Use Google Docs Viewer to preview PDF as an image
      const previewUrl = isPdf 
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + cert.image)}&embedded=true`
        : cert.image;

      const previewHtml = isPdf 
        ? `<iframe src="${previewUrl}" class="cert-carousel-img" style="border: none; pointer-events: none;"></iframe>`
        : `<img src="${cert.image}" alt="${displayTitle}" class="cert-carousel-img" loading="lazy">`;

      container.insertAdjacentHTML('beforeend', `
        <a href="${cert.image}" target="_blank" class="cert-carousel-card" style="text-decoration: none; cursor: pointer;">
          <div class="cert-img-container">
            ${previewHtml}
            <div class="cert-overlay">
              <span>🔍 View Full PDF</span>
            </div>
          </div>
          <div class="cert-carousel-label">
            <span class="cert-carousel-emoji">🏆</span>
            <span class="cert-carousel-title">${displayTitle}</span>
          </div>
        </a>
      `);
    });
  }

  // ─── YOUTUBE ──────────────────────────────────────────────────────────────────
  // Arabic category mapping for YouTube video categories
  const ytCategoryAr = {
    'Backend':      'برمجيات خلفية',
    'Frontend':     'واجهة أمامية',
    'Full-Stack':   'شامل',
    'Software Design': 'تصميم البرمجيات',
    'DevOps':       'DevOps',
    'Tools':        'أدوات'
  };

  function renderYouTube(videos, info) {
    const container = document.getElementById('youtube-grid');
    if (!container) return;
    container.innerHTML = '';

    const countEl = document.getElementById('count-videos');
    if (countEl) countEl.textContent = videos.length + '+';

    videos.forEach(video => {
      const displayTitle    = currentLang === 'ar' ? (video.title_ar || video.title) : video.title;
      const displayCategory = currentLang === 'ar'
        ? (ytCategoryAr[video.category] || video.category)
        : video.category;
      // Translate view count label: "120K Views" → "120K مشاهدة"
      const displayViews = currentLang === 'ar'
        ? video.views.replace(/\s*Views?/i, ' مشاهدة')
        : video.views;

      container.insertAdjacentHTML('beforeend', `
        <a href="${video.url}" target="_blank" class="yt-card glass-card" style="text-decoration:none; display:flex; flex-direction:column; cursor:pointer;">
          <div class="yt-thumb-wrap">
            <img src="${video.thumbnail}" alt="${displayTitle}" class="yt-thumb" loading="lazy">
            <div class="yt-play-btn">▶</div>
            <span class="yt-category-badge">${displayCategory}</span>
          </div>
          <div style="padding: 20px 0 4px;">
            <h3 class="yt-title">${displayTitle}</h3>
            <div class="yt-views">${displayViews}</div>
          </div>
        </a>
      `);
    });
  }

  // ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
  const testimonialsWrapper = document.getElementById('testimonials-wrapper');
  function renderTestimonials() {
    if (!testimonialsWrapper || testimonialsData.length === 0) return;
    testimonialsWrapper.innerHTML = '';
    testimonialsData.forEach(item => {
      const displayMessage = currentLang === 'ar' ? (item.message_ar || item.message) : item.message;
      testimonialsWrapper.insertAdjacentHTML('beforeend', `
        <div class="glass-card testimonial-card">
          <div class="testimonial-quote">"${displayMessage}"</div>
          <div class="testimonial-profile">
            <img src="${item.avatar}" alt="${item.name}" class="testimonial-avatar">
            <div>
              <div class="testimonial-name">${item.name}</div>
              <div class="testimonial-role-company">${item.role} @ ${item.company}</div>
            </div>
          </div>
        </div>
      `);
    });
  }

  window.slideTestimonials = function(direction) {
    if (testimonialsData.length === 0) return;
    const isMobile = window.innerWidth < 768;
    const cardsPerSlide = isMobile ? 1 : 2;
    const maxIndex = Math.ceil(testimonialsData.length / cardsPerSlide) - 1;

    testimonialsIndex += direction;
    if (testimonialsIndex < 0)          testimonialsIndex = maxIndex;
    if (testimonialsIndex > maxIndex)   testimonialsIndex = 0;

    testimonialsWrapper.style.transform = `translateX(-${testimonialsIndex * 100}%)`;
  };

  // ─── PROJECTS ─────────────────────────────────────────────────────────────────
  async function loadProjects() {
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      projectsData = await res.json();

      const countEl = document.getElementById('count-projects');
      if (countEl) countEl.textContent = projectsData.length;

      renderProjects();
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  window.filterProjects = function(category, tabElement) {
    currentFilter = category;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tabElement.classList.add('active');
    renderProjects();
  };

  // Live Search Binding
  const searchInput = document.getElementById('project-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      renderProjects();
    });
  }

  const projectsGrid = document.getElementById('projects-grid');
  function renderProjects() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    const t = uiTranslations[currentLang];

    let filtered = currentFilter === 'all'
      ? projectsData
      : projectsData.filter(p => p.category === currentFilter);

    if (searchQuery) {
      filtered = filtered.filter(p => {
        const inTitle   = p.title.toLowerCase().includes(searchQuery);
        const inTitleAr = (p.title_ar || '').toLowerCase().includes(searchQuery);
        const inTags    = p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchQuery));
        return inTitle || inTitleAr || inTags;
      });
    }

    if (filtered.length === 0) {
      projectsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 60px; color: var(--text-secondary);">
          <div style="font-size: 2rem; margin-bottom: 12px;">🔍</div>
          ${t.noProjectsFound}
        </div>
      `;
      return;
    }

    filtered.forEach((p, i) => {
      const displayTitle = currentLang === 'ar' ? (p.title_ar || p.title) : p.title;
      const displayDesc  = currentLang === 'ar' ? (p.description_ar || p.description) : p.description;
      const tagsHTML     = p.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');
      projectsGrid.insertAdjacentHTML('beforeend', `
        <div class="glass-card project-card" style="opacity:0; transform:translateY(20px); animation: fadeUpIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s forwards;">
          <img src="${p.image}" alt="${displayTitle}" class="project-image" loading="lazy">
          <div class="project-tags">${tagsHTML}</div>
          <h3 class="project-title text-gradient">${displayTitle}</h3>
          <p class="project-desc">${displayDesc}</p>
          <div class="project-links">
            <button onclick="openProjectModal('${p.id}')" class="btn btn-secondary" style="padding: 8px 20px; font-size:0.85rem;">${t.learnMore}</button>
            ${p.demoUrl && p.demoUrl !== '#' ? `<a href="${p.demoUrl}" target="_blank" class="btn btn-primary" style="padding: 8px 20px; font-size:0.85rem;">${t.liveDemo}</a>` : ''}
          </div>
        </div>
      `);
    });
  }

  // Inject fade animation
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `@keyframes fadeUpIn { to { opacity:1; transform:translateY(0); } }`;
  document.head.appendChild(styleEl);

  // ─── PROJECT MODAL ────────────────────────────────────────────────────────────
  const modalOverlay = document.getElementById('project-modal');
  const modalBody    = document.getElementById('modal-body');
  const modalTitle   = document.getElementById('modal-title');

  window.openProjectModal = function(id) {
    const project = projectsData.find(p => p.id === id);
    if (!project || !modalOverlay) return;

    const t = uiTranslations[currentLang];

    const displayTitle       = currentLang === 'ar' ? (project.title_ar || project.title) : project.title;
    const displayLongDesc    = currentLang === 'ar'
      ? (project.longDescription_ar || project.longDescription || project.description_ar || project.description)
      : (project.longDescription || project.description);
    const displayFeatures    = currentLang === 'ar' ? (project.features_ar || project.features) : project.features;

    modalTitle.textContent = displayTitle;

    const featuresHTML = displayFeatures && displayFeatures.length > 0
      ? `<h4 style="margin-top:24px; margin-bottom:12px; font-family:var(--font-heading);">${t.keyFeatures}</h4>
         <ul>${displayFeatures.map(f => `<li>${f}</li>`).join('')}</ul>`
      : '';

    modalBody.innerHTML = `
      <img src="${project.image}" alt="${displayTitle}" loading="lazy">
      <p style="color:var(--text-secondary); font-size:1rem; line-height:1.7; margin-bottom:20px;">${displayLongDesc}</p>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:24px;">
        ${project.tags.map(tag => `<span class="project-tag" style="font-size:0.8rem; padding:6px 14px;">${tag}</span>`).join('')}
      </div>
      ${featuresHTML}
      <div style="display:flex; gap:16px; margin-top:28px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px;">
        ${project.demoUrl && project.demoUrl !== '#' ? `<a href="${project.demoUrl}" target="_blank" class="btn btn-primary">${t.visitLivePlatform}</a>` : ''}
        ${project.githubUrl && project.githubUrl !== '#' ? `<a href="${project.githubUrl}" target="_blank" class="btn btn-secondary">${t.viewSourceCode}</a>` : ''}
      </div>
    `;

    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeProjectModal = function() {
    if (modalOverlay) { modalOverlay.style.display = 'none'; document.body.style.overflow = ''; }
  };

  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeProjectModal(); });
  }

  // ─── GITHUB REPOS ─────────────────────────────────────────────────────────────
  async function loadGitHubRepos() {
    const container = document.getElementById('github-grid');
    if (!container) return;
    try {
      const res   = await fetch(`${API_URL}/api/github`);
      const repos = await res.json();
      container.innerHTML = '';
      repos.forEach(repo => {
        container.insertAdjacentHTML('beforeend', `
          <div class="glass-card" style="padding:24px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                ${svgGithub()}
                <div style="display:flex; align-items:center; gap:4px; font-size:0.85rem; color:var(--text-muted); font-weight:600;">
                  <span style="color:var(--accent-purple);">★</span> ${repo.stars}
                </div>
              </div>
              <h3 style="font-size:1.1rem; margin-bottom:8px; font-family:var(--font-heading); font-weight:700;">${repo.name}</h3>
              <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; margin-bottom:16px;">${repo.description}</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid rgba(255,255,255,0.02); padding-top:12px;">
              <span style="font-size:0.75rem; font-weight:700; color:var(--accent-cyan); text-transform:uppercase;">${repo.language}</span>
              <a href="${repo.url}" target="_blank" style="color:var(--text-primary); text-decoration:none; font-size:0.8rem; font-weight:600;">View Repo →</a>
            </div>
          </div>
        `);
      });
    } catch {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-muted);">Could not load repositories.</div>`;
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
      const step   = steps[index];
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
    // Active nav link highlight
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    }, { threshold: 0.3 });

    sections.forEach(s => observer.observe(s));

    // Skill bars animation on scroll into view
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
      const skillsObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            document.querySelectorAll('.skill-level-fill').forEach(fill => {
              fill.style.width = `${fill.getAttribute('data-level')}%`;
            });
            skillsObs.unobserve(skillsSection);
          }
        });
      }, { threshold: 0.1 });
      skillsObs.observe(skillsSection);
    }
  }

  // ─── CONTACT FORM ─────────────────────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  const statusMsg   = document.getElementById('status-msg');

  if (contactForm && statusMsg) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name    = document.getElementById('form-name').value.trim();
      const email   = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      const t = uiTranslations[currentLang];

      statusMsg.className = 'status-msg';
      statusMsg.style.display = 'block';
      statusMsg.textContent = t.sendingMsg;

      try {
        const res  = await fetch(`${API_URL}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message })
        });
        const data = await res.json();
        if (res.ok) {
          statusMsg.classList.add('success');
          statusMsg.textContent = t.msgSuccess;
          contactForm.reset();
        } else {
          statusMsg.classList.add('error');
          statusMsg.textContent = data.error || t.msgError;
        }
      } catch {
        statusMsg.className = 'status-msg error';
        statusMsg.textContent = t.connError;
      }
    });
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────────
  loadPortfolioData();
  loadGitHubRepos();
  startTerminalTypewriter();
});