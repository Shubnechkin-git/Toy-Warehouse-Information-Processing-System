const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require('mysql');

app.use(cors())

app.get('/test', function (req, res) {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'toys_db'
    });

    connection.connect();

    connection.query('SELECT * FROM игрушки', function (error, results, fields) {
        if (error) {
            console.error('Ошибка при выполнении запроса:', error);
            res.status(500).json({ error: 'Ошибка при выполнении запроса' });
        } else {
            res.send({ "data": results, message: "Данные получены!" });
        }
        connection.end(); // Закрываем соединение здесь, после завершения запроса
    });
});


app.get('/update', (req, res) => {

    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'toys_db'
    });

    const { rowId, oldValue, dataToUpdate } = req.query;
    const { columnName, newValue } = dataToUpdate;

    console.log(req.query);

    const sql = `UPDATE игрушки
                SET ${columnName} = ?
                WHERE Идентификатор = ? AND ${columnName} = ?`;

    connection.query(sql, [newValue, rowId, oldValue], (err, result) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            res.status(500).json({ error: 'Ошибка при выполнении запроса' });
        } else {
            console.log('Данные успешно обновлены');
            res.status(200).json({ message: 'Данные успешно обновлены' });
        }
    });
});

app.post('/delete', (req, res) => {
    const rowId = req.query.rowId; // Получаем идентификатор строки для удаления

    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'toys_db'
    });

    // Проверяем, есть ли связанные записи в других таблицах
    const checkSQL = `SELECT COUNT(*) AS count FROM операции_на_складе WHERE Идентификатор_игрушки = ?`;
    connection.query(checkSQL, rowId, (err, results) => {
        if (err) {
            console.error('Ошибка при проверке связанных записей:', err);
            res.status(500).json({ error: 'Ошибка при выполнении запроса' });
            return;
        }

        const count = results[0].count;
        if (count > 0) {
            res.status(500).json({ error: 'Невозможно удалить игрушку, так как на нее есть ссылки в других таблицах.' });
            return;
        }

        // Удаление строки из таблицы игрушек
        const deleteSQL = `DELETE FROM игрушки WHERE Идентификатор = ?`;
        connection.query(deleteSQL, rowId, (err, result) => {
            if (err) {
                console.error('Ошибка при удалении записи:', err);
                res.status(500).json({ error: 'Ошибка при удалении записи' });
            } else {
                console.log('Данные успешно удалены');
                res.status(200).json({ message: 'Данные успешно удалены!' });
            }
        });
    });
});

/*
TODO: 1.Добавить логику обработки и отображения других таблиц бд
TODO: 2.Добавить функцию создания отчетов
*/

app.listen(3000)