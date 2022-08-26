'use strict';
import * as baseFunction from './modules/functions.js';
import callPrint from './print.js';
import './vendors/vendors.js';
baseFunction.testWebP();

$(document).ready(function () {
    const clientNameInput = document.querySelector('#clientName');

    const metalTypeSelect = document.querySelector('#metalType');
    const metalThicknessSelect = document.querySelector('#thicknessSharpness');

    const metalTypeInput = document.querySelector('#metalTypeInput');
    const thicknessSharpnessInput = document.querySelector('#thicknessSharpnessInput');

    const cuttingLength = document.querySelector('#cuttingLength');
    const punchingCount = document.querySelector('#punchingCount');

    const isRegularCustomer = document.querySelector('#isRegularCustomer');
    const isMinPrice = document.querySelector('#isMinPrice');

    const resContainer = document.querySelector('[data-value-elem]');
    const totalResContainer = document.querySelector('[data-total-result]');
    const discountPresentField = document.querySelector('#discountPresent');

    const addСalculationBtn = document.querySelector('#addСalculationBtn');
    const printBtn = document.querySelector('#printBtn')
    const resultRenderContainer = document.querySelector('#resultRenderContainer');

    var discountPresent = 0;
    var minPrice = 0;
    var fullSettlementList = [];

    const locationUrl = location.href;
    fetch(`${locationUrl}files/db.json`, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        }
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            discountPresent = +data.discountPresent;
            discountPresentField.innerHTML = `(скидка ${discountPresent}%)`;
            minPrice = +data.minPrice
            const materials = data.materials;
            disabledInputs();
            createTypesOptions(materials);
            $('body').addClass('load');
        });

    // Генерация типа металов
    function createTypesOptions(data) {
        metalTypeSelect.innerHTML = `<option value=""></option>`;
        for (let metalType in data) {
            const metal = metalType;
            const metalName = data[metalType].name;
            metalTypeSelect.innerHTML += `<option value="${metal}">${metalName}</option>`;
        }
        $('#metalType').select2({
            placeholder: "Выбрать тип металла",
            minimumResultsForSearch: -1,
        });
        //Отрисовка селекта с толщинами метала
        createSizesSelect(true);

        $('#metalType').on("select2:select", function (e) {
            const currentMetal = e.params.data.id;
            metalTypeInput.value = data[currentMetal].name;
            const currentMetalSizes = data[currentMetal].thickness;
            createThicknessOptions(metalThicknessSelect, currentMetalSizes);
            disabledInputs();
        });
    }
    // Отключить инпуты и обнулить их значения
    function disabledInputs() {
        cuttingLength.closest('label').classList.add('disabled-field');
        punchingCount.closest('label').classList.add('disabled-field');
        cuttingLength.value = '';
        punchingCount.value = '';
    }

    // Генерация вариантов толщины выбранного метала
    function createThicknessOptions(select, sizes) {
        select.innerHTML = `<option value=""></option>`;
        for (let size in sizes) {
            const cuttingPrice = sizes[size].cutting;
            const punchingPrice = sizes[size].punching;
            select.innerHTML += `<option data value="${cuttingPrice}, ${punchingPrice}">${size} мм</option>`;
        }
        //Отрисовка селекта с толщинами метала
        createSizesSelect(false);
    }

    // генирация опций толщины метала 
    function createSizesSelect(isDisable) {
        const disableClass = isDisable ? "disabled-field" : '';
        // отвязываем старый онселект до генерации нового
        $('#thicknessSharpness').off('select2:select');

        $('#thicknessSharpness').select2({
            placeholder: "Толщина резки (в миллиметрах)",
            minimumResultsForSearch: -1,
            selectionCssClass: disableClass
        });
        $('#thicknessSharpness').on("select2:select", function (e) {
            const selectedData = e.params.data.id;
            const selectedSize = e.params.data.text.replace(/[^0-9]/g, "");
            const cuttingPrice = selectedData.split(',')[0];
            const punchingPrice = selectedData.split(',')[1];

            thicknessSharpnessInput.setAttribute('data-cutting-price', cuttingPrice);
            thicknessSharpnessInput.setAttribute('data-punching-price', punchingPrice);
            thicknessSharpnessInput.setAttribute('value', selectedSize);

            cuttingLength.closest('label').classList.remove('disabled-field');
            punchingCount.closest('label').classList.remove('disabled-field');
            makeСalculationResult();
        });
    }

    // Функция итогового подсчёта всех выбранных и введённых значений
    function makeСalculationResult(onlyReturn) {
        const cuttingPrice = +thicknessSharpnessInput.dataset.cuttingPrice;
        const punchingPrice = +thicknessSharpnessInput.dataset.punchingPrice;
        const cuttingRes = cuttingPrice * +cuttingLength.value;
        const punchingRes = punchingPrice * +punchingCount.value;
        const result = cuttingRes + punchingRes;
        const discount = isRegularCustomer.checked ? +discountPresent : 0;
        const resultWithDiscount = Math.round(result - ((result / 100) * discount));
        let resValue = resultWithDiscount ? +resultWithDiscount : 0;
        let minPriceForComputing = isMinPrice.checked ? minPrice : 0;
        resValue = resValue > minPriceForComputing ? resValue : resValue = minPriceForComputing;
        if (onlyReturn) {
            // clearValuesAfterCalculation();
            return resValue;
        }
        if (cuttingRes > 0 || punchingRes > 0) {
            addСalculationBtn.classList.remove('disabled-btn')
        } else {
            addСalculationBtn.classList.add('disabled-btn')
        }

        if (isRegularCustomer.checked && result && (resValue > minPriceForComputing)) {
            resContainer.innerHTML = `${result.toLocaleString('ru-RU')} - ${((result / 100) * discount).toLocaleString('ru-RU')} = ${resValue.toLocaleString('ru-RU')} ₸`;
        } else {
            resContainer.innerHTML = `${resValue.toLocaleString('ru-RU')} ₸`;
        }
    }

    // Функция очистки полей ввода и селектов после выполнения расчёта
    function clearValuesAfterCalculation() {
        addСalculationBtn.classList.add('disabled-btn');
        resContainer.innerHTML = `0 ₸`;
        isMinPrice.checked = false;
        disabledInputs();
        $('#metalType').val(null).trigger('change');
        $('#thicknessSharpness').val(null).trigger('change');
        createSizesSelect(true);
    }

    // Функция отрисовки нового расчёта в списке расчётов
    function generateCalculationItem(dataObj) {
        const { metalType,
            metalThickness,
            cuttingLength,
            punchingCount,
            isRegularCustomer,
            withMinPrice,
            id,
            itemPrice } = dataObj;

        const calculationItem = `
                <li data-id="${id}" class="list-item" data-sale="${isRegularCustomer}" data-min-price="${withMinPrice}">
                    <div class="list-item__head">
                        <div class="list-item__block">
                            <span class="list-item__nameplate">Наименование</span>
                            <div class="list-item__data">${metalType}, ${metalThickness} мм</div>
                        </div>
                    </div>
                    <div class="list-item__footer">
                        <div class="list-item__block">
                            <span class="list-item__nameplate">Длинна реза</span>
                            <div class="list-item__data">${cuttingLength} м</div>
                        </div>
                        <div class="list-item__block">
                            <span class="list-item__nameplate">Пробивка</span>
                            <div class="list-item__data">${punchingCount} шт</div>
                        </div>
                        <div class="list-item__block">
                            <span class="list-item__nameplate">Стоимость</span>
                            <div class="list-item__data">${itemPrice.toLocaleString('ru-RU')} ₸</div>
                        </div>
                    </div>
                    <button class="list-item__delete" data-delete-btn></button>
                </li>`;
        resultRenderContainer.innerHTML += calculationItem;
    }

    // Функция сбора данных с полей ввода для расчёта
    function collectDataFromFields() {
        const itemId = Math.random().toString(36).substring(2, 9);
        const calculationData = {
            id: itemId,
            metalType: metalTypeInput.value,
            metalThickness: thicknessSharpnessInput.value,
            cuttingLength: cuttingLength.value || 0,
            punchingCount: punchingCount.value || 0,
            isRegularCustomer: isRegularCustomer.checked,
            withMinPrice: isMinPrice.checked,
            itemPrice: makeСalculationResult(true),
        };
        return calculationData;
    }

    // Вычисление и вывод итоговой суммы всех расчётов
    function getTotalResult(arr) {
        const res = arr.reduce((sum, current) => sum + current.itemPrice, 0);
        totalResContainer.innerHTML = `${res.toLocaleString('ru-RU')}`;
    }

    // Проверка на наличие расчётов в списке для отображения самого списка
    function isReadyToPrint(arr) {
        if (arr.length > 0) {
            document.querySelector('[data-res-block]').classList.add('show')
        } else {
            document.querySelector('[data-res-block]').classList.remove('show')
        }
    }

    // Стилизация скрола секции со списком расчётов
    (function () {
        const checkScroll = (e) => {
            if (window.innerWidth >= 880) {
                var instance = OverlayScrollbars(resultRenderContainer.parentElement, {});
            } else {
                instance && instance.destroy();
            }
        }
        window.addEventListener('resize', checkScroll);
        checkScroll();
    })()

    // Прослушка событий ввода в инпуты
    const inputFields = document.querySelectorAll('[data-calculation-field]');
    inputFields.forEach(input => {
        input.addEventListener('input', function (e) {

            if (this.id === 'punchingCount') {
                if (this.value.match(/[^0-9]/g)) {
                    this.value = this.value.replace(/[^0-9]/g, "");
                }
            }
            else {
                this.value = this.value.replace(/[^\d\.,]/g, "");
                this.value = this.value.replace(/,/g, ".");
                if (this.value.match(/\./g) && (this.value.match(/\./g).length > 1)) {
                    this.value = this.value.substr(0, this.value.lastIndexOf("."));
                }
            }
            makeСalculationResult();
        });
    });

    // Сбор данных из полей ввода для выгрузки в список
    addСalculationBtn.addEventListener("click", (e) => {
        const calculationData = collectDataFromFields();

        fullSettlementList.push(calculationData);
        getTotalResult(fullSettlementList);
        generateCalculationItem(calculationData);
        isReadyToPrint(fullSettlementList);
    });

    // проверка на включеную скидку
    isRegularCustomer.addEventListener('change', (e) => makeСalculationResult());

    // проверка на включеную минимальную цену
    isMinPrice.addEventListener('change', (e) => makeСalculationResult());

    // Обработка клика по кнопке удаления элемента из списка расчётов 
    document.addEventListener('click', function (e) {
        const target = e.target;
        if (target.closest('[data-delete-btn]')) {
            const deletedItem = target.closest('.list-item');
            const deletedItemId = deletedItem.dataset.id;
            fullSettlementList = fullSettlementList.filter(item => item.id !== deletedItemId);
            deletedItem.parentNode.removeChild(deletedItem);
            getTotalResult(fullSettlementList);
            isReadyToPrint(fullSettlementList);
        }
    });

    // отправка на печать готового результата расчёта
    printBtn.addEventListener('click', (e) => {
        callPrint({
            fullSettlementList,
            clientName: clientNameInput.value.trim()
        });
    });

});