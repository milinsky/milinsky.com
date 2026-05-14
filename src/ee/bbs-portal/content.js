const BAUD_RATES = [2400, 9600, 14400, 28800];

const FILE_ART = ['  +---------+', '  |  FILE   |', '  |  .ZIP   |', '  |  ###    |', '  |  ###    |', '  +---------+'];

export function getRandomBaudRate() {
    return BAUD_RATES[Math.floor(Math.random() * BAUD_RATES.length)];
}

/**
 * @param {(key: string) => string} t
 * @returns {Array<{ key: string, label: string, content: string }>}
 */
export function getMenuItems(t) {
    return [
        { key: '1', label: t('ee_bbs_menu_1'), content: t('ee_bbs_bulletin_content') },
        { key: '2', label: t('ee_bbs_menu_2'), content: t('ee_bbs_files_content') + '\n' + FILE_ART.join('\n') },
        { key: '3', label: t('ee_bbs_menu_3'), content: t('ee_bbs_chat_content') },
        { key: '4', label: t('ee_bbs_menu_4'), content: '' },
    ];
}
