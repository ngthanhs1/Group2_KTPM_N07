var loginEmail = document.querySelector('#loginEmail'),
    loginPassword = document.querySelector('#loginPassword'),
    loginShowPasswordButton = document.querySelector('#login-showPasswordButton'),
    loginSVG = document.querySelector('.login-svgContainer'),
    twoFingers = document.querySelector('.twoFingers'),
    armL = document.querySelector('.armL'),
    armR = document.querySelector('.armR'),
    eyeL = document.querySelector('.eyeL'),
    eyeR = document.querySelector('.eyeR'),
    nose = document.querySelector('.nose'),
    mouth = document.querySelector('.mouth'),
    mouthBG = document.querySelector('.mouthBG'),
    mouthSmallBG = document.querySelector('.mouthSmallBG'),
    mouthMediumBG = document.querySelector('.mouthMediumBG'),
    mouthLargeBG = document.querySelector('.mouthLargeBG'),
    mouthMaskPath = document.querySelector('#mouthMaskPath'),
    mouthOutline = document.querySelector('.mouthOutline'),
    tooth = document.querySelector('.tooth'),
    tongue = document.querySelector('.tongue'),
    chin = document.querySelector('.chin'),
    face = document.querySelector('.face'),
    eyebrow = document.querySelector('.eyebrow'),
    outerEarL = document.querySelector('.earL .outerEar'),
    outerEarR = document.querySelector('.earR .outerEar'),
    earHairL = document.querySelector('.earL .earHair'),
    earHairR = document.querySelector('.earR .earHair'),
    hair = document.querySelector('.hair'),
    bodyBG = document.querySelector('.bodyBGnormal'),
    bodyBGchanged = document.querySelector('.bodyBGchanged');
var activeElement, curEmailIndex, screenCenter, svgCoords, emailCoords, emailScrollMax, chinMin = .5, dFromC, mouthStatus = "small", blinking, eyeScale = 1, eyesCovered = false, showPasswordClicked = false;
var eyeLCoords, eyeRCoords, noseCoords, mouthCoords, eyeLAngle, eyeLX, eyeLY, eyeRAngle, eyeRX, eyeRY, noseAngle, noseX, noseY, mouthAngle, mouthX, mouthY, mouthR, chinX, chinY, chinS, faceX, faceY, faceSkew, eyebrowSkew, outerEarX, outerEarY, hairX, hairS;

