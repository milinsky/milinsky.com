(function () {
    var eeManager = (function () {
        var discovered = [];
        try {
            var stored = localStorage.getItem('ee_discovered');
            if (stored) {
                discovered = JSON.parse(stored);
            }
        } catch (e) {
            discovered = [];
        }
        var rawSeed = sessionStorage.getItem('ee_session_seed');
        if (!rawSeed) {
            rawSeed = String(Math.random());
            sessionStorage.setItem('ee_session_seed', rawSeed);
        }
        var seedNum = parseFloat(rawSeed);
        function saveDiscovered() {
            try {
                localStorage.setItem('ee_discovered', JSON.stringify(discovered));
            } catch (e) {}
        }
        function discover(id) {
            if (discovered.indexOf(id) === -1) {
                discovered.push(id);
                saveDiscovered();
            }
        }
        function isDiscovered(id) {
            return discovered.indexOf(id) !== -1;
        }
        function getVisitCount() {
            var count = 0;
            try {
                var c = localStorage.getItem('ee_visit_count');
                if (c) {
                    count = parseInt(c, 10);
                }
            } catch (e) {}
            if (isNaN(count)) {
                count = 0;
            }
            count = count + 1;
            try {
                localStorage.setItem('ee_visit_count', String(count));
                if (count === 1) {
                    localStorage.setItem('ee_first_visit', new Date().toISOString());
                }
            } catch (e) {}
            return count;
        }
        function getSessionSeed() {
            return seedNum;
        }
        function getDailySeed() {
            var str = new Date().toDateString();
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash = hash & hash;
            }
            return Math.abs(hash);
        }
        return {
            discover: discover,
            isDiscovered: isDiscovered,
            getVisitCount: getVisitCount,
            getSessionSeed: getSessionSeed,
            getDailySeed: getDailySeed
        };
    })();

    var eeOriginalLogo = '';
    var eeLogoPre = document.querySelector('.nav__logo-ascii');
    if (eeLogoPre) {
        eeOriginalLogo = eeLogoPre.textContent;
    }

    var eeOriginalLogo = '';
    var eeLogoPre = document.querySelector('.nav__logo-ascii');
    if (eeLogoPre) {
        eeOriginalLogo = eeLogoPre.textContent;
    }

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
        result_duyler_label: { en: 'years of dev', ru: 'лет разработки' },
        result_duyler_title: { en: 'Duyler Framework', ru: 'Фреймворк Duyler' },
        result_duyler_text: {
            en: 'Event-driven non-blocking PHP framework for high-load AI solutions. Reactive architecture, async I/O, production-proven in real projects. Open Source.',
            ru: 'Событийно-ориентированный неблокирующий PHP-фреймворк для высоконагруженных AI-решений. Реактивная архитектура, асинхронный I/O, проверенный в продакшене. Open Source.'
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
        },
        ee_console_box_1: {
            en: 'Looking under the hood? Respect.',
            ru: '\u0421\u043c\u043e\u0442\u0440\u0438\u0448\u044c \u043f\u043e\u0434 \u043a\u0430\u043f\u043e\u0442? \u0423\u0432\u0430\u0436\u0430\u044e.'
        },
        ee_console_box_2: {
            en: 'Promo code: RETRO-DEV-2026',
            ru: '\u041f\u0440\u043e\u043c\u043e\u043a\u043e\u0434: RETRO-DEV-2026'
        },
        ee_console_box_3: {
            en: '20% off consultation.',
            ru: '\u0421\u043a\u0438\u0434\u043a\u0430 20% \u043d\u0430 \u043a\u043e\u043d\u0441\u0443\u043b\u044c\u0442\u0430\u0446\u0438\u044e.'
        },
        ee_source_1: {
            en: 'You checked the source code. Old school. Respect.',
            ru: '\u0422\u044b \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u043b \u0438\u0441\u0445\u043e\u0434\u043d\u044b\u0439 \u043a\u043e\u0434. \u041e\u043b\u0434\u0441\u043a\u0443\u043b. \u0423\u0432\u0430\u0436\u0435\u043d\u0438\u0435.'
        },
        ee_source_2: {
            en: 'Fun fact: there are 22+ easter eggs on this page.',
            ru: '\u0417\u0430\u0431\u0430\u0432\u043d\u044b\u0439 \u0444\u0430\u043a\u0442: \u043d\u0430 \u044d\u0442\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 22+ \u043f\u0430\u0441\u0445\u0430\u043b\u043a\u0438.'
        },
        ee_source_3: {
            en: 'You found one. Keep looking.',
            ru: '\u0422\u044b \u043d\u0430\u0448\u0451\u043b \u043e\u0434\u043d\u0443. \u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0439 \u0438\u0441\u043a\u0430\u0442\u044c.'
        },
        ee_select_1: {
            en: 'You found invisible text.',
            ru: '\u0422\u044b \u043d\u0430\u0448\u0451\u043b \u043d\u0435\u0432\u0438\u0434\u0438\u043c\u044b\u0439 \u0442\u0435\u043a\u0441\u0442.'
        },
        ee_select_2: {
            en: 'In the early web we hid messages in font color=background.',
            ru: '\u0412 \u0440\u0430\u043d\u043d\u0435\u043c \u0432\u0435\u0431\u0435 \u043c\u044b \u043f\u0440\u044f\u0442\u0430\u043b\u0438 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f \u0432 font color=background.'
        },
        ee_select_3: {
            en: 'Some things never change.',
            ru: '\u041a\u043e\u0435-\u0447\u0442\u043e \u043d\u0438\u043a\u043e\u0433\u0434\u0430 \u043d\u0435 \u043c\u0435\u043d\u044f\u0435\u0442\u0441\u044f.'
        },
        ee_logo_reduced: {
            en: 'Logo morph triggered. Matrix rain disabled (prefers-reduced-motion).',
            ru: '\u0422\u0440\u0430\u043d\u0441\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043b\u043e\u0433\u043e\u0442\u0438\u043f\u0430. \u041c\u0430\u0442\u0440\u0438\u0447\u043d\u044b\u0439 \u0434\u043e\u0436\u0434\u044c \u043e\u0442\u043a\u043b\u044e\u0447\u0451\u043d (prefers-reduced-motion).'
        },
        ee_menu_about: {
            en: '> About MILINSKY.OS',
            ru: '> \u041e MILINSKY.OS'
        },
        ee_menu_source: {
            en: '> Source code (you know how)',
            ru: '> \u0418\u0441\u0445\u043e\u0434\u043d\u044b\u0439 \u043a\u043e\u0434 (\u0442\u044b \u0437\u043d\u0430\u0435\u0448\u044c \u043a\u0430\u043a)'
        },
        ee_menu_print: {
            en: '> Print Resume',
            ru: '> \u041f\u0435\u0447\u0430\u0442\u044c \u0440\u0435\u0437\u044e\u043c\u0435'
        },
        ee_menu_theme_on: {
            en: '> Enable secret theme',
            ru: '> \u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0441\u0435\u043a\u0440\u0435\u0442\u043d\u0443\u044e \u0442\u0435\u043c\u0443'
        },
        ee_menu_theme_off: {
            en: '> Disable secret theme',
            ru: '> \u041e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0441\u0435\u043a\u0440\u0435\u0442\u043d\u0443\u044e \u0442\u0435\u043c\u0443'
        },
        ee_menu_exit: {
            en: '> Exit (nice try)',
            ru: '> \u0412\u044b\u0445\u043e\u0434 (\u0445\u043e\u0440\u043e\u0448\u0430\u044f \u043f\u043e\u043f\u044b\u0442\u043a\u0430)'
        },
        ee_modal_title: {
            en: 'About MILINSKY.OS',
            ru: '\u041e MILINSKY.OS'
        },
        ee_modal_ok: {
            en: '[OK]',
            ru: '[OK]'
        },
        ee_toast_console: {
            en: 'Open DevTools Console for secrets.',
            ru: '\u041e\u0442\u043a\u0440\u043e\u0439 \u043a\u043e\u043d\u0441\u043e\u043b\u044c DevTools \u0434\u043b\u044f \u0441\u0435\u043a\u0440\u0435\u0442\u043e\u0432.'
        },
        ee_toast_cyber_on: {
            en: 'Cyberpunk theme activated.',
            ru: '\u041a\u0438\u0431\u0435\u0440\u043f\u0430\u043d\u043a-\u0442\u0435\u043c\u0430 \u0430\u043a\u0442\u0438\u0432\u0438\u0440\u043e\u0432\u0430\u043d\u0430.'
        },
        ee_toast_cyber_off: {
            en: 'Secret theme disabled.',
            ru: '\u0421\u0435\u043a\u0440\u0435\u0442\u043d\u0430\u044f \u0442\u0435\u043c\u0430 \u043e\u0442\u043a\u043b\u044e\u0447\u0435\u043d\u0430.'
        },
        ee_toast_exit: {
            en: 'Nice try. There is no exit from MILINSKY.OS.',
            ru: '\u0425\u043e\u0440\u043e\u0448\u0430\u044f \u043f\u043e\u043f\u044b\u0442\u043a\u0430. \u0418\u0437 MILINSKY.OS \u0432\u044b\u0445\u043e\u0434\u0430 \u043d\u0435\u0442.'
        },
        ee_solar_text: {
            en: 'I really love Solarized color themes, do you?',
            ru: '\u042f \u043e\u0447\u0435\u043d\u044c \u043b\u044e\u0431\u043b\u044e Solarized color themes, \u0430 \u0442\u044b?'
        },
        ee_solar_yes: {
            en: 'Yes, me too!',
            ru: '\u0414\u0430, \u0442\u043e\u0436\u0435!'
        },
        ee_solar_no: {
            en: 'No, I prefer Gruvbox',
            ru: '\u041d\u0435\u0442, \u044f \u0437\u0430 Gruvbox'
        },
        ee_solar_what: {
            en: 'What is this?',
            ru: '\u0427\u0442\u043e \u044d\u0442\u043e?'
        },
        ee_solar_resp_yes: {
            en: 'Good taste. Ethan Schoonaker would be proud.',
            ru: '\u0425\u043e\u0440\u043e\u0448\u0438\u0439 \u0432\u043a\u0443\u0441. Ethan Schoonaker \u0431\u044b \u0433\u043e\u0440\u0434\u0438\u043b\u0441\u044f.'
        },
        ee_solar_resp_no: {
            en: 'Gruvbox is not bad either. But Solarized is a classic.',
            ru: 'Gruvbox \u2014 \u0442\u043e\u0436\u0435 \u043d\u0435\u043f\u043b\u043e\u0445\u043e. \u041d\u043e Solarized \u2014 \u043a\u043b\u0430\u0441\u0441\u0438\u043a\u0430.'
        },
        ee_solar_resp_what: {
            en: 'Solarized is the color scheme you are looking at right now. Click any swatch.',
            ru: 'Solarized \u2014 \u0446\u0432\u0435\u0442\u043e\u0432\u0430\u044f \u0441\u0445\u0435\u043c\u0430, \u043a\u043e\u0442\u043e\u0440\u0443\u044e \u0442\u044b \u0441\u0435\u0439\u0447\u0430\u0441 \u0441\u043c\u043e\u0442\u0440\u0438\u0448\u044c. \u041d\u0430\u0436\u043c\u0438 \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0441\u0432\u0430\u0442\u0447.'
        },
        ee_visit_2: {
            en: 'Welcome back. Visit #N.',
            ru: '\u0421 \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0435\u043d\u0438\u0435\u043c. \u0412\u0438\u0437\u0438\u0442 #N.'
        },
        ee_visit_5: {
            en: 'Visit #N. You are becoming a regular.',
            ru: '\u0412\u0438\u0437\u0438\u0442 #N. \u0422\u044b \u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0448\u044c\u0441\u044f \u0437\u0430\u0432\u0441\u0435\u0433\u0434\u0430\u0442\u0430\u0435\u043c.'
        },
        ee_visit_10: {
            en: 'Visit #10. Time to make it official.',
            ru: '\u0412\u0438\u0437\u0438\u0442 #10. \u041f\u043e\u0440\u0430 \u0431\u044b \u0441\u0434\u0435\u043b\u0430\u0442\u044c \u044d\u0442\u043e \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u043c.'
        },
        ee_visit_20: {
            en: 'You have been here #N times. Secret: persistence is the ultimate skill.',
            ru: '\u0422\u044b \u0431\u044b\u043b \u0437\u0434\u0435\u0441\u044c #N \u0440\u0430\u0437. \u0421\u0435\u043a\u0440\u0435\u0442: \u0443\u043f\u043e\u0440\u0441\u0442\u0432\u043e \u2014 \u0433\u043b\u0430\u0432\u043d\u044b\u0439 \u043d\u0430\u0432\u044b\u043a.'
        }
    };

    var html = document.documentElement;
    var storedLang = localStorage.getItem('lang');
    var currentLang = storedLang || 'en';

    function eeT(key) {
        if (translations[key] && translations[key][currentLang]) {
            return translations[key][currentLang];
        }
        if (translations[key] && translations[key].en) {
            return translations[key].en;
        }
        return key;
    }

    (function () {
        var borderStyle = 'font-family:monospace;color:#b58900;background:#002b36;padding:4px 0;';
        var textStyle = 'font-family:monospace;color:#b58900;background:#002b36;';
        var line1 = eeT('ee_console_box_1');
        var line2 = eeT('ee_console_box_2');
        var line3 = eeT('ee_console_box_3');
        var padL1 = 39 - line1.length;
        var padL2 = 39 - line2.length;
        var padL3 = 39 - line3.length;
        var p1 = '';
        var p2 = '';
        var p3 = '';
        for (var pi = 0; pi < padL1; pi++) p1 += ' ';
        for (var pj = 0; pj < padL2; pj++) p2 += ' ';
        for (var pk = 0; pk < padL3; pk++) p3 += ' ';
        console.log('%c\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510', borderStyle);
        console.log('%c\u2502  ' + line1 + p1 + '\u2502', textStyle);
        console.log('%c\u2502  ' + line2 + p2 + '\u2502', textStyle);
        console.log('%c\u2502  ' + line3 + p3 + '\u2502', textStyle);
        console.log('%c\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518', borderStyle);
        var logSets = [
            [
                '[kernel] MILINSKY.OS loaded',
                '[auth] visitor authenticated as curious_developer',
                '[notice] caffeine level: critical',
                '[warn] this developer seems cool \u2014 should reach out'
            ],
            [
                '[kernel] MILINSKY.OS v4.2.0 booted',
                '[auth] session token: COFFEE-0xDEAD',
                '[notice] memory usage: 42MB of 64MB',
                '[warn] this visitor has good taste in websites'
            ],
            [
                '[kernel] MILINSKY.OS initialized',
                '[auth] access level: curious_developer',
                '[notice] uptime: 127 days and counting',
                '[warn] someone should hire this developer already'
            ]
        ];
        var dayIdx = eeManager.getDailySeed() % logSets.length;
        var logs = logSets[dayIdx];
        for (var li = 0; li < logs.length; li++) {
            console.log(logs[li]);
        }
        eeManager.discover('ee06');
    })();

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

    (function initLogoReveal() {
        var logoPre = document.querySelector('.nav__logo-ascii');
        if (!logoPre) return;
        var text = logoPre.textContent;
        var html = '';
        var pixelIndices = [];
        for (var i = 0; i < text.length; i++) {
            if (text[i] === '#') {
                html += '<span class="nav__logo-pixel" data-pi="' + pixelIndices.length + '">#</span>';
                pixelIndices.push(i);
            } else {
                html += text[i];
            }
        }
        logoPre.innerHTML = html;

        var pixels = logoPre.querySelectorAll('.nav__logo-pixel');
        var indices = [];
        for (var p = 0; p < pixels.length; p++) indices.push(p);

        for (var s = indices.length - 1; s > 0; s--) {
            var j = Math.floor(Math.random() * (s + 1));
            var tmp = indices[s];
            indices[s] = indices[j];
            indices[j] = tmp;
        }

        var tease = indices.slice(0, 4);
        var rest = indices.slice(4);

        setTimeout(function () {
            for (var t = 0; t < tease.length; t++) {
                (function (el, delay) {
                    setTimeout(function () { el.classList.add('nav__logo-pixel--visible'); }, delay);
                })(pixels[tease[t]], Math.random() * 400);
            }
        }, 600);

        setTimeout(function () {
            for (var r = 0; r < rest.length; r++) {
                (function (el, delay) {
                    setTimeout(function () { el.classList.add('nav__logo-pixel--visible'); }, delay);
                })(pixels[rest[r]], Math.random() * 3600);
            }
        }, 1800);
    })();

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
        themeToggle.addEventListener('dblclick', function (e) {
            e.preventDefault();
            eeShowSolarizedDialog();
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
    var typingSubitle = typingElement ? typingElement.closest('.hero__subtitle') : null;

    function getTypingText() {
        if (translations.hero_typing && translations.hero_typing[currentLang]) {
            return translations.hero_typing[currentLang];
        }
        return translations.hero_typing.en;
    }

    function reserveTypingHeight() {
        if (!typingElement || !typingSubitle) return;
        typingElement.textContent = getTypingText();
        var h = typingSubitle.offsetHeight;
        typingSubitle.style.minHeight = h + 'px';
        typingElement.textContent = '';
    }

    reserveTypingHeight();

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
        reserveTypingHeight();
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

    var syslogText = document.getElementById('syslogText');
    var footer = document.querySelector('.footer');
    if (syslogText && footer) {
        var syslogStr = 'build: 2026.05 | mem: 64MB | uptime: 127d | pid: 0x3A7F';
        var syslogDone = false;
        var syslogObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !syslogDone) {
                    syslogDone = true;
                    syslogObserver.unobserve(footer);
                    var i = 0;
                    (function typeChar() {
                        if (i < syslogStr.length) {
                            syslogText.textContent += syslogStr[i];
                            i++;
                            setTimeout(typeChar, 25 + Math.random() * 25);
                        }
                    })();
                }
            });
        }, { threshold: 0.1 });
        syslogObserver.observe(footer);
    }

    function eeShowToast(message, duration) {
        var toast = document.createElement('div');
        toast.className = 'ee-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.classList.add('ee-toast--visible');
        }, 10);
        setTimeout(function () {
            toast.classList.remove('ee-toast--visible');
            setTimeout(function () {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration || 3000);
    }

    var eeReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function eeShowSolarizedDialog() {
        eeManager.discover('ee-solarized');
        var existing = document.querySelector('.ee-solarized-overlay');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

        var overlay = document.createElement('div');
        overlay.className = 'ee-solarized-overlay';

        var dialog = document.createElement('div');
        dialog.className = 'ee-solarized-dialog';

        var header = document.createElement('div');
        header.className = 'ee-solarized-dialog__header';
        var title = document.createElement('span');
        title.textContent = 'SOLARIZED';
        var closeX = document.createElement('button');
        closeX.className = 'ee-solarized-dialog__close';
        closeX.textContent = '\u00D7';
        closeX.type = 'button';
        closeX.addEventListener('click', function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        });
        header.appendChild(title);
        header.appendChild(closeX);

        var body = document.createElement('div');
        body.className = 'ee-solarized-dialog__body';

        var text = document.createElement('div');
        text.className = 'ee-solarized-dialog__text';
        text.textContent = eeT('ee_solar_text');
        body.appendChild(text);

        var colors = [
            { hex: '#002b36', name: 'base03' },
            { hex: '#073642', name: 'base02' },
            { hex: '#586e75', name: 'base01' },
            { hex: '#657b83', name: 'base00' },
            { hex: '#839496', name: 'base0' },
            { hex: '#93a1a1', name: 'base1' },
            { hex: '#eee8d5', name: 'base2' },
            { hex: '#fdf6e3', name: 'base3' },
            { hex: '#b58900', name: 'yellow' },
            { hex: '#cb4b16', name: 'orange' },
            { hex: '#dc322f', name: 'red' },
            { hex: '#d33682', name: 'magenta' },
            { hex: '#6c71c4', name: 'violet' },
            { hex: '#268bd2', name: 'blue' },
            { hex: '#2aa198', name: 'cyan' },
            { hex: '#859900', name: 'green' }
        ];

        var palette = document.createElement('div');
        palette.className = 'ee-solarized-palette';
        for (var ci = 0; ci < colors.length; ci++) {
            var swatch = document.createElement('div');
            swatch.className = 'ee-solarized-swatch';
            swatch.style.background = colors[ci].hex;
            swatch.title = colors[ci].name + ' ' + colors[ci].hex;
            var label = document.createElement('span');
            label.className = 'ee-solarized-swatch--label';
            label.textContent = colors[ci].name;
            swatch.appendChild(label);
            palette.appendChild(swatch);
        }
        body.appendChild(palette);

        var response = document.createElement('div');
        response.className = 'ee-solarized-response';
        body.appendChild(response);

        var buttons = document.createElement('div');
        buttons.className = 'ee-solarized-dialog__buttons';

        var btnYes = document.createElement('button');
        btnYes.className = 'ee-solarized-btn ee-solarized-btn--primary';
        btnYes.type = 'button';
        btnYes.textContent = eeT('ee_solar_yes');
        btnYes.addEventListener('click', function () {
            response.textContent = eeT('ee_solar_resp_yes');
        });

        var btnNo = document.createElement('button');
        btnNo.className = 'ee-solarized-btn';
        btnNo.type = 'button';
        btnNo.textContent = eeT('ee_solar_no');
        btnNo.addEventListener('click', function () {
            response.textContent = eeT('ee_solar_resp_no');
        });

        var btnWhat = document.createElement('button');
        btnWhat.className = 'ee-solarized-btn';
        btnWhat.type = 'button';
        btnWhat.textContent = eeT('ee_solar_what');
        btnWhat.addEventListener('click', function () {
            response.textContent = eeT('ee_solar_resp_what');
        });

        buttons.appendChild(btnYes);
        buttons.appendChild(btnNo);
        buttons.appendChild(btnWhat);
        body.appendChild(buttons);

        dialog.appendChild(header);
        dialog.appendChild(body);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (ev) {
            if (ev.target === overlay) {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }
        });
    }

    (function () {
        var logoLink = document.querySelector('.nav__logo');
        if (!logoLink || !eeLogoPre) return;
        var clicks = [];
        var morphActive = false;
        logoLink.addEventListener('click', function (e) {
            if (morphActive) return;
            e.preventDefault();
            clicks.push(Date.now());
            if (clicks.length > 7) {
                clicks.shift();
            }
            if (clicks.length === 7) {
                var span = clicks[6] - clicks[0];
                if (span < 3500) {
                    clicks = [];
                    morphActive = true;
                    eeManager.discover('ee03');
                    if (eeReducedMotion) {
                        eeShowToast(eeT('ee_logo_reduced'), 3000);
                        var altArts = [
                            '     /\\\n    /  \\\n   | ** |\n   | PHP|\n   | ** |\n  /| .. |\\\n / +----+ \\',
                            ' /\\_/\\\n( o.o )\n > ^ <\n/|   |\\\n(_|   |_)',
                            '   ____\n  / _  \\\n | (_   |\n |  _)  |\n | |    |\n \\_____/',
                            ' ________\n|  ____. |\n| |    | |\n| |____| |\n|________|\n   |  |',
                            '   ____\n  |  _ \\\n  | | | |\n  | |_| |\n  |  _  /\n  |_| \\_\\'
                        ];
                        var artIdx = Math.floor(eeManager.getSessionSeed() * altArts.length);
                        eeLogoPre.textContent = altArts[artIdx];
                        setTimeout(function () {
                            eeLogoPre.textContent = eeOriginalLogo;
                            morphActive = false;
                        }, 3000);
                        return;
                    }
                    var overlay = document.createElement('div');
                    overlay.className = 'ee-matrix-overlay';
                    document.body.appendChild(overlay);
                    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
                    var colCount = Math.floor(window.innerWidth / 20);
                    for (var col = 0; col < colCount; col++) {
                        var colEl = document.createElement('div');
                        colEl.className = 'ee-matrix-col';
                        colEl.style.left = (col * 20) + 'px';
                        var text = '';
                        var len = 10 + Math.floor(Math.random() * 20);
                        for (var ci = 0; ci < len; ci++) {
                            text += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        colEl.textContent = text;
                        colEl.style.animationDuration = (1 + Math.random() * 2) + 's';
                        colEl.style.animationDelay = (Math.random() * 0.8) + 's';
                        overlay.appendChild(colEl);
                    }
                    setTimeout(function () {
                        if (overlay.parentNode) {
                            overlay.parentNode.removeChild(overlay);
                        }
                        var altArts = [
                            '     /\\\n    /  \\\n   | ** |\n   | PHP|\n   | ** |\n  /| .. |\\\n / +----+ \\',
                            ' /\\_/\\\n( o.o )\n > ^ <\n/|   |\\\n(_|   |_)',
                            '   ____\n  / _  \\\n | (_   |\n |  _)  |\n | |    |\n \\_____/',
                            ' ________\n|  ____. |\n| |    | |\n| |____| |\n|________|\n   |  |',
                            '   ____\n  |  _ \\\n  | | | |\n  | |_| |\n  |  _  /\n  |_| \\_\\'
                        ];
                        var artIdx = Math.floor(eeManager.getSessionSeed() * altArts.length);
                        eeLogoPre.textContent = altArts[artIdx];
                        setTimeout(function () {
                            eeLogoPre.textContent = eeOriginalLogo;
                            morphActive = false;
                        }, 3000);
                    }, 2000);
                }
            }
        });
    })();

    (function () {
        var activeMenu = null;
        function closeMenu() {
            if (activeMenu && activeMenu.parentNode) {
                activeMenu.parentNode.removeChild(activeMenu);
                activeMenu = null;
            }
        }
        function shuffleArray(arr, seed) {
            var result = arr.slice();
            for (var i = result.length - 1; i > 0; i--) {
                var j = Math.floor(seed * (i + 1)) % result.length;
                var tmp = result[i];
                result[i] = result[j];
                result[j] = tmp;
            }
            return result;
        }
        function createMenu(x, y) {
            closeMenu();
            eeManager.discover('ee04');
            var menu = document.createElement('div');
            menu.className = 'ee-cde-menu';
            menu.style.left = Math.min(x, window.innerWidth - 300) + 'px';
            menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';
            var header = document.createElement('div');
            header.className = 'ee-cde-menu__header';
            header.textContent = 'MILINSKY.OS';
            menu.appendChild(header);
            var sep = function () {
                var s = document.createElement('div');
                s.className = 'ee-cde-menu__sep';
                menu.appendChild(s);
            };
            var items = [
                { label: eeT('ee_menu_about'), action: function () {
                    closeMenu();
                    var overlay = document.createElement('div');
                    overlay.className = 'ee-modal-overlay';
                    var modal = document.createElement('div');
                    modal.className = 'ee-about-modal';
                    var hdr = document.createElement('div');
                    hdr.className = 'ee-about-modal__header';
                    hdr.textContent = eeT('ee_modal_title');
                    var body = document.createElement('div');
                    body.className = 'ee-about-modal__body';
                    body.innerHTML = 'MILINSKY.OS v4.2.0<br>Build: 2026.05<br>Kernel: PHP 8.4+<br>Runtime: Duyler Framework<br>Uptime: ' + eeManager.getVisitCount() + ' visits<br>Status: OPERATIONAL';
                    var closeBtn = document.createElement('button');
                    closeBtn.className = 'ee-about-modal__close';
                    closeBtn.textContent = eeT('ee_modal_ok');
                    closeBtn.type = 'button';
                    closeBtn.addEventListener('click', function () {
                        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    });
                    modal.appendChild(hdr);
                    modal.appendChild(body);
                    modal.appendChild(closeBtn);
                    overlay.appendChild(modal);
                    document.body.appendChild(overlay);
                    overlay.addEventListener('click', function (ev) {
                        if (ev.target === overlay) {
                            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                        }
                    });
                }},
                { label: eeT('ee_menu_source'), action: function () {
                    closeMenu();
                    eeShowToast(eeT('ee_toast_console'), 3000);
                }},
                { label: eeT('ee_menu_print'), action: function () {
                    closeMenu();
                    window.print();
                }},
                { label: html.getAttribute('data-ee-theme') === 'cyberpunk' ? eeT('ee_menu_theme_off') : eeT('ee_menu_theme_on'), action: function () {
                    closeMenu();
                    if (html.getAttribute('data-ee-theme') === 'cyberpunk') {
                        html.removeAttribute('data-ee-theme');
                        eeShowToast(eeT('ee_toast_cyber_off'), 2000);
                    } else {
                        html.setAttribute('data-ee-theme', 'cyberpunk');
                        eeShowToast(eeT('ee_toast_cyber_on'), 2000);
                    }
                }},
                { label: eeT('ee_menu_exit'), action: function () {
                    closeMenu();
                    eeShowToast(eeT('ee_toast_exit'), 3000);
                }}
            ];
            var shuffled = shuffleArray(items, eeManager.getSessionSeed());
            for (var ii = 0; ii < shuffled.length; ii++) {
                if (ii === 1 || ii === 3) sep();
                var item = document.createElement('div');
                item.className = 'ee-cde-menu__item';
                item.textContent = shuffled[ii].label;
                item.addEventListener('click', shuffled[ii].action);
                menu.appendChild(item);
            }
            document.body.appendChild(menu);
            activeMenu = menu;
        }
        document.addEventListener('contextmenu', function (e) {
            if (e.target.closest('.ee-cde-menu') || e.target.closest('.ee-about-modal')) return;
            e.preventDefault();
            createMenu(e.clientX, e.clientY);
        });
        document.addEventListener('click', function (e) {
            if (activeMenu && !activeMenu.contains(e.target)) {
                closeMenu();
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeMenu();
                var overlay = document.querySelector('.ee-modal-overlay');
                if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }
        });
        var longPressTimer = null;
        var longPressStart = null;
        document.addEventListener('touchstart', function (e) {
            var touch = e.touches[0];
            longPressStart = { x: touch.clientX, y: touch.clientY };
            longPressTimer = setTimeout(function () {
                createMenu(longPressStart.x, longPressStart.y);
                longPressStart = null;
            }, 500);
        }, { passive: true });
        document.addEventListener('touchmove', function (e) {
            if (!longPressTimer) return;
            var touch = e.touches[0];
            var dx = touch.clientX - longPressStart.x;
            var dy = touch.clientY - longPressStart.y;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
        document.addEventListener('touchend', function () {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
    })();

    (function () {
        var secretTexts = document.querySelectorAll('.ee-secret-text');
        if (secretTexts.length === 0) return;
        for (var si = 0; si < secretTexts.length; si++) {
            var key = secretTexts[si].getAttribute('data-ee-key');
            if (key) {
                secretTexts[si].textContent = eeT(key);
            }
        }
        var discovered = false;
        function checkSelection() {
            if (discovered) return;
            var sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            for (var i = 0; i < secretTexts.length; i++) {
                if (sel.containsNode(secretTexts[i], true)) {
                    discovered = true;
                    eeManager.discover('ee11');
                    return;
                }
            }
        }
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                setTimeout(checkSelection, 100);
            }
        });
        document.addEventListener('mouseup', function () {
            setTimeout(checkSelection, 200);
        });
        document.addEventListener('touchend', function () {
            setTimeout(checkSelection, 200);
        });
    })();

    (function () {
        var visitCount = eeManager.getVisitCount();
        if (visitCount < 2) return;
        var terminalFrame = document.querySelector('.hero__terminal-frame');
        if (!terminalFrame) return;
        var msg = '';
        if (visitCount >= 20) {
            msg = eeT('ee_visit_20').replace('#N', String(visitCount));
        } else if (visitCount >= 10) {
            msg = eeT('ee_visit_10');
        } else if (visitCount >= 5) {
            msg = eeT('ee_visit_5').replace('#N', String(visitCount));
        } else {
            msg = eeT('ee_visit_2').replace('#N', String(visitCount));
        }
        var msgEl = document.createElement('div');
        msgEl.className = 'ee-visit-msg';
        terminalFrame.appendChild(msgEl);
        var idx = 0;
        (function typeVisit() {
            if (idx < msg.length) {
                msgEl.textContent += msg[idx];
                idx++;
                setTimeout(typeVisit, 30 + Math.random() * 20);
            }
        })();
    })();
})();
