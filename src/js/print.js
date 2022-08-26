import sum_letters from './numTostring.js';


export default function callPrint(dataArr, clientData) {
    var windowPrint = window.open('', '', 'left=50,top=50,width=2000,height=2000,toolbar=0,scrollbars=1,status=0');

    const tableRows = dataArr.reduce((row, item) => {
        const { metalType,
            metalThickness,
            cuttingLength,
            punchingCount,
            itemPrice, } = item;

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
    const clientName = clientData.clientName;
    const clienText = clientName.length > 0 ? `для клиента:<strong style="display:inline">«${clientName}»</strong>` : '';

    const finishResult = dataArr.reduce((sum, current) => sum + current.itemPrice, 0);
    const finishResultInWords = sum_letters(finishResult);
    const printPage = `
    <div class="print-wrapper" style="max-width: 1024px; width: 100%; margin:auto">
        <div class="print-wrapper__head">
            <div class="comp-data">
                <span> БИН 010440000789</span>
                <span> ИИК KZ686010151000063517</span>
                <span> ВКО Филиал АО «Народный Банк Казахстана»</span>
                <span> г. Усть-Каменогорск</span>
                <span> БИК HSBKKZKX</span>
                <span> Св-во по НДС 18001 № 0022849 от 17.09.12 г.</span>
                <span> 070018, Казахстан, Восточно-Казахстанская область,</span>
                <span> Усть-Каменогорск, улица Бажова, 59</span>
                <span> ИИН 999999999999</span>
            </div>
            <div class="comp-logo">
                <img src="./img/printLogo.png"" alt="">
            </div>
            <div class="comp-data r">
                <span> БСН 010440000789</span>
                <span> ИИК KZ686010151000063517</span>
                <span> «Қазақстан Халық Банкі» АҚ Шығыс Қазақстан филиалы</span>
                <span> Өскемен қаласы</span>
                <span> BIC HSBKKZKX</span>
                <span> ҚҚС 18001 № 0022849 куәлігі 17.09.12 ж.</span>
                <span> 070018, Қазақстан, Шығыс Қазақстан облысы,</span>
                <span> Өскемен қаласы, Бажов көшесі, 59</span>
                <span> ЖСН 999999999999</span>
            </div>
        </div>
        <div class="print-wrapper__body">
            <span class="title">Коммерческое предложение от ${new Date().toLocaleDateString('ru-RU')}</span>
            <span class="descr">на лазерную резку металла ${clienText}</span>
            // <span class="info">
            //     Индивидуальный предприниматель Шляхов А. Н. направляет Вам на рассмотрение коммерческое предложение на лазерную резку металла, приведенное в таблице:
            // </span>

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
        </div>
        <style>

        </style>
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