function calculateFaceMove(e) {
	var carPos = loginEmail.selectionEnd,
		div = document.createElement('div'),
		span = document.createElement('span'),
		copyStyle = getComputedStyle(loginEmail),
		caretCoords = {};

	if(carPos == null || carPos == 0) {
		// if browser doesn't support 'selectionEnd' property on input[type="email"], use 'value.length' property instead
		carPos = loginEmail.value.length;
	}
	[].forEach.call(copyStyle, function(prop){
		div.style[prop] = copyStyle[prop];
	});
	div.style.position = 'absolute';
	document.body.appendChild(div);
	div.textContent = loginEmail.value.substr(0, carPos);
	span.textContent = loginEmail.value.substr(carPos) || '.';
	div.appendChild(span);
	
	if(loginEmail.scrollWidth <= emailScrollMax) {
		caretCoords = getPosition(span);
		dFromC = screenCenter - (caretCoords.x + emailCoords.x);
		eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
		eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
		noseAngle = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
		mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
	} else {
		eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
		eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
		noseAngle = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
		mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
	}
	
	eyeLX = Math.cos(eyeLAngle) * 20;
	eyeLY = Math.sin(eyeLAngle) * 10;
	eyeRX = Math.cos(eyeRAngle) * 20;
	eyeRY = Math.sin(eyeRAngle) * 10;
	noseX = Math.cos(noseAngle) * 23;
	noseY = Math.sin(noseAngle) * 10;
	mouthX = Math.cos(mouthAngle) * 23;
	mouthY = Math.sin(mouthAngle) * 10;
	mouthR = Math.cos(mouthAngle) * 6;
	chinX = mouthX * .8;
	chinY = mouthY * .5;
	chinS = 1 - ((dFromC * .15) / 100);
	if(chinS > 1) {
		chinS = 1 - (chinS - 1);
		if(chinS < chinMin) {
			chinS = chinMin;	
		}
	}
	faceX = mouthX * .3;
	faceY = mouthY * .4;
	faceSkew = Math.cos(mouthAngle) * 5;
	eyebrowSkew = Math.cos(mouthAngle) * 25;
	outerEarX = Math.cos(mouthAngle) * 4;
	outerEarY = Math.cos(mouthAngle) * 5;
	hairX = Math.cos(mouthAngle) * 6;
	hairS = 1.2;	
	
	TweenMax.to(eyeL, 1, {x: -eyeLX , y: -eyeLY, ease: Expo.easeOut});
	TweenMax.to(eyeR, 1, {x: -eyeRX , y: -eyeRY, ease: Expo.easeOut});
	TweenMax.to(nose, 1, {x: -noseX, y: -noseY, rotation: mouthR, transformOrigin: "center center", ease: Expo.easeOut});
	TweenMax.to(mouth, 1, {x: -mouthX , y: -mouthY, rotation: mouthR, transformOrigin: "center center", ease: Expo.easeOut});
	TweenMax.to(chin, 1, {x: -chinX, y: -chinY, scaleY: chinS, ease: Expo.easeOut});
	TweenMax.to(face, 1, {x: -faceX, y: -faceY, skewX: -faceSkew, transformOrigin: "center top", ease: Expo.easeOut});
	TweenMax.to(eyebrow, 1, {x: -faceX, y: -faceY, skewX: -eyebrowSkew, transformOrigin: "center top", ease: Expo.easeOut});
	TweenMax.to(outerEarL, 1, {x: outerEarX, y: -outerEarY, ease: Expo.easeOut});
	TweenMax.to(outerEarR, 1, {x: outerEarX, y: outerEarY, ease: Expo.easeOut});
	TweenMax.to(earHairL, 1, {x: -outerEarX, y: -outerEarY, ease: Expo.easeOut});
	TweenMax.to(earHairR, 1, {x: -outerEarX, y: outerEarY, ease: Expo.easeOut});
	TweenMax.to(hair, 1, {x: hairX, scaleY: hairS, transformOrigin: "center bottom", ease: Expo.easeOut});	
		
	document.body.removeChild(div);
};

function onEmailInput(e) {
	calculateFaceMove(e);
	var value = loginEmail.value;
	curEmailIndex = value.length;
	
	// very crude email validation to trigger effects
	if(curEmailIndex > 0) {
		if(mouthStatus == "small") {
			mouthStatus = "medium";
			TweenMax.to([mouthBG, mouthOutline, mouthMaskPath], 1, {morphSVG: mouthMediumBG, shapeIndex: 8, ease: Expo.easeOut});
			TweenMax.to(tooth, 1, {x: 0, y: 0, ease: Expo.easeOut});
			TweenMax.to(tongue, 1, {x: 0, y: 1, ease: Expo.easeOut});
			TweenMax.to([eyeL, eyeR], 1, {scaleX: .85, scaleY: .85, ease: Expo.easeOut});
			eyeScale = .85;
		}
		if(value.includes("@")) {
			mouthStatus = "large";
			TweenMax.to([mouthBG, mouthOutline, mouthMaskPath], 1, {morphSVG: mouthLargeBG, ease: Expo.easeOut});
			TweenMax.to(tooth, 1, {x: 3, y: -2, ease: Expo.easeOut});
			TweenMax.to(tongue, 1, {y: 2, ease: Expo.easeOut});
			TweenMax.to([eyeL, eyeR], 1, {scaleX: .65, scaleY: .65, ease: Expo.easeOut, transformOrigin: "center center"});
			eyeScale = .65;
		} else {
			mouthStatus = "medium";
			TweenMax.to([mouthBG, mouthOutline, mouthMaskPath], 1, {morphSVG: mouthMediumBG, ease: Expo.easeOut});
			TweenMax.to(tooth, 1, {x: 0, y: 0, ease: Expo.easeOut});
			TweenMax.to(tongue, 1, {x: 0, y: 1, ease: Expo.easeOut});
			TweenMax.to([eyeL, eyeR], 1, {scaleX: .85, scaleY: .85, ease: Expo.easeOut});
			eyeScale = .85;
		}
	} else {
		mouthStatus = "small";
		TweenMax.to([mouthBG, mouthOutline, mouthMaskPath], 1, {morphSVG: mouthSmallBG, shapeIndex: 9, ease: Expo.easeOut});
		TweenMax.to(tooth, 1, {x: 0, y: 0, ease: Expo.easeOut});
		TweenMax.to(tongue, 1, {y: 0, ease: Expo.easeOut});
		TweenMax.to([eyeL, eyeR], 1, {scaleX: 1, scaleY: 1, ease: Expo.easeOut});
		eyeScale = 1;
	}
}

