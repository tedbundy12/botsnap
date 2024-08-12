const express = require('express');
const cors = require('cors'); // Импортируем cors
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Сервер работает');
});


app.use(cors()); // Разрешаем все CORS запросы
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/upload', async (req, res) => {
    console.log('Запрос на /upload получен');
    
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ message: 'Изображение не предоставлено' });
    }

    // Извлечение данных изображения и сохранение его на сервере
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, 'photo.png');
    console.log('Сохранение изображения на сервере');
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Отправка изображения в Telegram
    const botToken = '7477382492:AAHgcEQnxHzeSVt5CrFv2cH9Nzpzb0tuN8Y';
    const chatId = '5220773411';

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', fs.createReadStream(filePath));

    try {
        console.log('Отправка изображения в Telegram');
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        if (response.ok) {
            res.json({ message: 'Фото успешно отправлено!' });
        } else {
            const errorText = await response.text();
            console.error('Ошибка отправки в Telegram:', errorText);
            res.status(500).json({ message: 'Ошибка отправки в Telegram', error: errorText });
        }
    } catch (error) {
        console.error('Ошибка отправки на сервер:', error);
        res.status(500).json({ message: 'Ошибка отправки на сервер', error });
    }
});


app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
