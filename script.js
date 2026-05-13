(function () {
    var translations = {
        nav_about: { en: 'About', ru: 'Обо мне' },
        nav_services: { en: 'Services', ru: 'Услуги' },
        nav_results: { en: 'Results', ru: 'Результаты' },
        nav_expertise: { en: 'AI Expertise', ru: 'AI-экспертиза' },
        nav_contact: { en: 'Contact', ru: 'Связаться' },
        hero_title: {
            en: 'Deep engineering<br>expertise combined<br><span class="accent-text">with modern AI</span>',
            ru: 'Глубокая инженерная<br>экспертиза в сочетании<br><span class="accent-text">с современным AI</span>'
        },
        hero_typing: {
            en: '9+ years of real development experience. LLM integration into business processes. I don\'t seek easy paths — I choose optimal ones.',
            ru: '9+ лет реального опыта разработки. Интеграция LLM в бизнес-процессы. Не ищу лёгких путей — выбираю оптимальные.'
        },
        hero_btn_primary: { en: 'Discuss a project', ru: 'Обсудить проект' },
        hero_btn_ghost: { en: 'View results', ru: 'Смотреть результаты' },
        about_title: {
            en: 'Not just a developer,<br><span class="accent-text">but a solutions engineer</span>',
            ru: 'Не просто разработчик,<br><span class="accent-text">а инженер решений</span>'
        },
        about_card1_title: { en: '9+ Years of Experience', ru: '9+ лет опыта' },
        about_card1_text: {
            en: 'Real commercial development. From simple landing pages to complex distributed systems. Every project raises the bar.',
            ru: 'Реальная коммерческая разработка. От простых лендингов до сложных распределённых систем. Каждый проект — новый уровень экспертизы.'
        },
        about_card2_title: { en: 'Optimal Solutions', ru: 'Оптимальные решения' },
        about_card2_text: {
            en: 'I don\'t take easy paths — I choose the most effective ways to achieve goals. Technically complex tasks are my element.',
            ru: 'Не ищу лёгких путей — выбираю оптимальные для достижения целей максимально эффективно. Технически сложные задачи — мой элемент.'
        },
        about_card3_title: { en: 'AI Every Day', ru: 'AI каждый день' },
        about_card3_text: {
            en: 'I work with LLMs daily. Not a theorist — a practitioner. I train colleagues to use language models effectively. This work drives me.',
            ru: 'Работаю с LLM ежедневно. Не теоретик — практик. Обучаю коллег эффективной работе с языковыми моделями. Меня драйвит эта работа.'
        },
        services_title: {
            en: 'What I<br><span class="accent-text">do best</span>',
            ru: 'Что я<br><span class="accent-text">делаю лучше всего</span>'
        },
        service1_title: { en: 'AI Integration for Business', ru: 'AI-интеграция в бизнес' },
        service1_text: {
            en: 'Implementing intelligent LLM-based systems into business processes. From needs analysis to production-ready solutions.',
            ru: 'Внедрение интеллектуальных систем на базе LLM в бизнес-процессы компании. От анализа потребностей до рабочего решения в продакшене.'
        },
        service2_title: { en: 'PHP/Symfony Development', ru: 'PHP/Symfony разработка' },
        service2_text: {
            en: 'Designing and developing high-load systems. Messaging services, VoIP provider integrations, enterprise platforms.',
            ru: 'Проектирование и разработка высоконагруженных систем. Сервисы рассылок, интеграции с VoIP-провайдерами, корпоративные платформы.'
        },
        service3_title: { en: 'Enterprise Solutions', ru: 'Корпоративные решения' },
        service3_text: {
            en: 'Building systems from simple landing pages to complex multi-component applications. Technical leadership and team mentoring.',
            ru: 'Создание систем от простых лендингов до сложных многокомпонентных приложений. Техническое лидерство и менторство команды.'
        },
        service4_title: { en: 'AI Training', ru: 'Обучение работе с AI' },
        service4_text: {
            en: 'Running internal meetups, training colleagues to use LLMs effectively. Boosting the entire team\'s productivity.',
            ru: 'Проведение внутренних митапов, обучение коллег эффективному использованию LLM. Повышение продуктивности всей команды.'
        },
        results_title: {
            en: 'Real projects,<br><span class="accent-text">real results</span>',
            ru: 'Реальные проекты,<br><span class="accent-text">реальные результаты</span>'
        },
        result1_label: { en: 'delivery speed', ru: 'скорость доставки' },
        result1_title: { en: 'SMS & Email Broadcasting Services', ru: 'Сервисы SMS и Email-рассылок' },
        result1_text: {
            en: 'Designed and deployed broadcasting services on PHP/Symfony. Optimized the architecture, increasing message delivery speed by 30%.',
            ru: 'Спроектировал и развернул сервисы рассылок на PHP/Symfony. Оптимизировал архитектуру, что позволило увеличить скорость доставки сообщений на 30%.'
        },
        result2_label: { en: 'integration', ru: 'интеграция' },
        result2_title: { en: 'VoIP Telephony Integration', ru: 'Интеграция VoIP-телефонии' },
        result2_text: {
            en: 'Successfully integrated internal communications with VoIP telephony providers. Ensured seamless interaction between systems.',
            ru: 'Успешно интегрировал внутренние коммуникации с провайдерами VoIP-телефонии. Обеспечил бесшовное взаимодействие между системами.'
        },
        result3_label: { en: 'for call center', ru: 'для call-центра' },
        result3_title: { en: 'AI System for Operators', ru: 'AI-система для операторов' },
        result3_text: {
            en: 'Created an AI-based system that simplifies call-center operators\' work. Improved customer support quality and reduced company costs.',
            ru: 'Создал систему на основе ИИ, облегчающую работу операторов call-центра. Улучшил качество клиентской поддержки и сократил затраты компании.'
        },
        result4_label: { en: 'years of projects', ru: 'года проектов' },
        result4_title: { en: 'Full Range of Solutions', ru: 'Полный спектр решений' },
        result4_text: {
            en: 'Over the past two years, built numerous solutions in corporate development — from simple landing pages to complex multi-component applications.',
            ru: 'За последние два года создал множество решений в рамках корпоративных разработок — от простых лендингов до сложных многокомпонентных приложений.'
        },
        expertise_title: {
            en: 'Not a "site in one prompt" —<br><span class="accent-text">an engineering approach to AI</span>',
            ru: 'Не «сайт за один промпт» —<br><span class="accent-text">инженерный подход к AI</span>'
        },
        feature1_title: { en: 'Attention to Detail', ru: 'Внимание к деталям' },
        feature1_text: {
            en: 'Every line of code undergoes rigorous review. Quality is non-negotiable.',
            ru: 'Каждая строка кода проходит пристальный контроль. Качество — не переговорная позиция.'
        },
        feature2_title: { en: 'Daily Practice', ru: 'Ежедневная практика' },
        feature2_text: {
            en: 'LLMs aren\'t a hobby — they\'re a work tool. I use them daily, refining my approaches.',
            ru: 'LLM — не хобби, а рабочий инструмент. Использую каждый день, совершенствую подходы.'
        },
        feature3_title: { en: 'Team Training', ru: 'Обучение команды' },
        feature3_text: {
            en: 'Sharing knowledge with colleagues. Running meetups and workshops on effective AI usage.',
            ru: 'Передаю знания коллегам. Провожу митапы и воркшопы по эффективной работе с AI.'
        },
        feature4_title: { en: 'Own Project', ru: 'Собственный проект' },
        feature4_text: {
            en: 'Currently leading my own project that reflects all accumulated experience in AI and development.',
            ru: 'Сейчас веду собственный проект, отражающий весь накопленный опыт в AI и разработке.'
        },
        contact_title: {
            en: 'Ready to discuss<br><span class="accent-text">your project</span>',
            ru: 'Готов обсудить<br><span class="accent-text">ваш проект</span>'
        },
        contact_text: {
            en: 'If you need a specialist who combines deep technical expertise with understanding of AI — let\'s talk.',
            ru: 'Если вам нужен специалист, который сочетает глубокую техническую экспертизу с пониманием AI — давайте поговорим.'
        },
        contact_terminal_status: {
            en: 'available for projects',
            ru: 'доступен для проектов'
        },
        contact_terminal_response: {
            en: 'within 24 hours',
            ru: 'в течение 24 часов'
        },
        contact_terminal_languages: {
            en: 'Russian, English',
            ru: 'русский, english'
        },
        footer_legal: {
            en: '2026. All rights reserved.',
            ru: '2026. Все права защищены.'
        },
        meta_description: {
            en: 'AI specialist and PHP developer with 9 years of experience. AI integration into business processes, enterprise solutions development.',
            ru: 'AI-специалист и PHP-разработчик с 9-летним опытом. Интеграция искусственного интеллекта в бизнес-процессы, разработка корпоративных решений.'
        },
        og_description: {
            en: 'Deep engineering expertise combined with modern AI. 9+ years of development experience.',
            ru: 'Глубокая инженерная экспертиза в сочетании с современным AI. 9+ лет опыта разработки.'
        },
        page_title: {
            en: 'MILINSKY — AI Specialist / PHP Developer',
            ru: 'MILINSKY — AI Специалист / PHP Разработчик'
        },
        aria_burger: {
            en: 'Open menu',
            ru: 'Открыть меню'
        },
        aria_theme: {
            en: 'Toggle theme',
            ru: 'Переключить тему'
        },
        aria_lang: {
            en: 'Switch language',
            ru: 'Сменить язык'
        }
    };

    var html = document.documentElement;
    var storedLang = localStorage.getItem('lang');
    var currentLang = storedLang || 'en';

    html.setAttribute('lang', currentLang);

    function applyLanguage(lang) {
        currentLang = lang;
        html.setAttribute('lang', lang);

        var elements = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < elements.length; i++) {
            var key = elements[i].getAttribute('data-i18n');
            if (translations[key] && translations[key][lang]) {
                elements[i].textContent = translations[key][lang];
            }
        }

        var htmlElements = document.querySelectorAll('[data-i18n-html]');
        for (var j = 0; j < htmlElements.length; j++) {
            var hKey = htmlElements[j].getAttribute('data-i18n-html');
            if (translations[hKey] && translations[hKey][lang]) {
                htmlElements[j].innerHTML = translations[hKey][lang];
            }
        }

        if (translations.meta_description && translations.meta_description[lang]) {
            var metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', translations.meta_description[lang]);
        }
        if (translations.og_description && translations.og_description[lang]) {
            var ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', translations.og_description[lang]);
        }
        if (translations.page_title && translations.page_title[lang]) {
            document.title = translations.page_title[lang];
        }

        var burger = document.getElementById('navBurger');
        if (burger && translations.aria_burger && translations.aria_burger[lang]) {
            burger.setAttribute('aria-label', translations.aria_burger[lang]);
        }

        var themeToggle = document.getElementById('themeToggle');
        if (themeToggle && translations.aria_theme && translations.aria_theme[lang]) {
            themeToggle.setAttribute('aria-label', translations.aria_theme[lang]);
        }

        var langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.querySelector('.lang-toggle__text').textContent = lang.toUpperCase();
            if (translations.aria_lang && translations.aria_lang[lang]) {
                langToggle.setAttribute('aria-label', translations.aria_lang[lang]);
            }
        }
    }

    applyLanguage(currentLang);

    var langToggleBtn = document.getElementById('langToggle');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', function () {
            var nextLang = currentLang === 'en' ? 'ru' : 'en';
            localStorage.setItem('lang', nextLang);
            applyLanguage(nextLang);
            restartTyping();
        });
    }

    var storedTheme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    html.setAttribute('data-theme', initialTheme);

    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var current = html.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }

    var burger = document.getElementById('navBurger');
    var navList = document.getElementById('navList');
    var header = document.getElementById('header');

    function toggleMenu() {
        var isOpen = burger.classList.toggle('active');
        navList.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
        burger.classList.remove('active');
        navList.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    burger.addEventListener('click', toggleMenu);

    var navLinks = navList.querySelectorAll('.nav__link');
    navLinks.forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
        if (navList.classList.contains('open') && !navList.contains(e.target) && !burger.contains(e.target)) {
            closeMenu();
        }
    });

    var typingElement = document.getElementById('typingText');
    var typingIndex = 0;
    var typingDelay = 40;
    var typingStarted = false;
    var typingTimeout = null;

    function getTypingText() {
        if (translations.hero_typing && translations.hero_typing[currentLang]) {
            return translations.hero_typing[currentLang];
        }
        return translations.hero_typing.en;
    }

    function startTyping() {
        if (typingStarted) return;
        typingStarted = true;
        typeNextChar();
    }

    function typeNextChar() {
        var text = getTypingText();
        if (typingIndex < text.length) {
            typingElement.textContent = text.substring(0, typingIndex + 1);
            typingIndex++;
            typingTimeout = setTimeout(typeNextChar, typingDelay);
        }
    }

    function restartTyping() {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
        typingElement.textContent = '';
        typingIndex = 0;
        typingStarted = false;
        if (document.querySelector('.hero__subtitle.is-visible') || document.querySelector('.hero.animate-on-scroll.is-visible')) {
            setTimeout(startTyping, 300);
        }
    }

    var animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var delay = Array.from(animatedElements).indexOf(entry.target) % 6;
                        entry.target.style.transitionDelay = delay * 0.08 + 's';
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);

                        if (entry.target.querySelector('#typingText') || entry.target.closest('.hero')) {
                            if (!typingStarted) {
                                setTimeout(startTyping, 600);
                            }
                        }
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -40px 0px',
            }
        );

        animatedElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        animatedElements.forEach(function (el) {
            el.classList.add('is-visible');
        });
        startTyping();
    }

    var scrollIndicator = document.querySelector('.hero__scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        }, { passive: true });
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) {
            html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });

    var progressBar = document.getElementById('scrollProgressBar');
    var progressText = document.getElementById('scrollProgressText');

    if (progressBar && progressText) {
        window.addEventListener('scroll', function () {
            var scrollTop = window.scrollY;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
            progressBar.style.width = percent + '%';
            progressText.textContent = percent + '%';
        }, { passive: true });
    }

    var retroCards = document.querySelectorAll('.retro-card');
    for (var c = 0; c < retroCards.length; c++) {
        var scanline = document.createElement('span');
        scanline.className = 'card-scanline';
        scanline.setAttribute('aria-hidden', 'true');
        retroCards[c].appendChild(scanline);
    }

    var crtNoise = document.getElementById('crtNoise');
    if (crtNoise) {
        (function runNoise() {
            var delay = 3000 + Math.random() * 6000;
            setTimeout(function () {
                crtNoise.style.top = (Math.random() * 100) + 'vh';
                crtNoise.classList.remove('crt-noise--active');
                void crtNoise.offsetWidth;
                crtNoise.classList.add('crt-noise--active');
                setTimeout(function () {
                    crtNoise.classList.remove('crt-noise--active');
                }, 250);
                runNoise();
            }, delay);
        })();
    }

    var sectionLabels = document.querySelectorAll('.section__label[data-section]');
    if (sectionLabels.length > 0) {
        var labelStatuses = ['[OK]', '[READY]', '[DONE]', '[PASS]'];
        (function rotateLabelStatus() {
            var delay = 4000 + Math.random() * 8000;
            setTimeout(function () {
                var idx = Math.floor(Math.random() * sectionLabels.length);
                var label = sectionLabels[idx];
                var section = label.getAttribute('data-section');
                var original = '\u003E section_0' + (idx + 1) + ' --' + section;
                var status = labelStatuses[Math.floor(Math.random() * labelStatuses.length)];
                label.textContent = original + ' ' + status;
                setTimeout(function () {
                    label.textContent = original;
                }, 800 + Math.random() * 600);
                rotateLabelStatus();
            }, delay);
        })();
    }

    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav__link');
    if (sections.length > 0 && navLinks.length > 0) {
        var activeNavObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    navLinks.forEach(function (link) {
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('nav__link--active');
                        } else {
                            link.classList.remove('nav__link--active');
                        }
                    });
                }
            });
        }, { threshold: 0.15, rootMargin: '-80px 0px -15% 0px' });
        sections.forEach(function (section) {
            activeNavObserver.observe(section);
        });
    }

    var scrollStatusEl = document.getElementById('scrollStatus');
    var sectionMap = { about: '0x1A2B', services: '0x3F7C', results: '0x5D9E', expertise: '0x8A21', contact: '0xC4F0' };
    var sectionNames = { about: 'about', services: 'services', results: 'results', expertise: 'expertise', contact: 'contact' };
    var lastVisibleSection = '';

    if (scrollStatusEl && sections.length > 0) {
        var statusObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    if (id !== lastVisibleSection && sectionMap[id]) {
                        lastVisibleSection = id;
                        var addr = sectionMap[id];
                        scrollStatusEl.innerHTML = '[SYS] LOAD MOD ' + addr + '.. OK<br>[IO] SEC \u2192 ' + sectionNames[id];
                        scrollStatusEl.classList.remove('scroll-status--visible');
                        void scrollStatusEl.offsetWidth;
                        scrollStatusEl.classList.add('scroll-status--visible');
                        setTimeout(function () {
                            scrollStatusEl.classList.remove('scroll-status--visible');
                        }, 1300);
                    }
                }
            });
        }, { threshold: 0.2, rootMargin: '-20% 0px -60% 0px' });
        sections.forEach(function (section) {
            statusObserver.observe(section);
        });
    }
})();