function onEmailFocus(e) {
	activeElement = "email";
	e.target.parentElement.classList.add("focusWithText");
	//stopBlinking();
	//calculateFaceMove();
	onEmailInput();
}

function onEmailBlur(e) {
	activeElement = null;
	setTimeout(function() {
		if(activeElement == "email") {
		} else {
			if(e.target.value == "") {
				e.target.parentElement.classList.remove("focusWithText");
			}
			//startBlinking();
			resetFace();
		}
	}, 100);
}

function onPasswordFocus(e) {
    activeElement = "password";
    e.target.parentElement.classList.add("focusWithText");
    if (!eyesCovered) {
        coverEyes();
    }
}

function onPasswordBlur(e) {
	activeElement = null;
	setTimeout(function() {
		if(activeElement == "showPassword" || activeElement == "password") {
            if(activeElement == "showPassword") {
                if(e.target.value == "") {
                    e.target.parentElement.classList.remove("focusWithText");
                }
			}
		} else {
			if(e.target.value == "") {
                e.target.parentElement.classList.remove("focusWithText");
            }
			uncoverEyes();
		}
	}, 100);
}

function onPasswordButtonFocus(e) {
	activeElement = "showPassword";
	if(!eyesCovered) {
		coverEyes();
	}
}

function onPasswordButtonBlur(e) {
	activeElement = null;
	if(!showPasswordClicked) {
		setTimeout(function() {
			if(activeElement == "password" || activeElement == "showPassword") {
			} else {
                if(loginPassword.value == "") {
                    loginPassword.parentElement.classList.remove("focusWithText");
                }
				uncoverEyes();
			}
		}, 100);
	}
}

function onPasswordButtonMouseDown(e) {
	showPasswordClicked = true;
}

function onPasswordButtonMouseUp(e) {
	showPasswordClicked = false;
}

function onPasswordButtonChange(e) {
       const isPasswordVisible = loginPassword.type === "text";
       const eyeOpenSVG = `
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 6C10.5 7.38071 9.38071 8.5 8 8.5C6.61929 8.5 5.5 7.38071 5.5 6C5.5 4.61929 6.61929 3.5 8 3.5C9.38071 3.5 10.5 4.61929 10.5 6Z" fill="black"></path>
                <path d="M0 6C0 6 3 0.5 8 0.5C13 0.5 16 6 16 6C16 6 13 11.5 8 11.5C3 11.5 0 6 0 6ZM8 9.5C9.933 9.5 11.5 7.933 11.5 6C11.5 4.067 9.933 2.5 8 2.5C6.067 2.5 4.5 4.067 4.5 6C4.5 7.933 6.067 9.5 8 9.5Z" fill="black"></path>
            </svg>
       `;
       const eyeClosedSVG = `
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.7904 11.9117L9.17617 10.2975C8.80858 10.4286 8.41263 10.5 8 10.5C6.067 10.5 4.5 8.933 4.5 7.00001C4.5 6.58738 4.5714 6.19143 4.70253 5.82384L2.64112 3.76243C0.938717 5.27903 0 7.00001 0 7.00001C0 7.00001 3 12.5 8 12.5C9.01539 12.5 9.9483 12.2732 10.7904 11.9117Z" fill="black"></path>
                <path d="M5.20967 2.08834C6.05172 1.72683 6.98462 1.50001 8 1.50001C13 1.50001 16 7.00001 16 7.00001C16 7.00001 15.0613 8.72098 13.3589 10.2376L11.2975 8.17615C11.4286 7.80857 11.5 7.41263 11.5 7.00001C11.5 5.06701 9.933 3.50001 8 3.50001C7.58738 3.50001 7.19144 3.57141 6.82386 3.70253L5.20967 2.08834Z" fill="black"></path>
                <path d="M5.52485 6.64616C5.50847 6.76175 5.5 6.87989 5.5 7.00001C5.5 8.38072 6.61929 9.50001 8 9.50001C8.12012 9.50001 8.23825 9.49154 8.35385 9.47516L5.52485 6.64616Z" fill="black"></path>
                <path d="M10.4752 7.35383L7.64618 4.52485C7.76176 4.50848 7.87989 4.50001 8 4.50001C9.38071 4.50001 10.5 5.6193 10.5 7.00001C10.5 7.12011 10.4915 7.23824 10.4752 7.35383Z" fill="black"></path>
                <path d="M13.6464 13.3536L1.64645 1.35356L2.35355 0.646454L14.3536 12.6465L13.6464 13.3536Z" fill="black"></path>
            </svg>
       `;
       if (isPasswordVisible) {
           loginPassword.type = "password";
           closeFingers();
           loginShowPasswordButton.innerHTML = eyeOpenSVG;
       } else {
           loginPassword.type = "text";
           spreadFingers();
           loginShowPasswordButton.innerHTML = eyeClosedSVG;
       }
}

