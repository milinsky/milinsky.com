# Комплексный аудит кодовой базы MILINSKY Landing

Дата: 2026-05-13
Аудитор: Sisyphus
Объём: index.html (430 строк), styles.css (1924 строки), script.js (1255 строк)

---

## Критичность

- **CRITICAL** — Ошибка, которая приведёт к багу или потере данных
- **HIGH** — Серьёзная проблема архитектуры или качества
- **MEDIUM** — Проблема, требующая внимания при рефакторинге
- **LOW** — Мелкое улучшение, код-стайл

---

## 1. МЁРТВЫЙ КОД И ДУБЛИРОВАНИЕ

### 1.1 [CRITICAL] Дублирование объявления переменных в script.js

**Файл:** `script.js`, строки 73-83

Переменные `eeOriginalLogo` и `eeLogoPre` объявлены и инициализированы **дважды** с идентичным кодом. Второе объявление через `var` затеняет первое (hoisting), но результат тот же — первая инициализация бесполезна.

```javascript
// Строки 73-77 (первое объявление)
var eeOriginalLogo = '';
var eeLogoPre = document.querySelector('.nav__logo-ascii');
if (eeLogoPre) {
    eeOriginalLogo = eeLogoPre.textContent;
}

// Строки 79-83 (второе, идентичное)
var eeOriginalLogo = '';
var eeLogoPre = document.querySelector('.nav__logo-ascii');
if (eeLogoPre) {
    eeOriginalLogo = eeLogoPre.textContent;
}
```

**Решение:** Удалить строки 79-83.

---

### 1.2 [HIGH] Дублирование массива altArts в EE-03

**Файл:** `script.js`, строки 991-996 и 1029-1034

Массив ASCII-артов `altArts` для морфирования логотипа скопирован целиком в двух местах одной функции — для reduced-motion и обычного режима. 5 одинаковых строк.

**Решение:** Вынести массив `altArts` за пределы условия, объявить один раз.

---

### 1.3 [HIGH] Дублирование .retro-card в CSS

**Файл:** `styles.css`, строки 221-268 и 657-659

Класс `.retro-card` объявлен дважды. Второе объявление добавляет `position: relative`, которое уже есть в первом (строка 225).

```css
/* Строки 221-268 — полная декларация */
.retro-card {
    background: var(--bg-card);
    ...
    position: relative;
    overflow: hidden;
    ...
}

/* Строки 657-659 — дублирующая декларация */
.retro-card {
    position: relative; /* уже есть выше */
}
```

**Решение:** Удалить строки 657-659.

---

### 1.4 [HIGH] Дублирование .nav__link в CSS

**Файл:** `styles.css`, строки 440-451 и 1214-1216

`.nav__link` объявлен в двух местах. Первое объявление задаёт все стили, второе добавляет `position: relative`.

```css
/* Строки 440-451 */
.nav__link {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    ...
}

/* Строки 1214-1216 */
.nav__link {
    position: relative;
}
```

**Решение:** Добавить `position: relative` в первое объявление (строка 440), удалить второе.

---

### 1.5 [MEDIUM] Пустое CSS-правило

**Файл:** `styles.css`, строки 747-748

```css
.typing-text {
}
```

Пустой селектор без единого свойства.

**Решение:** Удалить.

---

### 1.6 [MEDIUM] Избыточный объект sectionNames

**Файл:** `script.js`, строка 785

```javascript
var sectionNames = { about: 'about', services: 'services', results: 'results', expertise: 'expertise', contact: 'contact' };
```

Каждый ключ маппится в идентичное значение. Используется только в строке 796: `sectionNames[id]` — что эквивалентно просто `id`.

**Решение:** Заменить `sectionNames[id]` на `id`, удалить объект `sectionNames`.

---

### 1.7 [LOW] Неиспользуемая CSS-переменная --space-3xl

**Файл:** `styles.css`, строка 27

`--space-3xl: 4rem` определена, но не используется ни разу. Ближайшие использования — `--space-2xl` (3rem) и `--space-4xl` (6rem).

**Решение:** Либо использовать, либо удалить.

---

### 1.8 [LOW] Заглушка .glow-divider

**Файл:** `styles.css`, строки 273-278

Класс `.glow-divider` определён в CSS, но не используется ни разу в HTML или JS.

**Решение:** Удалить, если не планируется использование.

---

## 2. ПОТЕНЦИАЛЬНЫЕ ОШИБКИ (BUGS)

### 2.1 [CRITICAL] Glitch-эффект не работает

**Файл:** `styles.css`, строки 1350-1397; `script.js` — нигде не активируется

Определена `@keyframes glitch` (строки 1350-1393), но в CSS задано `[data-glitch] { animation: none; }` (строка 1396), и нигде в JS анимация не включается. Атрибут `data-glitch` установлен на 9 элементах в HTML, но эффект визуально отсутствует.

