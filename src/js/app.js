'use strict';
$(document).ready(function () {
    const metalTypeSelect = document.querySelector('#metalType');
    const metalThicknessSelect = document.querySelector('#thicknessSharpness');

    const metalTypeInput = document.querySelector('#metalTypeInput');
    const thicknessSharpnessInput = document.querySelector('#thicknessSharpnessInput');

    const cuttingLength = document.querySelector('#cuttingLength');
    const punchingCount = document.querySelector('#punchingCount');


    fetch('../files/db.json')
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const materials = data.materials;
            disabledInputs();
            createTypeOptions(materials);
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

        createSizesSelect(true);
        $('#metalType').on("select2:select", function (e) {
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
        });
    }




    // слежка за всеми инпутами
    // document.querySelectorAll('[data-calculation-field]').forEach(field => {
    //     field.addEventListener('input', (e) => {
    //     });
    // });

    // Сброс расчёта путём перезагрузки страницы
    const resetСalculationBtn = document.querySelector('#resetСalculation');
    resetСalculationBtn.addEventListener("click", (e) => {
        let isReset = confirm("Сбросить расчёт ?");
        isReset && location.reload();
    });
});

window.onload = (e) => {
    $('body').addClass('load');
}