function onPasswordButtonClick(e) {
	//console.log("click: " + e.target.id);
	e.target.focus();
}

function spreadFingers() {
	TweenMax.to(twoFingers, .35, {transformOrigin: "bottom left", rotation: 30, x: -9, y: -2, ease: Power2.easeInOut});
}

function closeFingers() {
	TweenMax.to(twoFingers, .35, {transformOrigin: "bottom left", rotation: 0, x: 0, y: 0, ease: Power2.easeInOut});
}

function coverEyes() {
	TweenMax.killTweensOf([armL, armR]);
	TweenMax.set([armL, armR], {visibility: "visible"});
	TweenMax.to(armL, .45, {x: -93, y: 10, rotation: 0, ease: Quad.easeOut});
	TweenMax.to(armR, .45, {x: -93, y: 10, rotation: 0, ease: Quad.easeOut, delay: .1});
	TweenMax.to(bodyBG, .45, {morphSVG: bodyBGchanged, ease: Quad.easeOut});
	eyesCovered = true;
}

function uncoverEyes() {
	TweenMax.killTweensOf([armL, armR]);
	TweenMax.to(armL, 1.35, {y: 220, ease: Quad.easeOut});
	TweenMax.to(armL, 1.35, {rotation: 105, ease: Quad.easeOut, delay: .1});
	TweenMax.to(armR, 1.35, {y: 220, ease: Quad.easeOut});
	TweenMax.to(armR, 1.35, {rotation: -105, ease: Quad.easeOut, delay: .1, onComplete: function() {
		TweenMax.set([armL, armR], {visibility: "hidden"});
	}});
	TweenMax.to(bodyBG, .45, {morphSVG: bodyBG, ease: Quad.easeOut});
	eyesCovered = false;
}

function resetFace() {
	TweenMax.to([eyeL, eyeR], 1, {x: 0, y: 0, ease: Expo.easeOut});
	TweenMax.to(nose, 1, {x: 0, y: 0, scaleX: 1, scaleY: 1, ease: Expo.easeOut});
	TweenMax.to(mouth, 1, {x: 0, y: 0, rotation: 0, ease: Expo.easeOut});
	TweenMax.to(chin, 1, {x: 0, y: 0, scaleY: 1, ease: Expo.easeOut});
	TweenMax.to([face, eyebrow], 1, {x: 0, y: 0, skewX: 0, ease: Expo.easeOut});
	TweenMax.to([outerEarL, outerEarR, earHairL, earHairR, hair], 1, {x: 0, y: 0, scaleY: 1, ease: Expo.easeOut});
}

function startBlinking(delay) {
	if(delay) {
		delay = getRandomInt(delay);
	} else {
		delay = 1;
	}
	blinking = TweenMax.to([eyeL, eyeR], .1, {
		delay: delay,
		scaleY: 0,
		yoyo: true,
		repeat: 1,
		transformOrigin: "center center",
		onComplete: function() {
			startBlinking(12);
	}});
}