CSS-переменные `--gd` (delay) и `--gdur` (duration) заданы через inline-стили на элементах, но не используются ни в одном правиле.

**Решение:** Либо реализовать включение анимации через JS (например, по IntersectionObserver), либо убрать `data-glitch` и связанные стили если эффект не нужен.

---

### 2.2 [CRITICAL] Сброс счётчика визитов при каждом вызове getVisitCount

**Файл:** `script.js`, строки 33-51

`getVisitCount()` инкрементит счётчик при каждом вызове. Если функция будет вызвана дважды за сессию, счётчик увеличится на 2.

```javascript
function getVisitCount() {
    var count = 0;
    try {
        var c = localStorage.getItem('ee_visit_count');
        if (c) { count = parseInt(c, 10); }
    } catch (e) {}
    if (isNaN(count)) { count = 0; }
    count = count + 1; // <-- ПОБОЧНЫЙ ЭФФЕКТ
    try {
        localStorage.setItem('ee_visit_count', String(count));
        ...
    } catch (e) {}
    return count;
}
```

Сейчас вызывается однажды при инициализации eeManager (строка ~69) и затем в EE-16 (строка 1229) — итого +2 к счётчику каждый визит. Это баг: визит №1 становится визитом №2, и т.д.

**Решение:** Разделить на `getVisitCount()` (только чтение) и `incrementVisitCount()` (запись). Вызывать increment один раз при загрузке.

---

### 2.3 [HIGH] Ротация лейблов секций зависит от порядка в DOM

**Файл:** `script.js`, строки 741-758

Код собирает все `.section__label[data-section]` и использует индекс `idx` для вычисления оригинального текста:

```javascript
var original = '\u003E section_0' + (idx + 1) + ' --' + section;
```

Если секции будут переупорядочены или одна удалена, номерация сломается (например, `section_01` станет `section_02`).

**Решение:** Использовать `data-section` для определения номера, либо хранить оригинальный текст в data-атрибуте.

---

### 2.4 [HIGH] Побочный эффект при тихой ошибке в eeManager

**Файл:** `script.js`, строки 9-11, 21, 39, 49

Все `catch (e) {}` блоки молча проглатывают ошибки. В том числе ошибки записи в localStorage (QuotaExceededError). Пользователь не узнает, что его данные не сохранились.

**Решение:** Добавить хотя бы `console.warn` в catch-блоки для development режима.

---

### 2.5 [MEDIUM] innerHTML с непроверенными данными

**Файл:** `script.js`, строки 464, 1094

```javascript
// Строка 464
htmlElements[j].innerHTML = translations[hKey][lang];

// Строка 1094
body.innerHTML = 'MILINSKY.OS v4.2.0<br>Build: 2026.05...';
```

Переводы содержат HTML-теги (`<br>`, `<span class="accent-text">`). При добавлении новых переводов легко забыть экранировать и создать XSS-уязвимость.

**Решение:** Использовать sanitize-функцию или явно помечать безопасные строки.

---

### 2.6 [MEDIUM] Некорректная работа IntersectionObserver для typing

**Файл:** `script.js`, строки 673-676

```javascript
if (entry.target.querySelector('#typingText') || entry.target.closest('.hero')) {
    if (!typingStarted) {
        setTimeout(startTyping, 600);
    }
}
```

`entry.target` — это элемент с классом `.animate-on-scroll`. Вызов `.closest('.hero')` проверяет, является ли сам элемент или его предок `.hero`. Но если typing-элемент находится внутри `.hero__subtitle.animate-on-scroll`, то `entry.target.querySelector('#typingText')` сработает корректно. Однако условие `|| entry.target.closest('.hero')` приведёт к тому, что typing начнётся при появлении **любого** элемента внутри `.hero`, даже если сам typing-элемент ещё не виден.

**Решение:** Убрать `|| entry.target.closest('.hero')`, оставить только проверку на `#typingText`.

---

### 2.7 [MEDIUM] touchstart без preventDefault на контекстном меню

**Файл:** `script.js`, строки 1167-1173

На мобильных при долгом нажатии вызывается `createMenu()`, но нативное контекстное меню браузера не подавляется на touch-событиях. `{ passive: true }` не позволяет вызвать `preventDefault()`.

**Решение:** Для корректной работы на мобильных нужно использовать `{ passive: false }` и вызывать `e.preventDefault()` в обработчике `touchstart` при обнаружении долгого нажатия.

---

### 2.8 [LOW] Math.random() как seed для eeManager

**Файл:** `script.js`, строка 14

```javascript
rawSeed = String(Math.random());
```

`Math.random()` не криптографически стоек. Для пасхалок это не имеет значения, но для генерации промокодов на основе seed — уязвимость.

