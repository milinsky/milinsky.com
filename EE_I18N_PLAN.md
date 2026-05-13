# Локализация пасхалок — План работ

## Проблема

Сайт двуязычный (EN/RU), но все реализованные пасхалки содержат захардкоженные строки только на одном языке. Необходимо вынести все пользовательские тексты в систему переводов и адаптировать HTML.

## Принцип

Текст пасхалки = текст пользователя → должен быть на выбранном языке.
Технический текст (логи, промпты, hex-коды) = язык не меняется.

---

## Аудит захардкоженных строк

### EE-06: Консольный дроп

| Строка | Язык | Локализовать? |
|--------|------|---------------|
| `Смотришь под капот? Уважаю.` | RU только | Да — полноценный текст |
| `Промокод: RETRO-DEV-2026` | RU только | Да |
| `Скидка 20% на консультацию.` | RU только | Да |
| `[kernel] MILINSKY.OS loaded` | EN | Нет — технический лог |
| `[auth] visitor authenticated as curious_developer` | EN | Нет — технический лог |
| `[notice] caffeine level: critical` | EN | Нет — технический лог |
| `[warn] this developer seems cool — should reach out` | EN | Нет — технический лог |
| Остальные 2 набора фейковых логов | EN | Нет — технические логи |

**Итого: 3 строки нужно локализовать (рамка), 3 набора логов оставить на EN**

### EE-08: Секрет в исходном коде

| Строка | Язык | Локализовать? |
|--------|------|---------------|
| ASCII-арт SOURCE CODE | — | Нет — визуальный элемент |
| `You checked the source code. Old school. Respect.` | EN только | Да |
| `Fun fact: there are 22+ easter eggs on this page.` | EN только | Да |
| `You found one. Keep looking.` | EN только | Да |

**Итого: 3 строки. Проблема: HTML-комментарь не поддерживает JS-переключение.**

**Решение: дублировать текст — EN и RU версии в одном комментарии.**

### EE-11: Выделить всё (Select All)

| Строка | Язык | Локализовать? |
|--------|------|---------------|
| `You found invisible text.` | EN только | Да |
| `In the early web we hid messages in font color=background.` | EN только | Да |
| `Some things never change.` | EN только | Да |
| `Promo code: SELECT-ALL-2026` | EN | Нет — промокод |

**Итого: 3 строки в HTML нужно дублировать (EN/RU), промокод оставить.**

**Решение: каждый `.ee-secret-text` содержит два span — EN и RU, один видимый через CSS `[lang="en"] / [lang="ru"]`.**

### EE-03: Трансформация логотипа

| Строка | Язык | Локализовать? |
|--------|------|---------------|
| `Logo morph triggered. Matrix rain disabled (prefers-reduced-motion).` | EN только | Да |
| ASCII-арт (ракета, кот, слон, компьютер, Duyler) | — | Нет — визуальный элемент |

**Итого: 1 строка (toast при reduced-motion).**

### EE-04: Меню правой кнопки (CDE Context Menu)

| Строка | Язык | Локализовать? |
|--------|------|---------------|
| Заголовок `MILINSKY.OS` | — | Нет — бренд |
| `> About MILINSKY.OS` | EN | Да |
| `> Source code (you know how)` | EN | Да |
| `> Print Resume` | EN | Да |
| `> Enable secret theme` / `Disable secret theme` | EN | Да |
| `> Exit (nice try)` | EN | Да |
| Модал About: `About MILINSKY.OS` | EN | Да |
| Модал About: `MILINSKY.OS v4.2.0 / Build / Kernel / Runtime / Uptime / Status` | EN | Нет — технический |
| Модал About: `OPERATIONAL` | EN | Нет — технический |
| Модал About: `[OK]` | EN | Да |
| Toast: `Open DevTools Console for secrets.` | EN | Да |
| Toast: `Cyberpunk theme activated.` | EN | Да |
| Toast: `Secret theme disabled.` | EN | Да |
| Toast: `Nice try. There is no exit from MILINSKY.OS.` | EN | Да |

**Итого: 12 строк.**

### EE-SOLARIZED: Диалог Solarized

