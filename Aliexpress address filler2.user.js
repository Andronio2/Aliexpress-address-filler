// ==UserScript==
// @name         Aliexpress address filler
// @namespace    http://tampermonkey.net/
// @version      2.1
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
Выбираем свою страну: Kazakhstan, Russian Federation, Belarus, Ukraine
Область и город так, как написано на страничке адреса
Если область или город не получается, то смотрим код страницы
и ищем свои данные.
Задаем порядок следования ваших данных. Например у меня:
телефон -> адрес -> имя, соответственно у меня порядок
будет 0, 1, 2
*/

let myIndex     = "100000";
let myPhoneCode = "+7";
let myCountry   = "Russian Federation";
//let myCountry   = "Belarus";
let myProvince  = "Магаданская область";
let myCity      = "Бурхала";

let orderPhone  = 0;
let orderAddr   = 1;
let orderName   = 2;
let orderCountry= 3;
let orderCity   = 4;
let orderProvince = 5;
let orderIndex  = 6;
let orderPhCode = 7;

let delayStep   = 200; //ms

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
        padding: 10px 20px;
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
		let tempOblast = myProvince ? myProvince : mass[orderProvince];
        let tempGorod = myCity ? myCity : mass[orderCity];
		let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

        switch(currMode) {
            case 0: //Заполняем поля, смотрим страну
                let name = document.querySelector('input[name="contactPerson"]');
				nativeInputValueSetter.call(name, mass[orderName]);
				name.dispatchEvent(new Event('change', {bubbles: true}));
				name.dispatchEvent(new Event('keydown', {bubbles: true}));
				name.dispatchEvent(new Event('keyup', {bubbles: true}));
				name.dispatchEvent(new Event('keypress', {bubbles: true}));
				name.dispatchEvent(new Event('input', {bubbles: true}));

                let addr = document.querySelector('input[name="address"]');
				nativeInputValueSetter.call(addr, mass[orderAddr]);
				addr.dispatchEvent(new Event('change', {bubbles: true}));
				addr.dispatchEvent(new Event('input', {bubbles: true}));

                let zip = document.querySelector('input[name="zip"]');
				nativeInputValueSetter.call(zip, myIndex ? myIndex : mass[orderIndex]);
				zip.dispatchEvent(new Event('change', {bubbles: true}));
				zip.dispatchEvent(new Event('input', {bubbles: true}));

                let phone = document.querySelector('input[name="mobileNo"]');
				nativeInputValueSetter.call(phone, mass[orderPhone]);
				phone.dispatchEvent(new Event('change', {bubbles: true}));
				phone.dispatchEvent(new Event('input', {bubbles: true}));

				let currCountry = document.querySelector('.list_country .next-select .country-name');
				if (currCountry.innerText != tempCountry) {
					currCountry.click();
					currMode = 1;
					return setTimeout(fillAddrFunc, 200);
				} else currMode = 3;
                return setTimeout(fillAddrFunc, 200);
                break;
			case 1: //Ждем списка стран, выбираем страну
				let allCountry = document.querySelectorAll('.list_country .next-overlay-wrapper .country-name');
				if (allCountry.length == 0) return setTimeout(fillAddrFunc, 200);
				for (let i = 0; i < allCountry.length; i++) {
					if (allCountry[i].innerText == tempCountry) {
						allCountry[i].click();
						currMode = 2;
						return setTimeout(fillAddrFunc, 200);
					}
				}
				currMode = 0;
				alert('Неверная страна');
                break;
			case 2: //Ждем круг ожидания
				let waitCircle = document.querySelectorAll('.next-loading-tip');
				if (waitCircle.length != 0) return setTimeout(fillAddrFunc, 200);
				currMode = 3;
				return setTimeout(fillAddrFunc, delayStep);
				break;
			case 3:
				if (tempCountry == 'Belarus') {
					let oblast = document.querySelectorAll('.selector-item input');
					nativeInputValueSetter.call(oblast[0], tempOblast);
					oblast[0].dispatchEvent(new Event('change', {bubbles: true}));
					nativeInputValueSetter.call(oblast[1], myCity ? myCity : mass[orderCity]);
					oblast[1].dispatchEvent(new Event('change', {bubbles: true}));
					currMode = 7;
					return setTimeout(fillAddrFunc, 200);
				}
				let currOblast = document.querySelectorAll('.selector-item .next-select em');
                if (currOblast.length == 0) return setTimeout(fillAddrFunc, 200);
				if (currOblast[0].innerText != tempOblast) {
					currOblast[0].click();
                    if (tempCountry == 'Russian Federation') {
                        document.querySelector('.term-wrap .next-checkbox').click();
                    }
					currMode = 4;
					return setTimeout(fillAddrFunc, 200);
				} else currMode = 5;
                return setTimeout(fillAddrFunc, 200);
				return;
			case 4: //Ждем список областей, выбираем область
				let allOblast = document.querySelectorAll('.selector-item')[0].querySelectorAll('.next-overlay-wrapper .next-menu-item');
				if (allOblast.length == 0) return setTimeout(fillAddrFunc, 200);
				for (let i = 0; i < allOblast.length; i++) {
					if (allOblast[i].innerText == tempOblast) {
						allOblast[i].click();
						currMode = 5;
						return setTimeout(fillAddrFunc, delayStep);
					}
				}
				currMode = 0;
				alert('Неверная область');
                break;
			case 5:
				let currGorod = document.querySelectorAll('.selector-item .next-select em')[1];
				if (currGorod.innerText != tempGorod) {
					currGorod.click();
					currMode = 6;
					return setTimeout(fillAddrFunc, 200);
				} else currMode = 7;
                return setTimeout(fillAddrFunc, 200);
				return;
			case 6: //Ждем список городов, выбираем город
				let allGorod = document.querySelectorAll('.selector-item')[1].querySelectorAll('.next-overlay-wrapper .next-menu-item');
				if (allGorod.length == 0) return setTimeout(fillAddrFunc, 200);
				for (let i = 0; i < allGorod.length; i++) {
					if (allGorod[i].innerText == tempGorod) {
						allGorod[i].click();
						currMode = 7;
						return setTimeout(fillAddrFunc, delayStep);
					}
				}
				currMode = 0;
				alert('Неверный город');
                break;
			case 7:
				let phoneCode = document.getElementById('phoneCountry');
				nativeInputValueSetter.call(phoneCode, myPhoneCode ? myPhoneCode : mass[orderPhCode]);
				phoneCode.dispatchEvent(new Event('change', {bubbles: true}));


                document.querySelectorAll('.address-save button')[0].click();
				currMode = 8;
				return setTimeout(fillAddrFunc, 200);
				break;
			case 8: //Ждем круг ожидания
				let waitCircle2 = document.querySelectorAll('.next-loading-tip');
				if (waitCircle2.length != 0) return setTimeout(fillAddrFunc, 200);
				currMode = 9;
				return setTimeout(fillAddrFunc, delayStep);
				break;
            case 9:
				document.querySelectorAll('.address-save button')[0].click();
                break;
            default:
                alert("Ошибка в программе");
        }
    }
})();