**Решение:** Приемлемо для текущего использования. Учесть при реализации серверной валидации промокодов.

---

## 3. НЕКОНСИСТЕНТНЫЕ ПАТТЕРНЫ

### 3.1 [HIGH] Использование var вместо let/const

**Файл:** `script.js` — весь файл

Весь JavaScript написан на `var`, включая случаи, где переменная не переназначается (должна быть `const`). Это:
- Не использует возможности ES2015+
- Приводит к hoisting-related багам
- Усложняет понимание мутабельности

**Решение:** Заменить все `var` на `const` (по умолчанию) или `let` (при переназначении). Использовать arrow functions где уместно.

---

### 3.2 [HIGH] Смешивание подходов к DOM-созданию

**Файл:** `script.js`

Некоторые элементы создаются через `document.createElement` (правильно), а некоторые через `innerHTML` (небезопасно и менее производительно). Нет единого подхода.

**Примеры:**
- EE-04 (CDE menu): `document.createElement` — хорошо
- EE-Solarized: `document.createElement` — хорошо
- Section label rotation: прямое присвоение `label.textContent` — хорошо
- i18n HTML translations: `innerHTML` (строка 464) — плохо

**Решение:** Унифицировать подход. Использовать `createElement` + `textContent` для пользовательского текста. `innerHTML` только для безопасных HTML-шаблонов.

---

### 3.3 [MEDIUM] Неконсистентные имена переменных

**Файл:** `script.js`

- `typingSubitle` — опечатка, должно быть `typingSubtitle` (строка 613)
- `eeLogoPre` — неочевидное сокращение (строка 74)
- `c`, `ci`, `si`, `pi`, `pj`, `pk` — однобуквенные итераторы без контекста

**Решение:** Исправить опечатку, заменить однобуквенные переменные на осмысленные имена.

---

### 3.4 [MEDIUM] Shadowing переменных

**Файл:** `script.js`

Переменная `navLinks` объявлена дважды в одной области видимости (строки 597 и 762). Через `var` это не ошибка (hoisting), но создаёт путаницу.

Переменная `html` используется и как `document.documentElement` (строка 384), и как локальная в `initLogoReveal` (строка 505). Вложенная IIFE создаёт свой `html`, затеняя внешний.

**Решение:** Использовать `const`/`let`, что автоматически поймает shadowing. Переименовать конфликтующие переменные.

---

### 3.5 [MEDIUM] Неконсистентное использование data-атрибутов

**Файл:** `index.html`, `script.js`

- `data-i18n` — текстовый контент
- `data-i18n-html` — HTML-контент
- `data-glitch` — визуальный эффект (не работает)
- `data-ee-key` — ключ перевода для пасхалки
- `data-section` — идентификатор секции
- `data-ee-theme` — тема пасхалки
- `data-theme` — основная тема
- `data-pi` — индекс пикселя логотипа

Нет системы именования: некоторые используют `data-ee-*`, некоторые нет. Одни используются в CSS, другие только в JS.

**Решение:** Ввести конвенцию: `data-ee-*` для пасхалок, `data-i18n*` для переводов, `data-ui-*` для UI-состояния.

---

### 3.6 [LOW] Неконсистентные отступы в HTML

**Файл:** `index.html`

ASCII-арт логотипа (строки 57-63) не имеет отступов, тогда как остальной HTML использует 4 пробела. Блок HTML-комментария пасхалки (строки 19-46) имеет смешанные отступы.

**Решение:** Выровнять. Для ASCII-арта допустимо без отступов, но должно быть осознанным решением.

---

## 4. ОШИБКИ АРХИТЕКТУРЫ

### 4.1 [CRITICAL] Монолитный файл на 1255 строк

**Файл:** `script.js`

Весь JavaScript — один файл без модульной структуры. Содержит:
- Менеджер пасхалок (70 строк)
- Систему переводов (300+ строк)
- Логику навигации (30 строк)
- Typing-эффект (50 строк)
- IntersectionObserver логику (80 строк)
- 6+ пасхалок (400+ строк)
- UI-утилиты (toast, scroll, progress)

**Решение:** Разбить на модули:
- `i18n.js` — переводы и локализация
- `ee-manager.js` — менеджер пасхалок
- `ui/scroll-progress.js`
- `ui/navigation.js`
- `ui/typing.js`
- `ui/scroll-animations.js`
- `ee/console-drop.js`
- `ee/logo-morph.js`
- `ee/context-menu.js`
- `ee/solarized-dialog.js`
- `ee/visit-counter.js`
- `ee/select-secret.js`
- `main.js` — точка входа

Для лендинга без бандлера можно использовать ES-модули (`<script type="module">`) или_concatenation при сборке.

---

### 4.2 [HIGH] Трансляции захардкожены в JS