| Строка | Язык | Локализовать? |
|--------|------|---------------|
| Заголовок `SOLARIZED` | — | Нет — название палитры |
| `Я очень люблю Solarized color themes, а ты?` | RU только | Да |
| Кнопка `Да, тоже!` | RU только | Да |
| Кнопка `Нет, я за Gruvbox` | RU только | Да |
| Кнопка `Что это?` | RU только | Да |
| Ответ `Хороший вкус. Ethan Schoonaker бы гордился.` | RU только | Да |
| Ответ `Gruvbox — тоже неплохо. Но Solarized — классика.` | RU только | Да |
| Ответ `Solarized — цветовая схема, которую ты сейчас смотришь. Нажми на любой сватч.` | RU только | Да |
| Названия цветов (base03, yellow, etc.) | EN | Нет — технические названия |

**Итого: 7 строк.**

### EE-16: Счётчик визитов

| Строка | Язык | Локализовать? |
|--------|------|---------------|
| `Welcome back. Visit #N.` | EN | Да |
| `Visit #N. You are becoming a regular.` | EN | Да |
| `Visit #10. Time to make it official.` | EN | Да |
| `You have been here N times. Secret: persistence is the ultimate skill.` | EN | Да |

**Итого: 4 строки (с подстановкой числа).**

---

## Итого по объёму

| Пасхалка | Строк к локализации | Сложность |
|----------|---------------------|-----------|
| EE-06 Консольный дроп | 3 | Низкая |
| EE-08 Исходный код | 3 | Низкая (HTML-дубль) |
| EE-11 Выделить всё | 3 | Средняя (HTML + CSS) |
| EE-03 Лого | 1 | Низкая |
| EE-04 Контекстное меню | 12 | Высокая |
| EE-SOLARIZED Диалог | 7 | Средняя |
| EE-16 Счётчик визитов | 4 | Низкая |
| **Итого** | **33 строки** | |

---

## Фаза 1: Инфраструктура (фундамент)

### Задача: Расширить объект `translations` ключами пасхалок

Добавить в существующий объект `translations` (строка ~115 script.js) все ключи вида `ee_XX_key: { en: '...', ru: '...' }`.

**Что добавить:**

```
ee_console_box_1:    en: 'Looking under the hood? Respect.'
                     ru: 'Смотришь под капот? Уважаю.'

ee_console_box_2:    en: 'Promo code: RETRO-DEV-2026'
                     ru: 'Промокод: RETRO-DEV-2026'

ee_console_box_3:    en: '20% off consultation.'
                     ru: 'Скидка 20% на консультацию.'

ee_source_1:         en: 'You checked the source code. Old school. Respect.'
                     ru: 'Ты проверил исходный код. Олдскул. Уважение.'

ee_source_2:         en: 'Fun fact: there are 22+ easter eggs on this page.'
                     ru: 'Забавный факт: на этой странице 22+ пасхалки.'

ee_source_3:         en: 'You found one. Keep looking.'
                     ru: 'Ты нашёл одну. Продолжай искать.'

ee_select_1:         en: 'You found invisible text.'
                     ru: 'Ты нашёл невидимый текст.'

ee_select_2:         en: 'In the early web we hid messages in font color=background.'
                     ru: 'В раннем вебе мы прятали сообщения в font color=background.'

ee_select_3:         en: 'Some things never change.'
                     ru: 'Кое-что никогда не меняется.'

ee_logo_reduced:     en: 'Logo morph triggered. Matrix rain disabled (prefers-reduced-motion).'
                     ru: 'Трансформация логотипа. Матричный дождь отключён (prefers-reduced-motion).'

ee_menu_about:       en: '> About MILINSKY.OS'
                     ru: '> О MILINSKY.OS'

ee_menu_source:      en: '> Source code (you know how)'
                     ru: '> Исходный код (ты знаешь как)'

ee_menu_print:       en: '> Print Resume'
                     ru: '> Печать резюме'

ee_menu_theme_on:    en: '> Enable secret theme'
                     ru: '> Включить секретную тему'

ee_menu_theme_off:   en: '> Disable secret theme'
                     ru: '> Отключить секретную тему'

ee_menu_exit:        en: '> Exit (nice try)'
                     ru: '> Выход (хорошая попытка)'

ee_modal_title:      en: 'About MILINSKY.OS'
                     ru: 'О MILINSKY.OS'

ee_modal_ok:         en: '[OK]'
                     ru: '[OK]'

ee_toast_console:    en: 'Open DevTools Console for secrets.'
                     ru: 'Открой консоль DevTools для секретов.'

ee_toast_cyber_on:   en: 'Cyberpunk theme activated.'
                     ru: 'Киберпанк-тема активирована.'

ee_toast_cyber_off:  en: 'Secret theme disabled.'
                     ru: 'Секретная тема отключена.'

ee_toast_exit:       en: 'Nice try. There is no exit from MILINSKY.OS.'
                     ru: 'Хорошая попытка. Из MILINSKY.OS выхода нет.'

ee_solar_text:       en: 'I really love Solarized color themes, do you?'
                     ru: 'Я очень люблю Solarized color themes, а ты?'

ee_solar_yes:        en: 'Yes, me too!'
                     ru: 'Да, тоже!'

ee_solar_no:         en: 'No, I prefer Gruvbox'
                     ru: 'Нет, я за Gruvbox'

ee_solar_what:       en: 'What is this?'
                     ru: 'Что это?'

ee_solar_resp_yes:   en: 'Good taste. Ethan Schoonaker would be proud.'
                     ru: 'Хороший вкус. Ethan Schoonaker бы гордился.'

ee_solar_resp_no:    en: 'Gruvbox is not bad either. But Solarized is a classic.'
                     ru: 'Gruvbox — тоже неплохо. Но Solarized — классика.'

ee_solar_resp_what:  en: 'Solarized is the color scheme you are looking at right now. Click any swatch.'
                     ru: 'Solarized — цветовая схема, которую ты сейчас смотришь. Нажми на любой сватч.'

ee_visit_2:          en: 'Welcome back. Visit #' + N + '.'
                     ru: 'С возвращением. Визит #' + N + '.'

ee_visit_5:          en: 'Visit #' + N + '. You are becoming a regular.'
                     ru: 'Визит #' + N + '. Ты становишься завсегдатаем.'

ee_visit_10:         en: 'Visit #10. Time to make it official.'
                     ru: 'Визит #10. Пора бы сделать это официальным.'

ee_visit_20:         en: 'You have been here ' + N + ' times. Secret: persistence is the ultimate skill.'
                     ru: 'Ты был здесь ' + N + ' раз. Секрет: упорство — главный навык.'
```

