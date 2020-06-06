// ==UserScript==
// @name         Aliexpress address filler
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Заполняет поля адресных данных на Алиэкспресс
// @author       Andronio
// @homepage     https://github.com/Andronio2/Aliexpress-address-filler
// @supportURL   https://github.com/Andronio2/Aliexpress-address-filler/issues
// @updateURL    https://github.com/Andronio2/Aliexpress-address-filler/raw/master/Aliexpress%20address%20filler.user.js
// @downloadURL  https://github.com/Andronio2/Aliexpress-address-filler/raw/master/Aliexpress%20address%20filler.user.js
// @match        ilogisticsaddress.aliexpress.com/addressList.htm*
// @match        ilogisticsaddress.aliexpress.ru/addressList.htm*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
/*
Выбираем свою страну: KZ, RU, BY, UA
Область и город так, как написано на страничке адреса
Если область или город не получается, то смотрим код страницы
и ищем свои данные.
Задаем порядок следования ваших данных. Например у меня:
телефон -> адрес -> имя, соответственно у меня порядок
будет 0, 1, 2
*/

let myIndex     = "100000";
let myPhoneCode = "+7";
let myCountry   = "KZ";
let myProvince  = "oblast";
let myCity      = "gorod";

let orderPhone  = 0;
let orderAddr   = 1;
let orderName   = 2;
let orderCountry= 3;
let orderCity   = 4;
let orderProvince = 5;
let orderIndex  = 6;
let orderPhCode = 7;

/*
 * Дальше не трогать
 */
    let div = document.createElement('div');
    div.className = 'main-box-address';

    div.innerHTML += `
        <input type="text" id="namepassaddr"></br>
        <button type="button" id="fillbtnaddr" class="fill-btn-address">Заполнить</button>
        `;

// Стили
    let styles = `
    .main-box-address {
        position: fixed;
        top: 0;
        right: 0;
        background: white;
        box-shadow: 1px -1px 4px 1px;
        max-width: 40%;
        max-height: 400px;
        padding: 10px 20px;
        overflow-y: hidden;
        overflow-x: hidden;
        z-index:9999;
    }

    .fill-btn-address {
        display: inline;
        padding: 5px 10px;
        margin-right:auto;
        cursor:pointer;
    }`;

    let styleSheet = document.createElement('style');
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.append(styleSheet);
    document.body.append(div);
    let fillBtn = document.getElementById('fillbtnaddr');
    fillBtn.addEventListener('click', fillAddrFunc);
    let textInput = document.getElementById('namepassaddr');
    textInput.addEventListener('keydown', event => {
        if (event.keyCode == "13") {
            document.getElementById('fillbtnaddr').click();
        }
    });
    textInput.focus();

    let currMode = 0;
    let oldProvince = "";

    // Функция заполения адреса
    function fillAddrFunc() {
        let elemCountry = document.querySelector('select[name="country"]');
        let elemProvinceSelect = document.querySelector('.sa-province-wrapper > select');
        let elemProvinceInput = document.querySelector('.sa-province-wrapper > input');
        let elemCitySelect = document.querySelector('.sa-city-wrapper > select');
        let elemCityInput = document.querySelector('.sa-city-wrapper > input');
        let namepass = document.getElementById('namepassaddr');
        let mass;

        if (namepass.value == "") return alert("Нет данных");
        if (/.+\t.+\t.+/.test(namepass.value)) {
            mass = namepass.value.split('\t');
        } else if (/.+:.+:.+/.test(namepass.value)) {
            mass = namepass.value.split(':');
        } else {
            namepass.value = "";
            return alert("Неправильный формат");
        }
        let tempCountry = myCountry ? myCountry : mass[orderCountry];

        switch(currMode) {
            case 0:

                document.querySelector('input[name="contactPerson"]').value = mass[orderName];
                document.querySelector('input[name="address"]').value = mass[orderAddr];
                document.querySelector('input[name="zip"]').value = myIndex ? myIndex : mass[orderIndex];
                document.querySelector('input[name="mobileNo"]').value = mass[orderPhone];
                oldProvince = elemProvinceSelect.options[1].text;
                elemCountry.value = tempCountry;
                elemCountry.dispatchEvent(new Event("change"));
                currMode = 1;
                return setTimeout(fillAddrFunc, 200);
                break;
            case 1:
                if (elemProvinceSelect.options[1].text == oldProvince && tempCountry != "BY")
                    return setTimeout(fillAddrFunc, 200);
                if (tempCountry == "BY") {
                    elemProvinceInput.value = myProvince ? myProvince : mass[orderProvince];
                } else {
                    elemProvinceSelect.value = myProvince ? myProvince : mass[orderProvince];
                    elemProvinceSelect.dispatchEvent(new Event("change"));
                }
                currMode = 2;
                return setTimeout(fillAddrFunc, 200);
                break;
            case 2:
                if (elemCitySelect.length == 0 && tempCountry != "BY")
                    return setTimeout(fillAddrFunc, 200);
                if (tempCountry == "BY") {
                    elemCityInput.value = myCity ? myCity : mass[orderCity];
                } else {
                    elemCitySelect.value = myCity ? myCity : mass[orderCity];
                    elemCitySelect.dispatchEvent(new Event("change"));
                }
                currMode = 3;
                return setTimeout(fillAddrFunc, 200);
                break;
            case 3:
                document.querySelector('input[name="phoneCountry"]').value = myPhoneCode ? myPhoneCode : mass[orderPhCode];
                currMode = 0;
                document.querySelector('.sa-confirm').click();
                break;
            default:
                alert("Ошибка в программе");
        }
    }
})();
