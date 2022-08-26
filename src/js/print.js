import sum_letters from './numTostring.js';

export default function callPrint(data) {
    var windowPrint = window.open('', '', 'left=50,top=50,width=2000,height=2000,toolbar=0,scrollbars=1,status=0');

    const dataList = data.fullSettlementList;
    const tableRows = dataList.reduce((row, dataItem) => {
        const { metalType,
            metalThickness,
            cuttingLength,
            punchingCount,
            itemPrice, } = dataItem;

        const calculationItem = `
        <tr>
            <td>${metalType}, ${metalThickness} мм</td>
            <td>${cuttingLength.toLocaleString('ru-RU')} м</td>
            <td>${punchingCount.toLocaleString('ru-RU')} шт</td>
            <td>${itemPrice.toLocaleString('ru-RU')} ₸</td>
        </tr>`;
        row += calculationItem;
        return row;
    }, '');
    const clientName = data.clientName;
    const clienText = clientName.length > 0 ? `для клиента:&nbsp<strong style="display:inline">«${clientName}»</strong>` : '';

    const finishResult = dataList.reduce((sum, current) => sum + current.itemPrice, 0);
    const finishResultInWords = sum_letters(finishResult);
    const printPage = `
    <div class="print-wrapper" style="max-width: 1024px; width: 100%; margin:auto">
        <div class="print-wrapper__head">
            <div class="comp-data">
                <span> ИП «Шляхова А.Н.»</span>
                <span> ИИН 780402302789</span>
                <span> ул. Бажова, 95</span>
            </div>
            <div class="comp-logo">
                <img src="./img/printLogo.png"" alt="">
            </div>
            <div class="comp-data r">
                <span> 8 7232 700 350</span>
                <span> 8 705 155 99 11</span>
                <span> www.infoplus.kz</span>
            </div>
        </div>
        <div class="print-wrapper__body">
            <span class="title">Расчёт от ${new Date().toLocaleDateString('ru-RU')} за лазерную резку металла ${clienText}</span>
            <table class="res-table">
                <thead>
                    <tr>
                        <th>Наименование</th>
                        <th>Длинна реза</th>
                        <th>Пробивка</th>
                        <th>Стоимость</th>
                    </tr>
                </thead>
                <tbody>
                ${tableRows}
                </tbody>
            </table>
            <div class="result-text">
                Общая стоимость: <strong  style="display:inline;">${finishResult.toLocaleString('ru-RU')}</strong> (${finishResultInWords}) тенге.
            </div>
            <div class="print-wrapper__head" style="margin-top:60px">
                <div class="comp-data">Шляхов А. Н.  __________</div>
                <div class="comp-data" style="padding-right:60px">М.П.</div>
            </div>
        </div>
    </div>`;
    windowPrint.document.write(`<link rel="stylesheet" href="./css/print.css" type="text/css">`);
    windowPrint.document.write(printPage);
    windowPrint.document.close();
    windowPrint.focus();
    windowPrint.onload = () => {
        windowPrint.print();
        windowPrint.close();
    }
}