**Сложность:** Низкая. Механическое добавление ключей.
**Риск:** Нет. Существующий механизм `translations` уже работает.

### Хелпер для получения перевода

Добавить функцию-хелпер рядом с eeManager:

```javascript
function eeT(key) {
    if (translations[key] && translations[key][currentLang]) {
        return translations[key][currentLang];
    }
    if (translations[key] && translations[key].en) {
        return translations[key].en;
    }
    return key;
}
```

Использовать везде в пасхалках вместо захардкоженных строк.

---

## Фаза 2: JS-пасхалки — замена строк

### Задача: Заменить все захардкоженные строки на вызовы `eeT()`

Порядок замены по файлу script.js:

**EE-06 (строки ~82-86):** Рамка console.log
```
Было: textContent = '\u0421\u043c\u043e\u0442\u0440\u0438\u0448\u044c...'
Надо: textContent = eeT('ee_console_box_1')
```
Три строки рамки — три вызова eeT.

**EE-03 (строка ~830):** Toast при reduced-motion
```
Было: eeShowToast('Logo morph triggered...')
Надо: eeShowToast(eeT('ee_logo_reduced'), 3000)
```

**EE-04 (строки ~915-974):** Контекстное меню и все его модалы/тосты
Заменить 12 строк на вызовы eeT(). Особенность: кнопка темы должна менять текст:
```
Надо: btnTheme label = eeT(eeManager.isDiscovered('ee-cyberpunk') ? 'ee_menu_theme_off' : 'ee_menu_theme_on')
```

**EE-SOLARIZED (строки ~726-791):** Диалог Solarized
Заменить 7 строк на вызовы eeT().

**EE-16 (строки ~1068-1077):** Счётчик визитов
Заменить 4 варианта сообщений, с подстановкой числа через конкатенацию:
```
Надо: msg = eeT('ee_visit_2').replace('#N', String(visitCount));
```
Для этого в ключах перевода использовать плейсхолдер `#N`.

**Сложность:** Низкая-средняя. Механическая замена, но нужно аккуратно работать с Unicode-escape строками.
**Риск:** Низкий. eeT() фоллбачится на en.

---

## Фаза 3: HTML — EE-08 Исходный код

