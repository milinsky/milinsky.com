# План покрытия тестами — MILINSKY Landing

Дата: 2026-05-13
Целевое покрытие: **≥95%**
Фреймворк: Vitest + happy-dom
Файлов для тестирования: 1 (script.js, 1341 строк)

---

## 1. Инфраструктура

### 1.1 Зависимости

```
npm install -D vitest happy-dom @vitest/coverage-v8
```

### 1.2 Конфигурация vitest.config.js

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            thresholds: {
                statements: 95,
                branches: 90,
                functions: 95,
                lines: 95,
            },
            include: ['script.js'],
        },
        setupFiles: ['./tests/setup.js'],
    },
});
```

### 1.3 Тестовый setup (tests/setup.js)

Подготовка минимального DOM для каждого теста:

```js
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
});
```

### 1.4 Проблема тестируемости

Текущий код — единая IIFE `(function () { ... })()`. Все функции замкнуты внутри и не экспортируются. Для тестирования нужна **модуляризация** — разделение на файлы с экспортами.

---

## 2. Модуляризация (предварительный этап)

Разделить `script.js` на модули, каждый из которых экспортирует свой API:

```
src/
├── ee-manager.js          — Easter Egg Manager (Set, localStorage)
├── translations.js        — Объект переводов (чистые данные)
├── i18n.js                — eeT(), applyLanguage()
├── theme.js               — Переключение темы, хранение
├── navigation.js          — Burger-меню, toggle, close
├── typing.js              — Typing-эффект, reserveHeight
├── scroll-progress.js     — Прогресс-бар скролла
├── visual-effects.js      — Scanlines, CRT noise, label rotation
├── scroll-tracking.js     — Active nav, scroll status, syslog
├── ee/
│   ├── console-drop.js    — EE-06: Console.log рамка
│   ├── logo-reveal.js     — Анимация появления логотипа
│   ├── logo-morph.js      — EE-03: 7 кликов → matrix rain
│   ├── context-menu.js    — EE-04: Правый клик → CDE меню
│   ├── solarized.js       — Solarized диалог (dblclick)
│   ├── select-secret.js   — EE-11: Выделить всё
│   ├── visit-counter.js   — EE-16: Сообщения при визитах
│   └── toast.js           — eeShowToast утилита
├── main.js                — Точка входа, инициализация
```

**Альтернатива без модуляризации**: Тестировать через `eval` файла в контексте с mock-DOM. Менее чисто, но не требует изменения продакшн-кода. Для лендинга без бандлера — приемлемо.

**Рекомендация**: Модуляризация. Это позволяет:
- Тестировать каждую единицу изолированно
- Импортировать только нужные модули
- Достичь 95%+ покрытия без хаков
- Использовать ES-модули (`<script type="module">`)

### Сборка для продакшна

Без бандлера: каждый файл подключается через `<script type="module">`. Браузер кэширует модули отдельно.

---

## 3. Тестовые наборы (Test Suites)

### 3.1 ee-manager.js — Целевое покрытие: **100%**

Чистая логика, нет DOM-зависимостей.

| Тест | Что проверяет |
|------|---------------|
| `discover` добавляет id в Set | `discover('ee01')` → `isDiscovered('ee01') === true` |
| `discover` не дублирует | Дважды `discover('ee01')` → Set size = 1 |
| `isDiscovered` возвращает false для неизвестных | `isDiscovered('unknown') === false` |
| `recordVisit` инкрементит счётчик | Первый визит → 1, второй → 2 |
| `recordVisit` сохраняет ee_first_visit при первом визите | После `recordVisit()` → localStorage содержит ee_first_visit |
| `recordVisit` НЕ перезаписывает ee_first_visit при повторных | Второй вызов → дата не меняется |
| `getVisitCount` только читает | Вызов дважды → одно и то же значение |
| `getVisitCount` возвращает 0 при пустом хранилище | Без данных → 0 |
| `getVisitCount` обрабатывает NaN | `localStorage.setItem('ee_visit_count', 'abc')` → 0 |
| `getSessionSeed` возвращает число от 0 до 1 | `0 <= seed < 1` |
| `getDailySeed` детерминирован | Тот же день → тот же seed |
| `getDailySeed` отличается для разных дней | Мок даты → другой seed |
| Сохранение в localStorage при ошибке парсинга | `JSON.parse('invalid')` → discovered = пустой Set |
| Ошибка записи в localStorage | `setItem` бросает → console.warn вызван |

**Количество тестов: ~15**

---

### 3.2 translations.js — Целевое покрытие: **100%**

Чистые данные.

| Тест | Что проверяет |
|------|---------------|
| Каждый ключ имеет `en` | Проверка что для каждого key существует `key.en` |
| Каждый ключ имеет `ru` | Проверка что для каждого key существует `key.ru` |
| Нет пустых строк | Ни одно значение не является `''` |
| HTML-переводы содержат `<br>` или `<span>` | Ключи с `data-i18n-html` имеют HTML-теги |
| Ключи с placeholder `#N` промаркированы | `ee_visit_2/5/10/20` содержат `#N` |
| Полный набор ключей | Количество ключей = ожидаемое (около 60+) |

