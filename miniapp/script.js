document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем Telegram WebApp
    const tg = window.Telegram.WebApp;

    // Настройка интерфейса
    tg.ready();
    tg.expand(); // Расширяем окно до полного размера
    tg.setHeaderColor('#ffffff');
    tg.setBottomBarColor('#ffffff');

    // Элементы DOM
    const ratesContainer = document.getElementById('rates-container');
    const updateTimeElement = document.getElementById('update-time');
    const refreshBtn = document.getElementById('refresh-btn');

    // Функция для получения курсов с сервера
    async function fetchRates() {
        try {
            const response = await fetch('/api/rates'); // Это будет наш эндпоинт
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            // Очистка контейнера
            ratesContainer.innerHTML = '';

            // Проверка, есть ли данные
            if (!data.rates || Object.keys(data.rates).length === 0) {
                ratesContainer.innerHTML = '<p>Нет данных о курсах.</p>';
                return;
            }

            // Отображение курсов USD
            const usdRates = {};
            const uzsRates = {};

            for (const [key, value] of Object.entries(data.rates)) {
                if (key.includes('USD')) {
                    usdRates[key] = value;
                } else if (key.includes('UZS')) {
                    uzsRates[key] = value;
                }
            }

            // Добавляем заголовки
            const usdHeader = document.createElement('h3');
            usdHeader.textContent = 'Курс USD:';
            ratesContainer.appendChild(usdHeader);

            // Сортируем и выводим USD
            Object.entries(usdRates)
                .sort(([,a], [,b]) => (a === "N/A" ? 1 : b === "N/A" ? -1 : a - b))
                .forEach(([name, rate]) => {
                    const item = document.createElement('div');
                    item.className = 'rate-item';
                    item.innerHTML = `
                        <span class="rate-name">${name.replace(' USD', '')}</span>
                        <span class="rate-value">${rate === "N/A" ? "N/A" : rate.toFixed(4)}</span>
                    `;
                    ratesContainer.appendChild(item);
                });

            // Заголовок UZS
            const uzsHeader = document.createElement('h3');
            uzsHeader.textContent = 'Курс UZS:';
            ratesContainer.appendChild(uzsHeader);

            // Сортируем и выводим UZS
            Object.entries(uzsRates)
                .sort(([,a], [,b]) => (a === "N/A" ? 1 : b === "N/A" ? -1 : b - a))
                .forEach(([name, rate]) => {
                    const item = document.createElement('div');
                    item.className = 'rate-item';
                    item.innerHTML = `
                        <span class="rate-name">${name.replace(' UZS', '')}</span>
                        <span class="rate-value">${rate === "N/A" ? "N/A" : rate.toFixed(4)}</span>
                    `;
                    ratesContainer.appendChild(item);
                });

            // Обновляем время
            if (data.timestamp) {
                const date = new Date(data.timestamp);
                updateTimeElement.textContent = date.toLocaleString('ru-RU');
            }

        } catch (error) {
            console.error('Ошибка при загрузке курсов:', error);
            ratesContainer.innerHTML = `<p style="color: red;">Ошибка: ${error.message}</p>`;
        }
    }

    // Обработчик кнопки обновления
    refreshBtn.addEventListener('click', fetchRates);

    // Первичная загрузка
    fetchRates();

    // Можно добавить автообновление каждые 30 секунд
    setInterval(fetchRates, 30000);
});