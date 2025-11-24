const startBtn = document.getElementById('start');
const passBtn = document.getElementById('pass');
const failBtn = document.getElementById('fail');
const abortBtn = document.getElementById('abort');
const status = document.getElementById('status');

function setStatus(text) { status.textContent = text; }

startBtn.addEventListener('click', async () => {
    setStatus('Starting browser...');
    const res = await window.electronAPI.startTest();
    if (res.ok) {
        setStatus(res.message);
        startBtn.disabled = true;
        passBtn.disabled = false;
        failBtn.disabled = false;
    } else {
        setStatus('Error: ' + res.message);
    }
});

passBtn.addEventListener('click', async () => {
    setStatus('Marking PASS...');
    const res = await window.electronAPI.passTest();
    setStatus(res.message || 'Done');
    startBtn.disabled = false;
    passBtn.disabled = true;
    failBtn.disabled = true;
});

failBtn.addEventListener('click', async () => {
    setStatus('Marking FAIL...');
    const res = await window.electronAPI.failTest();
    if (res.ok && res.path) {
        status.innerHTML = `Test FAILED. <a href="#" id="open-video">Open Video Location</a>`;
        document.getElementById('open-video').addEventListener('click', (e) => {
            e.preventDefault();
            window.electronAPI.openPath(res.path);
        });
    } else {
        setStatus(res.message || 'Done');
    }
    startBtn.disabled = false;
    passBtn.disabled = true;
    failBtn.disabled = true;
});

abortBtn.addEventListener('click', async () => {
    await window.electronAPI.abortTest();
    setStatus('Aborted / cleaned up');
    startBtn.disabled = false;
    passBtn.disabled = true;
    failBtn.disabled = true;
});
