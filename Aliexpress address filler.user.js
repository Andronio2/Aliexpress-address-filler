// ==UserScript==
// @name         Aliexpress address filler
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Andronio
// @match        ilogisticsaddress.aliexpress.com/addressList.htm*
// @match        ilogisticsaddress.aliexpress.ru/addressList.htm*
// @grant        none
// ==/UserScript==


/*
Выбираем свою страну: KZ, RU, BY, UA
Область и город так, как написано на страничке адреса
Если область или город не получается, то смотрим код страницы
и ищем свои данные.
Задаем порядок следования ваших данных. Например у меня:
телефон -> адрес -> имя, соответственно у меня порядок
будет 0, 1, 2
*/

let myIndex     = "150013";
let myPhoneCode = "+7";
let myCountry   = "KZ";
let myProvince  = "Severo-Kazakhstanskaya oblast";
let myCity      = "Petropavlovsk";

let orderPhone  = 0;
let orderAddr   = 1;
let orderName   = 2;



(function () {
    'use strict';

    var div = document.createElement('div');
    div.className = 'myBox';

    div.innerHTML += `
    <input type="text" id="namepass"></br>
    <input type="button" id="fillAddr" class="mybutton" value="Заполнить">
    `;

    // Стили
    var styles = `
    .myBox {
    position: fixed;
    top: 0;
    right: 0;
    background: white;
    box-shadow: 1px -1px 4px 1px;
    max-width: 40%;
    max-height: 400px;
    padding: 10px 20px;
    overflow-y: auto;
    overflow-x: hidden;
    z-index:9999;
    }

    .mybutton {
    display: inline;
    padding: 5px 10px;
    margin-right:auto;
    cursor:pointer;
    }`

        var styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.append(styleSheet)
        document.body.append(div);

    let mybutton2 = document.getElementById("fillAddr");
    mybutton2.addEventListener('click', fillAddrFunc);
    let mytext = document.getElementById("namepass");
    mytext.addEventListener('keydown', event => {
        if (event.keyCode == "13") {
            document.getElementById('fillAddr').click();
        }
    });
    mytext.focus();
})();


let currMode = 0;
let myTemp = "";

// Функция заполения адреса
function fillAddrFunc() {

    let elemCountry = document.querySelector('select[name="country"]');
    let elemProvinceSelect = document.querySelector('.sa-province-wrapper > select');
    let elemProvinceInput = document.querySelector('.sa-province-wrapper > input');
    let elemCitySelect = document.querySelector('.sa-city-wrapper > select');
    let elemCityInput = document.querySelector('.sa-city-wrapper > input');

    switch(currMode) {
        case 0:
            let namepass = document.getElementById("namepass");
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

            document.querySelector('input[name="contactPerson"]').value = mass[orderName];
            document.querySelector('input[name="address"]').value = mass[orderAddr];
            document.querySelector('input[name="zip"]').value = myIndex;
            document.querySelector('input[name="mobileNo"]').value = mass[orderPhone];
            elemCountry.value = myCountry;
            myTemp = elemProvinceSelect.options[1].text;
            elemCountry.dispatchEvent(new Event("change"));
            currMode = 1;
            return setTimeout(fillAddrFunc, 200);
            break;
        case 1:
            if (elemProvinceSelect.options[1].text == myTemp && myCountry != "BY")
                return setTimeout(fillAddrFunc, 200);
            if (myCountry == "BY") {
                elemProvinceInput.value = myProvince;
            } else {
                elemProvinceSelect.value = myProvince;
                elemProvinceSelect.dispatchEvent(new Event("change"));
            }
            currMode = 2;
            return setTimeout(fillAddrFunc, 200);
            break;
        case 2:
            if (elemCitySelect.length == 0 && myCountry != "BY")
                return setTimeout(fillAddrFunc, 200);
            if (myCountry == "BY") {
                elemCityInput.value = myCity;
            } else {
                elemCitySelect.value = myCity;
                elemCitySelect.dispatchEvent(new Event("change"));
            }
            currMode = 3;
            return setTimeout(fillAddrFunc, 200);
            break;
        case 3:
            document.querySelector('input[name="phoneCountry"]').value = myPhoneCode;
            currMode = 0;
            document.querySelector('.sa-confirm').click();
            break;
        default:
            alert("Ошибка в программе");
    }
}