**Файл:** `script.js`, строки 85-382

Объект `translations` содержит 300+ строк маппингов EN/RU. При добавлении нового языка придётся редактировать JS-файл. Unicode-escape строки (\u0421\u043c...) нечитаемы.

**Решение:** Вынести переводы в отдельные JSON-файлы (`i18n/en.json`, `i18n/ru.json`). Загружать динамически или инлайнить при сборке.

---

### 4.3 [HIGH] Отсутствие системы состояний

**Файл:** `script.js`

Состояние приложения (текущий язык, тема, открыт ли burger-меню, typing-статус) разбросано по переменным в разных IIFE. Нет единой точки управления состоянием.

**Решение:** Создать простой state-объект с геттерами/сеттерами. Для лендинга без фреймворка достаточно паттерна Observer или EventEmitter.

---

### 4.4 [HIGH] eeManager — функция с побочными эффектами при чтении

**Файл:** `script.js`, строки 2-71

`getVisitCount()` одновременно читает, инкрементирует и записывает. Это нарушение принципа Command-Query Separation. Каждый «чтение» меняет состояние.

**Решение:** Разделить на `readVisitCount()` и `recordVisit()`.

---

### 4.5 [MEDIUM] Нет обработки отсутствующих DOM-элементов

**Файл:** `script.js`

Некоторые участки проверяют наличие элементов (`if (!logoPre) return`), другие — нет. Например:
- Строка 595: `burger.addEventListener('click', toggleMenu)` — `burger` может быть null
- Строка 598: `navLinks.forEach(...)` — `navLinks` может быть null если `navList` = null

**Решение:** Добавить проверки `if (!burger || !navList) return;` в начале каждого блока.

---

### 4.6 [MEDIUM] Неоптимальный IntersectionObserver для typing

**Файл:** `script.js`, строка 668

```javascript
var delay = Array.from(animatedElements).indexOf(entry.target) % 6;
```

`Array.from(animatedElements)` создаёт новый массив при каждом срабатывании observer. Для 20+ элементов это O(n) на каждый scroll checkpoint.

**Решение:** Предвычислить массив один раз или использовать `data-delay` атрибут.

---

### 4.7 [MEDIUM] Множественные scroll-обработчики

**Файл:** `script.js`

Отдельные `addEventListener('scroll', ...)` для:
- Progress bar (строка 707)
- CRT noise (через setTimeout)
- Section labels rotation

Нет единого scroll-обработчика. Каждый добавляет overhead.

**Решение:** Объединить в один throttled scroll-обработчик через `requestAnimationFrame`.

---

## 5. ОШИБКИ КАЧЕСТВА ВЁРСТКИ (HTML/CSS)

### 5.1 [HIGH] Отсутствует favicon

**Файл:** `index.html`

Нет `<link rel="icon" href="...">`. В браузере отображается стандартная иконка.

**Решение:** Добавить favicon. Можно создать через Canvas API динамически (как в EE-18 из концепта) или статический файл.

---

### 5.2 [HIGH] Фейковые контактные данные

**Файл:** `index.html`, строки 364, 370, 399, 404, 409

- `mailto:hello@example.com` — фейковый email
- `https://t.me/` — без username
- `https://github.com/` — без username
- `https://linkedin.com/` — без username

**Решение:** Заменить на реальные контактные данные перед деплоем.

---

### 5.3 [HIGH] `<span>` как прямые потомки `<main>`

**Файл:** `index.html`, строки 158, 211, 299, 354

```html
<section>...</section>
<span class="ee-secret-text" aria-hidden="true" data-ee-key="ee_select_1"></span>
<section>...</section>
```

`<span>` — inline-элемент, не может быть прямым потомком `<main>` между `<section>`. Нарушает семантику HTML5.

**Решение:** Заменить на `<div>`.

---

### 5.4 [MEDIUM] Отсутствует `<noscript>`

**Файл:** `index.html`

Весь сайт зависит от JavaScript (typing-эффект, анимации, навигация, пасхалки). Нет сообщения для пользователей с отключённым JS.

**Решение:** Добавить `<noscript><p>Enable JavaScript...</p></noscript>`.

---

### 5.5 [MEDIUM] Отсутствует OG-изображение

**Файл:** `index.html`

Есть `og:title`, `og:description`, `og:type`, но нет `og:image`. При шаринге в соцсетях не будет превью.

**Решение:** Добавить `<meta property="og:image" content="...">`.

---

### 5.6 [MEDIUM] z-index хаос

**Файл:** `styles.css`

Используются z-index: 100, 999, 1000, 1001, 9997, 9998, 9999, 10000, 10001, 10002, 10003. Нет системы. Риск коллизий при добавлении новых элементов.