### Задача: Дублировать текст комментария на обоих языках

HTML-комментарь нельзя переключить через JS. Решение — оба языка в одном комментарии:

```html
<!--
 SOURCE CODE (ASCII-арт)
 
 You checked the source code. Old school. Respect.
 Fun fact: there are 22+ easter eggs on this page.
 You found one. Keep looking.
 
 ---
 
 Ты проверил исходный код. Олдскул. Уважение.
 Забавный факт: на этой странице 22+ пасхалки.
 Ты нашёл одну. Продолжай искать.
-->
```

**Сложность:** Минимальная.
**Риск:** Нет.

---

## Фаза 4: HTML + CSS — EE-11 Выделить всё

### Задача: Дублировать скрытый текст с переключением через CSS `[lang]`

Сейчас каждый `.ee-secret-text` содержит одну строку на EN. Нужно обернуть в два span:

```html
<span class="ee-secret-text" aria-hidden="true">
    <span class="ee-secret-en">You found invisible text.</span>
    <span class="ee-secret-ru">Ты нашёл невидимый текст.</span>
</span>
```

CSS:
```css
[data-lang="en"] .ee-secret-ru,
[data-lang="ru"] .ee-secret-en {
    display: none;
}
```

Но тут нюанс — сейчас язык задаётся через `html.setAttribute('lang', lang)`, а не через `data-lang`. Значит селектор CSS:

```css
html[lang="en"] .ee-secret-ru,
html[lang="ru"] .ee-secret-en {
    display: none;
}
```

Промокод `SELECT-ALL-2026` — без перевода, один span на обоих языках.

**Альтернатива:** Вместо HTML+CSS подхода можно генерировать текст через JS, как остальные пасхалки, и использовать eeT(). Это проще и консистентнее.

**Рекомендация:** JS-подход. Заменить статичные `<span>` на JS-генерацию при загрузке, с вызовом eeT().

**Сложность:** Средняя.
**Риск:** Низкий.

---

## Фаза 5: Верификация

### Задача: Проверить все пасхалки на обоих языках

Чеклист:
- [ ] EE-06: Консоль показывает рамку на правильном языке
- [ ] EE-08: Комментарий в исходном коде содержит оба языка
- [ ] EE-11: Скрытый текст при выделении на правильном языке
- [ ] EE-03: Toast при reduced-motion на правильном языке
- [ ] EE-04: Все пункты контекстного меню на правильном языке
- [ ] EE-04: Модал About на правильном языке
- [ ] EE-04: Все тосты на правильном языке
- [ ] EE-SOLARIZED: Диалог Solarized на правильном языке
- [ ] EE-SOLARIZED: Все три ответа на правильном языке
- [ ] EE-16: Сообщение о визите на правильном языке
- [ ] Переключение языка в реальном времени обновляет открытые пасхалки (если применимо)
- [ ] Default язык EN — все пасхалки показывают EN при первом визите
- [ ] После переключения на RU — все новые пасхалки показывают RU
- [ ] Fallback: если ключ перевода отсутствует — показывается EN

**Сложность:** Низкая. Тестирование.
**Риск:** Нет.

---

## Приоритет реализации

| Приоритет | Фаза | Почему |
|-----------|-------|--------|
| 1 | Фаза 1: Инфраструктура | Без неё ничего не работает |
| 2 | Фаза 2: JS-пасхалки | Основной объём, механическая работа |
| 3 | Фаза 3: HTML-комментарий | 2 минуты работы |
| 4 | Фаза 4: EE-11 HTML+CSS | Небольшой рефакторинг |
| 5 | Фаза 5: Верификация | Финальная проверка |

Фазы 1+2 можно делать за один проход — добавить ключи в translations и сразу заменить строки.
Фазы 3+4 — отдельно, но быстро.
Фаза 5 — после всех изменений.

---

## Примечание о динамическом переключении

Существующие пасхалки создают элементы динамически (при триггере). Это значит, что они **автоматически** используют текущий язык в момент срабатывания. Если пользователь переключил язык — следующая пасхалка будет на новом языке.

Уже отрисованные пасхалки (модал Solarized, контекстное меню) **не обновятся** при переключении языка — это нормально и ожидаемо.

EE-16 (счётчик визитов) рендерится один раз при загрузке. Если пользователь переключит язык после загрузки — сообщение не обновится. Это приемлемо.