**Количество тестов: ~8**

---

### 3.3 i18n.js — Целевое покрытие: **98%**

Функции `eeT()` и `applyLanguage()`.

| Тест | Что проверяет |
|------|---------------|
| `eeT` возвращает перевод для текущего языка | `eeT('nav_about')` при `lang='en'` → 'About' |
| `eeT` возвращает RU перевод | `eeT('nav_about')` при `lang='ru'` → 'Обо мне' |
| `eeT` fallback на EN при отсутствии языка | Несуществующий язык → EN значение |
| `eeT` возвращает ключ при отсутствии перевода | `eeT('nonexistent_key')` → 'nonexistent_key' |
| `applyLanguage` обновляет `html lang` | `applyLanguage('ru')` → `html.lang === 'ru'` |
| `applyLanguage` обновляет `textContent` элементов `[data-i18n]` | Все элементы получили перевод |
| `applyLanguage` обновляет `innerHTML` элементов `[data-i18n-html]` | HTML-элементы получили перевод с тегами |
| `applyLanguage` обновляет meta description | `<meta name="description">` content обновился |
| `applyLanguage` обновляет og:description | `<meta property="og:description">` обновился |
| `applyLanguage` обновляет `document.title` | Title = 'MILINSKY — AI Специалист...' при RU |
| `applyLanguage` обновляет aria-label burger | `aria-label` = 'Открыть меню' при RU |
| `applyLanguage` обновляет aria-label theme toggle | `aria-label` переключился |
| `applyLanguage` обновляет текст кнопки языка | `.lang-toggle__text` = 'RU' |
| `applyLanguage` fallback при отсутствии meta-тега | Нет `<meta>` → нет ошибки |

**Количество тестов: ~15**

---

### 3.4 theme.js — Целевое покрытие: **95%**

| Тест | Что проверяет |
|------|---------------|
| Тема из localStorage применяется | `localStorage.theme='light'` → `data-theme="light"` |
| Fallback на prefers-color-scheme dark | Нет localStorage, dark scheme → `data-theme="dark"` |
| Клик переключает dark → light | Клик → `data-theme` меняется |
| Клик переключает light → dark | Обратное переключение |
| Тема сохраняется в localStorage | После клика → `localStorage.theme` обновился |
| Dblclick вызывает Solarized диалог | dblclick → диалог появляется в DOM |
| Слушатель prefers-color-scheme | Эмуляция change event → тема обновляется если нет сохранённой |
| Слушатель НЕ обновляет при наличии сохранённой темы | Есть localStorage.theme → смена prefers не влияет |

**Количество тестов: ~8**

---

### 3.5 navigation.js — Целевое покрытие: **95%**