```
z-index: 100    — scroll-status
z-index: 999    — scroll-progress
z-index: 1000   — header
z-index: 1001   — burger
z-index: 9997   — noise overlay
z-index: 9998   — vignette, crt-noise
z-index: 9999   — scanlines
z-index: 10000  — matrix overlay
z-index: 10001  — CDE menu
z-index: 10002  — toast, modal
z-index: 10003  — solarized overlay
```

**Решение:** Ввести CSS-переменные для z-index слоёв:

```css
--z-base: 1;
--z-overlay: 100;
--z-header: 1000;
--z-effects: 5000;
--z-effects-top: 9000;
--z-ee-base: 10000;
--z-ee-toast: 10001;
--z-ee-modal: 10002;
--z-ee-top: 10003;
```

---

### 5.7 [MEDIUM] Хардкод цветов вместо переменных

**Файл:** `styles.css`

- Строка 1453: `background: rgba(0, 0, 0, 0.3)` в `.ee-cde-menu` — должно использовать `--glow-color` или отдельную переменную
- Строка 1515: `background: rgba(0, 0, 0, 0.5)` в `.ee-modal-overlay`
- Строка 1582: `background: rgba(0, 0, 0, 0.5)` в `.ee-solarized-overlay`
- Строка 1652: `border: 1px solid rgba(0, 0, 0, 0.2)` в `.ee-solarized-swatch`

**Решение:** Вынести в CSS-переменные или использовать существующие.

---

### 5.8 [MEDIUM] Хардкод размеров вместо переменных

**Файл:** `styles.css`

- Строка 1055: `min-width: 280px` — `.ee-cde-menu`
- Строка 1128: `min-width: 240px` — `.contact__terminal-block`
- Строка 1527: `min-width: 320px`, `max-width: 400px` — `.ee-about-modal`
- Строка 1592: `min-width: 360px`, `max-width: 440px` — `.ee-solarized-dialog`

**Решение:** Вынести в CSS-переменные или хотя бы добавить комментарии с обоснованием.

---

### 5.9 [LOW] Одинаковые анимации blink и statusPulse

**Файл:** `styles.css`, строки 603-606 и 709-712

```css
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

@keyframes statusPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}
```

Идентичные анимации с разными названиями.

**Решение:** Удалить `statusPulse`, использовать `blink`.

---

### 5.10 [LOW] -webkit-scrollbar без Firefox-аналога

**Файл:** `styles.css`, строки 99-114

Стилизация скроллбара только для WebKit/Blink. В Firefox будет стандартный скроллбар.

**Решение:** Добавить `scrollbar-width: thin; scrollbar-color: ...` для Firefox, либо принять текущее поведение.

---

### 5.11 [LOW] body padding-bottom для scroll-progress

**Файл:** `styles.css`, строка 141

```css
body {
    padding-bottom: 20px;
}
```

Компенсирует scroll-progress bar внизу. На мобильных убирается (строка 1845), но scroll-progress тоже скрывается. На десктопе если scroll-progress скроется — отступ останется.

**Решение:** Использовать `margin-bottom` на `footer` или `main`, а не `padding-bottom` на `body`.

---

## 6. СЕМАНТИЧЕСКИЕ ОШИБКИ

### 6.1 [HIGH] `<pre>` внутри `<a>` — нарушение контентной модели

**Файл:** `index.html`, строки 56-64

```html
<a href="#hero" class="nav__logo" aria-label="MILINSKY">
    <pre class="nav__logo-ascii" ...>ASCII-арт</pre>
</a>
```

`<pre>` внутри `<a>` технически валидно в HTML5, но интерактивный контент внутри ссылки может вызывать проблемы с доступностью и фокусом. К тому же, клики на `<pre>` внутри_logo-link перехватываются EE-03 (logo morph), который делает `e.preventDefault()`.

**Решение:** Рассмотреть замену `<a>` на `<div role="link" tabindex="0">` или разделить клик-зоны.

---

### 6.2 [MEDIUM] Неполная ARIA на burger-меню

**Файл:** `index.html`, `script.js`

- `aria-expanded` обновляется корректно
- `aria-label` обновляется при смене языка
- Но `navList` не имеет `role="dialog"` или `aria-modal="true"` когда открыт
- Нет `aria-controls` связи между burger и navList

**Решение:** Добавить `aria-controls="navList"` на burger, `role="navigation" aria-label="Main navigation"` на nav.

---

### 6.3 [MEDIUM] Необходимость lang-атрибута для каждого языка

**Файл:** `index.html`

При переключении на русский, `html lang="ru"`, но тексты внутри не обёрнуты в `<span lang="ru">`. Скринридеры могут использовать неправильную фонетику для отдельных слов.

**Решение:** Приемлемо для лендинга, но при расширении — обернуть языковые блоки.

---

### 6.4 [LOW] Семантика section labels

