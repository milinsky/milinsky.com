const DATE_THEMES = [
    { month: 1, day: 1, cssClass: 'ee-time-bios', key: 'ee_time_bios' },
    { month: 4, day: 1, cssClass: 'ee-time-april', key: 'ee_time_april' },
    { month: 10, day: 31, cssClass: 'ee-time-halloween', key: 'ee_time_halloween' },
    { month: 12, day: 25, cssClass: 'ee-time-christmas', key: 'ee_time_christmas' },
];

const ANOMALY_YEAR = 1990;

/**
 * Time Traveler easter egg — applies themed CSS on specific dates.
 * @param {{ eeManager: object, t: function, showToast: function, dateOverride?: Date }} ctx
 * @returns {{ destroy(): void }}
 */
export function createTimeTraveler(ctx) {
    const { eeManager, t, showToast, dateOverride } = ctx;

    const now = dateOverride ?? new Date();
    const html = document.documentElement;

    if (now.getFullYear() < ANOMALY_YEAR) {
        html.classList.add('ee-time-anomaly');
        showToast(t('ee_time_anomaly'));
        eeManager.discover('ee15');
        return {
            destroy() {
                html.classList.remove('ee-time-anomaly');
            },
        };
    }

    const month = now.getMonth() + 1;
    const day = now.getDate();
    const match = DATE_THEMES.find((entry) => entry.month === month && entry.day === day);

    if (!match) {
        return { destroy() {} };
    }

    html.classList.add(match.cssClass);
    showToast(t(match.key));
    eeManager.discover('ee15');

    return {
        destroy() {
            html.classList.remove(match.cssClass);
        },
    };
}
