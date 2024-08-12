const canvas = document.getElementById('canvas');

// Запрос на доступ к камере
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);

        // Захват изображения и отправка
        imageCapture.grabFrame()
            .then(imageBitmap => {
                // Рисуем изображение на canvas
                const context = canvas.getContext('2d');
                canvas.width = imageBitmap.width;
                canvas.height = imageBitmap.height;
                context.drawImage(imageBitmap, 0, 0);

                // Конвертация изображения в base64
                const imageData = canvas.toDataURL('image/png');

                // Отправка изображения на сервер
                fetch('http://localhost:3000/upload', { // Убедитесь, что URL соответствует вашему серверу
                    method: 'POST',
                    body: JSON.stringify({ image: imageData }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка сети');
                    }
                    return response.json();
                })
                .then(data => console.log('Успешно отправлено:', data))
                .catch(error => console.error('Ошибка отправки:', error));
            })
            .catch(err => console.error('Ошибка захвата изображения:', err))
            .finally(() => {
                videoTrack.stop(); // Останавливаем видеопоток
            });
    })
    .catch(err => console.error('Ошибка доступа к камере:', err));
