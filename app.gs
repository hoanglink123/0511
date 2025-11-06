const updateSheet = (sheetId, range, value) => {
    try {
        const values = { values: value };
        const result = Sheets.Spreadsheets.Values.update(values, sheetId, range, {
            valueInputOption: 'RAW'
        });
        return result;
    } catch (err) {
        return { error: err };
    }
};

const appendSheet = (sheetId, range, value) => {
    try {
        const values = { values: value };
        const result = Sheets.Spreadsheets.Values.append(values, sheetId, range, {
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS'
        });
        return result;
    } catch (err) {
        return { error: err };
    }
};

const doGet = (e) => {
    const data = e.parameter;

    const sheetId = data.sheetId;
    const action = data.action || 'update';
    const value = JSON.parse(data.value);

    let result;
    if (action === 'append') {
        let range = 'Trang tính1!A1:J1000';
        result = appendSheet(sheetId, range, value);
        if (result.error) {
            range = 'Sheet1!A1:J1000';
            result = appendSheet(sheetId, range, value);
        }
    } else {
        const row = data.row;
        if (!row) {
            return ContentService.createTextOutput(JSON.stringify({ error: 'row param required for update' })).setMimeType(ContentService.MimeType.JSON);
        }
        const getLastColumn = (sheetId, row) => {
            try {
                const range = `Sheet1!A${row}:J${row}`;
                const result = Sheets.Spreadsheets.Values.get(sheetId, range);
                const values = result.values[0] || [];
                let lastCol = 0;
                for (let i = 0; i < values.length; i++) {
                    if (values[i] && values[i] !== '') {
                        lastCol = i + 1;
                    }
                }
                return lastCol > 0 ? lastCol : 1;
            } catch {
                return 1;
            }
        };

        const lastCol = getLastColumn(sheetId, row);
        const startCol = String.fromCharCode(64 + lastCol + 1);
        let range = `Trang tính1!${startCol}${row}:J${row}`;
        result = updateSheet(sheetId, range, value);
        if (result.error) {
            range = `Sheet1!${startCol}${row}:J${row}`;
            result = updateSheet(sheetId, range, value);
        }
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
};