| Тест | Что проверяет |
|------|---------------|
| toggleMenu добавляет класс 'active' | Клик → `.active` на burger |
| toggleMenu добавляет класс 'open' | Клик → `.open` на navList |
| toggleMenu обновляет aria-expanded | `aria-expanded` = 'true' при открытии |
| toggleMenu блокирует scroll | `body.overflow` = 'hidden' при открытии |
| closeMenu убирает все классы | closeMenu → нет `.active`, `.open` |
| closeMenu восстанавливает scroll | closeMenu → `body.overflow` = '' |
| Клик по ссылке закрывает меню | Клик на `.nav__link` → closeMenu |
| Клик вне меню закрывает его | Клик мимо → closeMenu |
| Клик внутри меню НЕ закрывает | Клик на пункт → остаётся открытым |

**Количество тестов: ~9**

---

### 3.6 typing.js — Целевое покрытие: **95%**

| Тест | Что проверяет |
|------|---------------|
| `getTypingText` возвращает EN текст по умолчанию | EN строка |
| `getTypingText` возвращает RU при смене языка | RU строка |
| `reserveTypingHeight` задаёт minHeight | После вызова → `minHeight` не пустой |
| `reserveTypingHeight` сбрасывает текст | После → `typingElement.textContent` = '' |
| `startTyping` печатает первый символ | После вызова → textContent.length = 1 |
| `startTyping` игнорирует повторный вызов | Дважды → текст не дублируется |
| `typeNextChar` продвигает индекс | После нескольких вызовов → текст растёт |
| `restartTyping` сбрасывает состояние | После → индекс = 0, started = false |
| `restartTyping` перезапускает если элемент видим | При `.is-visible` → setTimeout(startTyping) |
| `restartTyping` НЕ перезапускает если невидим | Без `.is-visible` → нет setTimeout |

**Исключение**: Полный цикл typeNextChar до конца строки с setTimeout трудно покрыть — нужны `vi.useFakeTimers()`. Покрытие может быть 93% из-за граничных условий таймеров.

**Количество тестов: ~12**

---

### 3.7 scroll-progress.js — Целевое покрытие: **98%**

| Тест | Что проверяет |
|------|---------------|
| Прогресс обновляется при скролле | `window.scrollY` = 50% → ширина бара 50% |
| Текст обновляется | `progressText.textContent` = '50%' |
| 0% в начале страницы | scrollY = 0 → '0%' |
| 100% в конце | scrollY = maxHeight → '100%' |
| Не превышает 100% | scrollY > docHeight → '100%' |
| Passive listener | Проверка что scroll listener passive |
| Null guard если элементы отсутствуют | Без progressBar → нет ошибки |

**Количество тестов: ~7**

---

### 3.8 visual-effects.js — Целевое покрытие: **90%**

Наиболее проблемный модуль для тестирования: много setTimeout, анимации, IntersectionObserver.

| Тест | Что проверяет |
|------|---------------|
| Scanline элементы добавлены к retro-cards | После инициализации → `.card-scanline` внутри каждой карточки |
| Scanline имеет aria-hidden | `aria-hidden="true"` |
| CRT noise позиционируется | Вызов → `style.top` задан |
| CRT noise проверяет `document.hidden` | При hidden → рекурсия откладывается |
| Label rotation обновляет текст | Через fake timers → текст содержит [OK]/[READY] |
| Label rotation восстанавливает оригинальный текст | После таймаута → оригинал |
| Label rotation использует кэш оригинала | Несколько ротаций → один и тот же оригинал |
| IntersectionObserver fallback при отсутствии | `IntersectionObserver` = undefined → классы добавлены |
| Section divider генерируется | `.section + .section::before` контент |

**Исключение (~90%)**: Ветки `document.hidden` в CRT noise трудно воспроизвести синхронно. Граничные случаи с `Math.random()` в задержках.

**Количество тестов: ~10**

---

### 3.9 scroll-tracking.js — Целевое покрытие: **93%**

| Тест | Что проверяет |
|------|---------------|
| Активная навигация обновляется | Intersection с секцией → `.nav__link--active` на ссылке |
| Предыдущая активная ссылка деактивируется | Новая секция → старая ссылка без класса |
| Scroll status показывает адрес секции | `[SYS] LOAD MOD 0x1A2B` для about |
| Scroll status flash анимация | Класс `scroll-status--visible` добавляется и удаляется |
| Syslog typing в футере | Footer виден → текст печатается посимвольно |
| Syslog один раз | Второй Intersection → нет повторной печати |
| Section map содержит все секции | about, services, results, expertise, contact |

