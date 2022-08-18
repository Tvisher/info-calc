'use strict';
$(document).ready(function () {
    const metalTypeSelect = document.querySelector('#metalType');
    const metalThicknessSelect = document.querySelector('#thicknessSharpness');

    const metalTypeInput = document.querySelector('#metalTypeInput');
    const thicknessSharpnessInput = document.querySelector('#thicknessSharpnessInput');

    const cuttingLength = document.querySelector('#cuttingLength');
    const punchingCount = document.querySelector('#punchingCount');

    const isRegularCustomer = document.querySelector('#isRegularCustomer');
    const resContainer = document.querySelector('[data-value-elem]');
    const discountPresentField = document.querySelector('#discountPresent');
    var discountPresent = 0;
    var minPrice = 0;

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
            resContainer.innerHTML = minPrice.toLocaleString('ru-RU');
            const materials = data.materials;
            disabledInputs();
            createTypeOptions(materials);
            $('body').addClass('load');
        });


    // Генерация типа металов
    function createTypeOptions(data) {
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
            resContainer.innerHTML = minPrice.toLocaleString('ru-RU');
            const currentMetal = e.params.data.id;
            const currentMetalSizes = data[currentMetal].thickness;
            disabledInputs();
            createThicknessOptions(metalThicknessSelect, currentMetalSizes);
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
            const currentSize = e.params.data.id;

            const cuttingPrice = currentSize.split(',')[0];
            const punchingPrice = currentSize.split(',')[1];

            thicknessSharpnessInput.setAttribute('data-cutting-price', cuttingPrice);
            thicknessSharpnessInput.setAttribute('data-punching-price', punchingPrice);


            cuttingLength.closest('label').classList.remove('disabled-field');
            punchingCount.closest('label').classList.remove('disabled-field');
            makeСalculation();
        });
    }

    // Функция итогового подсчёта всех выбранных и введённых значений
    function makeСalculation() {
        const cuttingPrice = +thicknessSharpnessInput.dataset.cuttingPrice;
        const punchingPrice = +thicknessSharpnessInput.dataset.punchingPrice;
        const cuttingRes = cuttingPrice * +cuttingLength.value;
        const punchingRes = punchingPrice * +punchingCount.value;
        const result = cuttingRes + punchingRes;
        const discount = (isRegularCustomer.checked && typeof discountPresent === 'number') ? discountPresent : 0;
        const resultWithDiscount = Math.round(result - ((result / 100) * discount));
        let resValue = resultWithDiscount ? +resultWithDiscount : 0;

        resValue = resValue > minPrice ? resValue : resValue = minPrice;

        if (isRegularCustomer.checked && result && resValue > minPrice) {
            resContainer.innerHTML = `${result.toLocaleString('ru-RU')} - ${((result / 100) * discount).toLocaleString('ru-RU')} = ${resValue.toLocaleString('ru-RU')}`;
        } else {
            resContainer.innerHTML = resValue.toLocaleString('ru-RU');
        }
    }

    // Прослушка событий ввода в инпуты
    document.querySelectorAll('[data-styles-field]').forEach(input => {
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
            makeСalculation();
        });
    });

    // проверка на включеную скидку
    isRegularCustomer.addEventListener('change', (e) => {
        makeСalculation();
    });

    // Сброс расчёта путём перезагрузки страницы
    const resetСalculationBtn = document.querySelector('#resetСalculation');
    resetСalculationBtn.addEventListener("click", (e) => {
        let isReset = confirm("Сбросить расчёт ?");
        isReset && location.reload();
    });
});