**Файл:** `index.html`, строки 126, 163, 215, 304, 360

`<span class="section__label">` — декоративный элемент, не несущий семантической нагрузки. Если его прочтёт скринридер, пользователь услышит `> section_01 --about_`, что бессмысленно.

**Решение:** Добавить `aria-hidden="true"` к `.section__label`.

---

### 6.5 [LOW] Терминальные элементы без aria-hidden

**Файл:** `index.html`

- `.hero__terminal-controls` имеет `aria-hidden="true"` — хорошо
- `.expertise__terminal-controls` — не имеет `aria-hidden` — плохо
- `.expertise__code` — декоративный код без `aria-hidden`
- `.contact__terminal-block` — декоративный, но читается скринридером

**Решение:** Добавить `aria-hidden="true"` к декоративным терминальным элементам.

---

## 7. НЕВЕРНЫЕ ТИПЫ / ТИПИЗАЦИЯ

### 7.1 [HIGH] Отсутствие TypeScript / JSDoc

**Файл:** `script.js`

Весь JS — чистый JavaScript без типов. Нет JSDoc-аннотаций, нет TypeScript. Функции принимают и возвращают значения без контракта.

Для проекта, который планируется покрывать тестами — это усложняет написание тестов и рефакторинг.

**Решение:** Либо мигрировать на TypeScript, либо добавить JSDoc-аннотации с `@param`, `@returns`, `@type`.

---

### 7.2 [MEDIUM] Слабая типизация в eeManager

**Файл:** `script.js`

- `discovered` — массив, но используется как Set (проверка через `indexOf`)
- `seedNum` — `parseFloat(rawSeed)` где `rawSeed` = `String(Math.random())` — всегда валидно, но неявно
- `getDailySeed()` возвращает `number`, но не проверяет на `Infinity` при переполнении `hash << 5`

**Решение:** Использовать `Set` вместо массива для `discovered`. Добавить проверку на `Infinity`.

---

### 7.3 [MEDIUM] Сравнение с indexOf вместо includes

**Файл:** `script.js`, строки 24, 30

```javascript
if (discovered.indexOf(id) === -1) { ... }
return discovered.indexOf(id) !== -1;
```

`includes()` доступен во всех современных браузерах и читается лучше.

**Решение:** Заменить на `discovered.includes(id)`.

---

## 8. ПРОБЛЕМЫ ПРОИЗВОДИТЕЛЬНОСТИ

### 8.1 [MEDIUM] Множество IntersectionObserver экземпляров

**Файл:** `script.js`

Создано 3 отдельных IntersectionObserver:
1. Для scroll-анимаций (строка 664)
2. Для активной навигации (строка 764)
3. Для scroll-status (строка 789)
4. Для syslog typing (строка 817)

Можно объединить некоторые или использовать один root callback.

**Решение:** Объединить observers с общим rootMargin. Оставить separate только если конфигурация существенно отличается.

---

### 8.2 [MEDIUM] CRT noise — рекурсивный setTimeout

**Файл:** `script.js`, строки 726-738

```javascript
(function runNoise() {
    var delay = 3000 + Math.random() * 6000;
    setTimeout(function () {
        ...
        runNoise();
    }, delay);
})();
```

Рекурсивный `setTimeout` без возможности отмены. Если страница открыта в фоновой вкладке — таймеры накапливаются.

**Решение:** Использовать `requestAnimationFrame` с проверкой видимости через `document.hidden`.

---

### 8.3 [LOW] Font-loading без font-display

**Файл:** `index.html`, строка 15

Google Fonts URL не содержит `&display=swap`. Хотя в CSS `font-display` не указан, браузер может использовать FOUT/FOIT стратегию.

**Решение:** Добавить `&display=swap` к Google Fonts URL.

---

### 8.4 [LOW] Нет preloading критических ресурсов

**Файл:** `index.html`

Шрифты подключены через `<link>`, но нет `<link rel="preload">` для CSS или критических шрифтов.

**Решение:** Добавить preload для критического CSS и основных шрифтов.

---

## 9. НЕНУЖНЫЕ КОММЕНТАРИИ

### 9.1 [MEDIUM] HTML-комментарий пасхалки с дублированным ASCII

**Файл:** `index.html`, строки 19-46

ASCII-арт MILINSKY повторяется дважды в комментарии (строки 20-24 и 33-36). Второй — обрезанный, бессмысленный.

```
     ____  _     _ _   _ _____   ____ _  ______ _____   ← полный
    ...
     | |   | | \ | |  __ \ / __| |/ / ___|_   _|        ← обрезанный повтор
```

**Решение:** Удалить дублирующийся ASCII-арт (строки 32-36). Оставить один完整 вариант + текст.

---

### 9.2 [LOW] Отсутствие комментариев в коде