**Исключение (~93%)**: IntersectionObserver mock необходим. Полный цикл анимации flash-status трудно проверить синхронно.

**Количество тестов: ~8**

---

### 3.10 ee/toast.js — Целевое покрытие: **100%**

| Тест | Что проверяет |
|------|---------------|
| Toast создаётся с классом `ee-toast` | После вызова → div.ee-toast в DOM |
| Toast текст = переданное сообщение | `textContent` = аргумент |
| Toast становится видимым через 10ms | Fake timers → `.ee-toast--visible` |
| Toast удаляется после duration | Fake timers → элемент удалён из DOM |
| Default duration = 3000ms | Без второго аргумента → таймаут 3000 |
| Toast корректно удаляется (remove()) | После duration + 300ms → элемент отсутствует |

**Количество тестов: ~6**

---

### 3.11 ee/console-drop.js — Целевое покрытие: **95%**

| Тест | Что проверяет |
|------|---------------|
| console.log вызывается 7 раз (рамка + логи) | Mock console.log → 7 вызовов |
| Рамка содержит текст из eeT | Строка рамки содержит перевод |
| padding рассчитывается корректно | Длинная строка → padding = 0 |
| Выбирается правильный набор логов по дневному seed | Mock getDailySeed → конкретный набор |
| discover('ee06') вызывается | После выполнения → `isDiscovered('ee06')` |

**Исключение (~95%)**: Точное содержание console.log строк — косвенно через mock. Ветка с padding > 0 требует короткого перевода.

**Количество тестов: ~5**

---

### 3.12 ee/logo-morph.js — Целевое покрытие: **88%**

Самый сложный для тестирования модуль. Зависит от: 7 быстрых кликов, setTimeout, Math.random, reduced-motion.

| Тест | Что проверяет |
|------|---------------|
| Клик по логотипу записывает timestamp | 1 клик → clicks.length = 1 |
| 7 кликов за 3.5с активируют morph | 7 кликов < 3500ms → morphActive = true |
| 8-й клик за 4с НЕ активирует | 8 кликов, первый и последний > 3500ms |
| Morph при reduced-motion показывает toast | `eeReducedMotion = true` → toast |
| Morph при reduced-motion показывает ASCII-арт | `eeLogoPre.textContent` = один из altArts |
| Morph при reduced-motion восстанавливает логотип | Через 3000ms → оригинальный текст |
| Matrix overlay создаётся | overlay с классом `ee-matrix-overlay` в DOM |
| Matrix columns = Math.floor(window.innerWidth / 20) | Количество column-элементов |
| discover('ee03') вызывается | После активации |
| Логотип восстанавливается через 5000ms (2000+3000) | Fake timers → оригинальный текст |
| altArts массив не дублируется | Один набор, корректные строки |

**Исключение (~88%)**:
- Ветка с нормальным matrix rain → сложная цепочка setTimeout (2s + 3s)
- `Math.random()` в задержках колонок
- Ветка где morphActive = true (8-й клик при активном morph)

**Количество тестов: ~11**

---

### 3.13 ee/context-menu.js — Целевое покрытие: **95%**

