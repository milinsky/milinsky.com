export function initVisitCounter(eeManager, eeT) {
    const visitCount = eeManager.getVisitCount();
    if (visitCount < 2) return;
    const terminalFrame = document.querySelector('.hero__terminal-frame');
    if (!terminalFrame) return;
    let msg = '';
    if (visitCount >= 20) {
        msg = eeT('ee_visit_20').replace('#N', String(visitCount));
    } else if (visitCount >= 10) {
        msg = eeT('ee_visit_10');
    } else if (visitCount >= 5) {
        msg = eeT('ee_visit_5').replace('#N', String(visitCount));
    } else {
        msg = eeT('ee_visit_2').replace('#N', String(visitCount));
    }
    const msgEl = document.createElement('div');
    msgEl.className = 'ee-visit-msg';
    terminalFrame.appendChild(msgEl);
    let idx = 0;
    (function typeVisit() {
        if (idx < msg.length) {
            msgEl.textContent += msg[idx];
            idx++;
            setTimeout(typeVisit, 30 + Math.random() * 20);
        }
    })();
}