function stopBlinking() {
	blinking.kill();
	blinking = null;
	TweenMax.set([eyeL, eyeR], {scaleY: eyeScale});
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function getAngle(x1, y1, x2, y2) {
	var angle = Math.atan2(y1 - y2, x1 - x2);
	return angle;
}

function getPosition(el) {
	var xPos = 0;
	var yPos = 0;

	while (el) {
		if (el.tagName == "BODY") {
			// deal with browser quirks with body/window/document and page scroll
			var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
			var yScroll = el.scrollTop || document.documentElement.scrollTop;

			xPos += (el.offsetLeft - xScroll + el.clientLeft);
			yPos += (el.offsetTop - yScroll + el.clientTop);
		} else {
			// for all other non-BODY elements
			xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
			yPos += (el.offsetTop - el.scrollTop + el.clientTop);
		}

		el = el.offsetParent;
	}
	//console.log("xPos: " + xPos + ", yPos: " + yPos);
	return {
		x: xPos,
		y: yPos
	};
}

function isMobileDevice() {
    return navigator.userAgentData?.mobile || /Mobi|Android/i.test(navigator.userAgent);
}

function initLoginForm() {
	// some measurements for the svg's elements
	svgCoords = getPosition(loginSVG);
	emailCoords = getPosition(loginEmail);
	screenCenter = svgCoords.x + (loginSVG.offsetWidth / 2);
	eyeLCoords = {x: svgCoords.x + 84, y: svgCoords.y + 76};
	eyeRCoords = {x: svgCoords.x + 113, y: svgCoords.y + 76};
	noseCoords = {x: svgCoords.x + 97, y: svgCoords.y + 81};
	mouthCoords = {x: svgCoords.x + 100, y: svgCoords.y + 100};
	
	// handle events for email input
	loginEmail.addEventListener('focus', onEmailFocus);
	loginEmail.addEventListener('blur', onEmailBlur);
	loginEmail.addEventListener('input', onEmailInput);
	
	// handle events for password input
	loginPassword.addEventListener('focus', onPasswordFocus);
	loginPassword.addEventListener('blur', onPasswordBlur);
	// password.addEventListener('input', onPasswordInput);
	//passwordLabel.addEventListener('click', onPasswordLabelClick);
	
	// handle events for show password button
	loginShowPasswordButton.addEventListener('focus', onPasswordButtonFocus);
	loginShowPasswordButton.addEventListener('blur', onPasswordButtonBlur);
	loginShowPasswordButton.addEventListener('click', function(e) {
        onPasswordButtonChange(e);
        onPasswordButtonClick(e);
    });
	loginShowPasswordButton.addEventListener('mouseup', onPasswordButtonMouseUp);
	loginShowPasswordButton.addEventListener('mousedown', onPasswordButtonMouseDown);
	
	// move arms to initial positions
	TweenMax.set(armL, {x: -93, y: 220, rotation: 105, transformOrigin: "top left"});
	TweenMax.set(armR, {x: -93, y: 220, rotation: -105, transformOrigin: "top right"});
	
	// set initial mouth property (fixes positioning bug)
	TweenMax.set(mouth, {transformOrigin: "center center"});
	
	// activate blinking
	startBlinking(5);
	
	// determine how far email input can go before scrolling occurs
	// will be used as the furthest point avatar will look to the right
	emailScrollMax = loginEmail.scrollWidth;
	
	// check if we're on mobile/tablet, if so then show password initially
	if(isMobileDevice()) {
		loginPassword.type = "text";
		TweenMax.set(twoFingers, {transformOrigin: "bottom left", rotation: 30, x: -9, y: -2, ease: Power2.easeInOut});
	}
	
	// clear the console
	console.clear();
}

initLoginForm();

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const emailVal = loginEmail.value.trim();
    const passwordVal = loginPassword.value.trim();

    if (!emailVal || !passwordVal) {
        alert("Vui lòng nhập email và mật khẩu!");
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: emailVal,
                password: passwordVal
            })
        });
        const data = await res.json();
        if (data.success) {
            // Đăng nhập thành công, chuyển sang trang chính
            window.location.href = "/index.html";
        } else {
            alert(data.message || "Đăng nhập thất bại!");
        }
    } catch (err) {
        alert("Lỗi kết nối server!");
    }
});