| Тест | Что проверяет |
|------|---------------|
| contextmenu создаёт меню | Правый клик → `.ee-cde-menu` в DOM |
| Меню позиционировано корректно | `style.left` <= `window.innerWidth - 300` |
| Позиция ограничена снизу | `style.top` <= `window.innerHeight - 200` |
| Заголовок = 'MILINSKY.OS' | `.ee-cde-menu__header` textContent |
| Пункты меню = 5 штук | 5 элементов `.ee-cde-menu__item` |
| Разделители добавлены после 1-го и 3-го | 2 разделителя `.ee-cde-menu__sep` |
| Порядок пунктов рандомизирован | Разный seed → разный порядок |
| shuffleArray корректно перемешивает | Seed → детерминированный результат |
| Клик вне меню закрывает его | Клик мимо → меню удалено |
| Escape закрывает меню | keydown Escape → меню удалено |
| Escape закрывает modal overlay | keydown Escape → overlay удалён |
| Пункт "About" открывает модал | Клик → `.ee-about-modal` в DOM |
| Модал "About" содержит версию | innerHTML содержит 'MILINSKY.OS v4.2.0' |
| Кнопка [OK] закрывает модал | Клик → overlay удалён |
| Клик на overlay закрывает модал | Клик мимо модала → удалено |
| Пункт "Source" показывает toast | Клик → `.ee-toast` в DOM |
| Пункт "Print" вызывает window.print | Клик → `window.print` вызван |
| Пункт "Theme" переключает cyberpunk | Клик → `data-ee-theme="cyberpunk"` |
| Пункт "Theme" повторно отключает | Второй клик → атрибут удалён |
| Пункт "Exit" показывает toast | Клик → toast с текстом 'no exit' |
| Touch long press создаёт меню | touchstart 500ms → меню |
| Touch move отменяет long press | touchstart + move > 10px → нет меню |
| Touch end отменяет таймер | touchend до 500ms → нет меню |
| Не создаётся при клике на существующее меню | Клик на `.ee-cde-menu` → игнор |

**Количество тестов: ~24**

---

### 3.14 ee/select-secret.js — Целевое покрытие: **93%**

| Тест | Что проверяет |
|------|---------------|
| Secret texts заполняются из eeT | Текст = перевод по data-ee-key |
| Ctrl+A триггерит checkSelection | Ctrl+A → `discover('ee11')` |
| Mouseup триггерит checkSelection | Mouseup → проверка selection |
| Touchend триггерит checkSelection | Touchend → проверка |
| discover вызывается только один раз | Повторный Ctrl+A → `discover` 1 раз |
| Без secret texts — нет ошибок | 0 элементов → нет ошибки |

**Исключение (~93%)**: `window.getSelection()` и `sel.containsNode()` — требуют сложной моки Selection API. Можно покрыть через `Object.defineProperty(window, 'getSelection', ...)`.

**Количество тестов: ~7**

---

### 3.15 ee/visit-counter.js — Целевое покрытие: **95%**

| Тест | Что проверяет |
|------|---------------|
| Визит 1 — сообщение НЕ показывается | `visitCount < 2` → нет элемента |
| Визит 2 — сообщение "Welcome back" | `visitCount = 2` → текст содержит 'Welcome back' |
| Визит 2 — `#N` заменяется | → 'Visit #2' |
| Визит 5 — "becoming a regular" | `visitCount = 5` → содержит 'regular' |
| Визит 10 — "make it official" | `visitCount = 10` → содержит 'official' |
| Визит 20 — "persistence" | `visitCount = 20` → содержит 'persistence' |
| Визит 15 — "becoming a regular" (5-9) | `visitCount = 7` → тот же шаблон что 5 |
| Сообщение печатается посимвольно | Fake timers → текст появляется постепенно |
| Terminal frame не найден — нет ошибки | Без `.hero__terminal-frame` → нет ошибки |

**Количество тестов: ~9**

---

### 3.16 ee/solarized.js — Целевое покрытие: **95%**

| Тест | Что проверяет |
|------|---------------|
| Диалог создаётся при вызове | `.ee-solarized-overlay` в DOM |
| discover('ee-solarized') вызывается | При открытии |
| Существующий overlay удаляется | Повторный вызов → старый удалён, новый создан |
| Заголовок = 'SOLARIZED' | `.ee-solarized-dialog__header` text |
| Текст вопроса = eeT('ee_solar_text') | `.ee-solarized-dialog__text` text |
| 16 color swatches созданы | `.ee-solarized-swatch` count = 16 |
| Кнопка Yes показывает ответ | Клик → eeT('ee_solar_resp_yes') |
| Кнопка No показывает ответ | Клик → eeT('ee_solar_resp_no') |
| Кнопка What показывает ответ | Клик → eeT('ee_solar_resp_what') |
| CloseX закрывает диалог | Клик → overlay удалён |
| Клик на overlay закрывает | Клик мимо диалога → удалён |
| Swatch hover показывает label | Свойство title содержит name + hex |