**Файл:** `script.js`

Код почти не содержит комментариев. Для монолитного файла на 1255 строк это проблема читаемости. Каждый IIFE-блок должен иметь комментарий с идентификатором функции.

**Решение:** Добавить блочные комментарии к каждому функциональному блоку:

```javascript
// === EE-03: Logo Morph ===
// Triple-click (7 clicks < 3.5s) triggers matrix rain + ASCII art swap
```

---

## 10. ПРОБЛЕМЫ ДОСТУПНОСТИ (a11y)

### 10.1 [HIGH] Контрастность текста в некоторых местах

**Файл:** `styles.css`

- `.section__label` — `opacity: 0.8` + `var(--accent)` на `var(--bg)` — может не проходить WCAG AA
- `.footer__legal` — `opacity: 0.6` — уменьшает контрастность
- `.footer__syslog` — `opacity: 0.35` — критически низкая контрастность
- `.expertise__feature-number` — `opacity: 0.6`
- `.ee-visit-msg` — `opacity: 0.7`

`aria-hidden="true"` стоит только на `syslog`, но не на `section__label` и `feature-number`.

**Решение:** Для декоративных элементов — `aria-hidden`. Для читаемых — обеспечить минимальный контраст 4.5:1.

---

### 10.2 [MEDIUM] Клавиатурная навигация пасхалок

**Файл:** `script.js`

- EE-04 (контекстное меню): Не активируется с клавиатуры (только правый клик / долгое нажатие)
- EE-03 (logo morph): Требует 7 быстрых кликов — недоступен с клавиатуры
- Solarized dialog: Двойной клик на theme toggle — недоступен с клавиатуры

**Решение:** Для пасхалок допустимо, но основные функции (контакт, навигация) должны быть полностью доступны с клавиатуры.

---

### 10.3 [MEDIUM] Focus trap в открытом burger-меню

**Файл:** `script.js`

При открытии burger-меню `body.style.overflow = 'hidden'`, но нет focus trap. Пользователь может Tab'ом уйти за пределы меню.

**Решение:** Добавить focus trap: при открытии — фокус на первый элемент меню, при Tab с последнего — переход на первый.

---

## СВОДНАЯ ТАБЛИЦА

