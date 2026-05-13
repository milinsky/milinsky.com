export function initConsoleDrop(eeManager, eeT) {
    const borderStyle = 'font-family:monospace;color:#b58900;background:#002b36;padding:4px 0;';
    const textStyle = 'font-family:monospace;color:#b58900;background:#002b36;';
    const line1 = eeT('ee_console_box_1');
    const line2 = eeT('ee_console_box_2');
    const line3 = eeT('ee_console_box_3');
    const padL1 = Math.max(0, 39 - line1.length);
    const padL2 = Math.max(0, 39 - line2.length);
    const padL3 = Math.max(0, 39 - line3.length);
    const p1 = ' '.repeat(padL1);
    const p2 = ' '.repeat(padL2);
    const p3 = ' '.repeat(padL3);
    console.log(`%c\u250C${'\u2500'.repeat(40)}\u2510`, borderStyle);
    console.log(`%c\u2502  ${line1}${p1}\u2502`, textStyle);
    console.log(`%c\u2502  ${line2}${p2}\u2502`, textStyle);
    console.log(`%c\u2502  ${line3}${p3}\u2502`, textStyle);
    console.log(`%c\u2514${'\u2500'.repeat(40)}\u2518`, borderStyle);
    const logSets = [
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
    const dayIdx = eeManager.getDailySeed() % logSets.length;
    const logs = logSets[dayIdx];
    for (let li = 0; li < logs.length; li++) {
        console.log(logs[li]);
    }
    eeManager.discover('ee06');
}