**Количество тестов: ~12**

---

## 4. Сводная таблица покрытия

| Модуль | Тестов | Целевое покрытие | Исключение (почему ниже 95%) |
|--------|--------|------------------|------------------------------|
| ee-manager.js | ~15 | **100%** | — |
| translations.js | ~8 | **100%** | — |
| i18n.js | ~15 | **98%** | Fallback-ветка при отсутствии meta-тега (редкий случай) |
| theme.js | ~8 | **95%** | — |
| navigation.js | ~9 | **95%** | — |
| typing.js | ~12 | **95%** | Граничные условия setTimeout таймеров |
| scroll-progress.js | ~7 | **98%** | — |
| visual-effects.js | ~10 | **90%** | **Animation timing, document.hidden branch, Math.random в задержках** |
| scroll-tracking.js | ~8 | **93%** | **IntersectionObserver mock, flash animation cycle** |
| ee/toast.js | ~6 | **100%** | — |
| ee/console-drop.js | ~5 | **95%** | — |
| ee/logo-morph.js | ~11 | **88%** | **Matrix rain setTimeout chain (2s+3s), reduced-motion branch, random delays** |
| ee/context-menu.js | ~24 | **95%** | — |
| ee/select-secret.js | ~7 | **93%** | **Selection API mock complexity** |
| ee/visit-counter.js | ~9 | **95%** | — |
| ee/solarized.js | ~12 | **95%** | — |
| **ИТОГО** | **~166** | **≥95%** | |

---

## 5. Модули с допустимо пониженным покрытием

### 5.1 visual-effects.js — **90%** (допустимое понижение: -5%)

**Причина**: Три трудно тестируемые ветки:
1. `document.hidden` внутри рекурсивного `setTimeout` для CRT noise — требует эмуляции visibility API
2. `Math.random()` в задержках (3000 + random * 6000) — недетерминированные таймеры
3. `void element.offsetWidth` — принудительный reflow для перезапуска анимации

**Решение для повышения**: `vi.useFakeTimers()` + `vi.spyOn(document, 'hidden', 'get')` + мок `Math.random`.

### 5.2 ee/logo-morph.js — **88%** (допустимое понижение: -7%)

**Причина**: Самый сложный модуль с точки зрения тестирования:
1. Цепочка `setTimeout` 2000ms → matrix rain → 3000ms → восстановление = 5 полных секунд fake time
2. Динамическое создание 20+ DOM-элементов (matrix columns) с `Math.random()` контентом
3. Ветка `morphActive = true` — 8-й клик при активном morph (требует полного прохождения 5с цикла)
4. Ветка reduced-motion — требует `window.matchMedia` mock

**Решение для повышения**: Полная эмуляция `vi.useFakeTimers()` с продвижением на 5000ms.

### 5.3 scroll-tracking.js — **93%** (допустимое понижение: -2%)

**Причина**: IntersectionObserver mock — стандартный подход через `window.IntersectionObserver = vi.fn()`, но callback вызывается вручную. Граничные случаи с `rootMargin` не проверяются.

### 5.4 ee/select-secret.js — **93%** (допустимое понижение: -2%)

**Причина**: `window.getSelection()` и `Selection.prototype.containsNode()` — не все jsdom-среды полностью реализуют Selection API. Требуется глубокий mock.

---

## 6. Стратегия мокирования

### 6.1 Глобальные моки (setup.js)

```js
// localStorage/sessionStorage — предоставляются happy-dom

// console.warn — spy для проверки
vi.spyOn(console, 'warn').mockImplementation(() => {});

// console.log — spy для EE-06
vi.spyOn(console, 'log').mockImplementation(() => {});
```

### 6.2 Моки на уровне теста