| # | Критичность | Категория | Описание | Файл |
|---|-------------|-----------|----------|------|
| 1.1 | CRITICAL | Мёртвый код | Дублирование объявления eeOriginalLogo/eeLogoPre | script.js:73-83 |
| 1.2 | HIGH | Мёртвый код | Дублирование массива altArts | script.js:991-1034 |
| 1.3 | HIGH | Мёртвый код | Дублирование .retro-card в CSS | styles.css:657-659 |
| 1.4 | HIGH | Мёртвый код | Дублирование .nav__link в CSS | styles.css:1214-1216 |
| 1.5 | MEDIUM | Мёртвый код | Пустое правило .typing-text | styles.css:747-748 |
| 1.6 | MEDIUM | Мёртвый код | Избыточный sectionNames | script.js:785 |
| 1.7 | LOW | Мёртвый код | Неиспользуемая --space-3xl | styles.css:27 |
| 1.8 | LOW | Мёртвый код | Неиспользуемый .glow-divider | styles.css:273-278 |
| 2.1 | CRITICAL | Баг | Glitch-эффект не работает | styles.css:1396 |
| 2.2 | CRITICAL | Баг | Двойной инкремент visit count | script.js:33-51 |
| 2.3 | HIGH | Баг | Ротация лейблов зависит от DOM-порядка | script.js:741-758 |
| 2.4 | HIGH | Баг | Молчаливое проглатывание ошибок | script.js (все catch) |
| 2.5 | MEDIUM | Баг | innerHTML с непроверенными данными | script.js:464,1094 |
| 2.6 | MEDIUM | Баг | Некорректный триггер typing | script.js:673-676 |
| 2.7 | MEDIUM | Баг | touchstart passive + context menu | script.js:1167 |
| 2.8 | LOW | Баг | Math.random() как seed | script.js:14 |
| 3.1 | HIGH | Неконсистентность | var вместо let/const | script.js (весь) |
| 3.2 | HIGH | Неконсистентность | Смешивание DOM-подходов | script.js |
| 3.3 | MEDIUM | Неконсистентность | Опечатка typingSubitle | script.js:613 |
| 3.4 | MEDIUM | Неконсистентность | Shadowing переменных | script.js |
| 3.5 | MEDIUM | Неконсистентность | Хаос data-атрибутов | index.html |
| 3.6 | LOW | Неконсистентность | Отступы в HTML | index.html |
| 4.1 | CRITICAL | Архитектура | Монолитный 1255-строчный файл | script.js |
| 4.2 | HIGH | Архитектура | Переводы захардкожены в JS | script.js:85-382 |
| 4.3 | HIGH | Архитектура | Нет системы состояний | script.js |
| 4.4 | HIGH | Архитектура | Побочные эффекты в getVisitCount | script.js:33-51 |
| 4.5 | MEDIUM | Архитектура | Нет null-check для DOM | script.js |
| 4.6 | MEDIUM | Архитектура | Array.from в Observer callback | script.js:668 |
| 4.7 | MEDIUM | Архитектура | Множественные scroll-обработчики | script.js |
| 5.1 | HIGH | Вёрстка | Нет favicon | index.html |
| 5.2 | HIGH | Вёрстка | Фейковые контакты | index.html |
| 5.3 | HIGH | Вёрстка | span вместо div между секциями | index.html |
| 5.4 | MEDIUM | Вёрстка | Нет noscript | index.html |
| 5.5 | MEDIUM | Вёрстка | Нет OG-изображения | index.html |
| 5.6 | MEDIUM | Вёрстка | z-index хаос | styles.css |
| 5.7 | MEDIUM | Вёрстка | Хардкод цветов | styles.css |
| 5.8 | MEDIUM | Вёрстка | Хардкод размеров | styles.css |
| 5.9 | LOW | Вёрстка | Дублирование blink/statusPulse | styles.css |
| 5.10 | LOW | Вёрстка | WebKit-only scrollbar | styles.css |
| 5.11 | LOW | Вёрстка | body padding-bottom хак | styles.css:141 |
| 6.1 | HIGH | Семантика | pre внутри a | index.html:56-64 |
| 6.2 | MEDIUM | Семантика | Неполная ARIA на burger | index.html |
| 6.3 | MEDIUM | Семантика | lang для каждого блока | index.html |
| 6.4 | LOW | Семантика | section__label без aria-hidden | index.html |
| 6.5 | LOW | Семантика | Терминальные элементы без aria-hidden | index.html |
| 7.1 | HIGH | Типы | Нет TypeScript / JSDoc | script.js |
| 7.2 | MEDIUM | Типы | Array вместо Set в eeManager | script.js |
| 7.3 | MEDIUM | Типы | indexOf вместо includes | script.js |
| 8.1 | MEDIUM | Производительность | 4 IntersectionObserver | script.js |
| 8.2 | MEDIUM | Производительность | Рекурсивный setTimeout без отмены | script.js:726-738 |
| 8.3 | LOW | Производительность | Нет font-display: swap | index.html:15 |
| 8.4 | LOW | Производительность | Нет preloading | index.html |
| 9.1 | MEDIUM | Комментарии | Дублирование ASCII в HTML-комментарии | index.html:19-46 |
| 9.2 | LOW | Комментарии | Нет комментариев в JS | script.js |
| 10.1 | HIGH | Доступность | Низкая контрастность | styles.css |
| 10.2 | MEDIUM | Доступность | Пасхалки без клавиатуры | script.js |
| 10.3 | MEDIUM | Доступность | Нет focus trap в burger-меню | script.js |

---

## ИТОГО

- **CRITICAL:** 4 проблемы
- **HIGH:** 16 проблем
- **MEDIUM:** 24 проблемы
- **LOW:** 12 проблем

**Всего: 56 проблем**

---

## ПРИОРИТЕТ РЕФАКТОРИНГА

### Фаза 1: Критические исправления (до рефакторинга)
1. Удалить дублирующиеся объявления (1.1)
2. Исправить двойной инкремент visit count (2.2)
3. Починить или удалить glitch-эффект (2.1)
4. Заменить `<span>` на `<div>` между секциями (5.3)

### Фаза 2: Модульная декомпозиция
1. Разбить script.js на модули (4.1)
2. Вынести переводы в JSON (4.2)
3. Добавить систему состояний (4.3)

### Фаза 3: Очистка CSS
1. Удалить дублирующиеся правила (1.3, 1.4)
2. Систематизировать z-index (5.6)
3. Заменить хардкод на переменные (5.7, 5.8)
4. Удалить мёртвый CSS (1.5, 1.8, 5.9)

### Фаза 4: Модернизация JS
1. Заменить var на const/let (3.1)
2. Использовать Set вместо Array в eeManager (7.2)
3. Добавить null-check (4.5)
4. Добавить JSDoc (7.1)

### Фаза 5: Доступность и семантика
1. Исправить контрастность (10.1)
2. Добавить aria-hidden к декоративным элементам (6.4, 6.5)
3. Focus trap в burger-меню (10.3)
4. Добавить favicon и OG-image (5.1, 5.5)

### Фаза 6: Финализация
1. Заменить фейковые контакты (5.2)
2. Добавить noscript (5.4)
3. Добавить font-display (8.3)
4. Очистить HTML-комментарий (9.1)