| API | Мок | Модули |
|-----|-----|--------|
| `IntersectionObserver` | `vi.fn()` + ручной вызов callback | typing, scroll-tracking |
| `window.matchMedia` | `vi.fn()` → `{ matches: false, addEventListener: vi.fn() }` | theme, logo-morph |
| `window.getSelection` | `vi.fn()` → mock Selection | select-secret |
| `window.print` | `vi.fn()` | context-menu |
| `document.hidden` | `vi.spyOn(document, 'hidden', 'get')` | visual-effects |
| `Math.random` | `vi.spyOn(Math, 'random')` | visual-effects, logo-morph |
| `setTimeout/setInterval` | `vi.useFakeTimers()` | typing, visual-effects, logo-morph, visit-counter, toast |
| `HTMLElement.prototype.offsetWidth` | getter mock | visual-effects (reflow trigger) |

### 6.3 DOM Fixture

Для модулей с DOM-зависимостями — минимальный HTML fixture:

```js
function createFixture() {
    document.body.innerHTML = `
        <div class="hero__subtitle animate-on-scroll">
            <span class="terminal-prefix">$</span>
            <span class="typing-wrap">
                <span id="typingText"></span>
                <span class="cursor">_</span>
            </span>
        </div>
        <div id="scrollProgressBar"></div>
        <div id="scrollProgressText"></div>
        <div id="crtNoise"></div>
        <div class="retro-card"></div>
        <footer class="footer">
            <p class="footer__syslog"><span id="syslogText"></span></p>
        </footer>
    `;
}
```

---

## 7. Порядок реализации

### Фаза 1: Инфраструктура (1 час)
1. Инициализация npm, установка Vitest + happy-dom + coverage-v8
2. Конфигурация vitest.config.js
3. Создание tests/setup.js
4. Проверочный тест (smoke test)

### Фаза 2: Модуляризация (2-3 часа)
1. Разделение script.js на модули в src/
2. Создание src/main.js как точки входа
3. Обновление index.html: `<script type="module" src="src/main.js">`
4. Проверка: сайт работает как раньше

### Фаза 3: Чистые модули (1 час)
1. ee-manager.test.js (100%)
2. translations.test.js (100%)
3. ee/toast.test.js (100%)

### Фаза 4: DOM-модули (2 часа)
1. i18n.test.js (98%)
2. theme.test.js (95%)
3. navigation.test.js (95%)
4. scroll-progress.test.js (98%)

### Фаза 5: Анимационные модули (2 часа)
1. typing.test.js (95%)
2. visual-effects.test.js (90%)
3. scroll-tracking.test.js (93%)

### Фаза 6: Пасхалки (2-3 часа)
1. ee/console-drop.test.js (95%)
2. ee/logo-morph.test.js (88%)
3. ee/context-menu.test.js (95%)
4. ee/solarized.test.js (95%)
5. ee/select-secret.test.js (93%)
6. ee/visit-counter.test.js (95%)

### Фаза 7: Верификация (30 мин)
1. `npm run test:coverage`
2. Анализ отчёта, дописывание недостающих тестов
3. Целевой порог: ≥95% statements

**Общая оценка времени: 10-12 часов**

---

## 8. Структура файлов

```
landing/
├── src/
│   ├── ee-manager.js
│   ├── translations.js
│   ├── i18n.js
│   ├── theme.js
│   ├── navigation.js
│   ├── typing.js
│   ├── scroll-progress.js
│   ├── visual-effects.js
│   ├── scroll-tracking.js
│   ├── ee/
│   │   ├── console-drop.js
│   │   ├── logo-reveal.js
│   │   ├── logo-morph.js
│   │   ├── context-menu.js
│   │   ├── solarized.js
│   │   ├── select-secret.js
│   │   ├── visit-counter.js
│   │   └── toast.js
│   └── main.js
├── tests/
│   ├── setup.js
│   ├── ee-manager.test.js
│   ├── translations.test.js
│   ├── i18n.test.js
│   ├── theme.test.js
│   ├── navigation.test.js
│   ├── typing.test.js
│   ├── scroll-progress.test.js
│   ├── visual-effects.test.js
│   ├── scroll-tracking.test.js
│   └── ee/
│       ├── toast.test.js
│       ├── console-drop.test.js
│       ├── logo-morph.test.js
│       ├── context-menu.test.js
│       ├── solarized.test.js
│       ├── select-secret.test.js
│       └── visit-counter.test.js
├── vitest.config.js
├── package.json
└── index.html
```
