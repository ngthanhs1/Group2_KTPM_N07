const savedWords = JSON.parse(localStorage.getItem('words'));

//Dữ liệu mặc định
const words = savedWords || [
    { word: "Web development", definition: "Phát triển web" },
    { word: "Artificial Intelligence", definition: "Trí tuệ nhân tạo" },
    { word: "Data Science", definition: "Khoa học dữ liệu" },
    { word: "Machine Learning", definition: "Học máy" }
];

let currentIndex = 0;

// Lấy các phần tử
const cardContainer = document.getElementById('card-container');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const addWordBtn = document.getElementById('add-word-btn');
const newWordInput = document.getElementById('new-word');
const newDefinitionInput = document.getElementById('new-definition');
// const shuffleBtn = document.getElementById('shuffle-btn');
const cardCount = document.getElementById('card-count');
const deleteWordBtn = document.getElementById('delete-word-btn'); // Nút xóa từ
const checkBtn = document.getElementById('check-btn');
const checkWordInput = document.getElementById('check-word-input');
// const searchInput = document.getElementById('search-input');
// const searchButton = document.getElementById('search-btn');
const soundBtn = document.getElementById('sound-btn');

// Hàm tạo thẻ từ vựng
function createCard(wordObj) {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    cardFront.innerHTML = `<span class="front">
                            <span style="text-align: center;">Thẻ ${currentIndex + 1} / ${words.length}</span><br>
                            <span style="text-align: center;">Nhấn Esc để nghe, Enter để check</span><hr style="margin: 15px 0;">
                            <span class="word" style='visibility:hidden'>${wordObj.word}</span>
                            <span class="hr"><hr></span>
                            <span class="correct" style="text-align: center; visibility:hidden">Correct!</span>
                            </span>`;

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.innerHTML = `<span class="definition">${wordObj.definition}</span>`;
    card.appendChild(cardInner);
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    cardContainer.appendChild(card);

    // Lắng nghe sự kiện click để lật thẻ
    cardInner.addEventListener('click', () => {
        if (cardInner.style.transform === "rotateX(180deg)") {
            cardInner.style.transform = "rotateX(0deg)";  // Quay lại trạng thái ban đầu
        } else {
            cardInner.style.transform = "rotateX(180deg)";  // Lật thẻ
        }
    });
}

// Hàm cập nhật thẻ từ vựng theo index
function updateCard(index) {
    cardContainer.innerHTML = ''; // Xóa các thẻ hiện tại
    if (words.length > 0) {
        createCard(words[index]); // Tạo thẻ mới
        cardCount.textContent = `Số lượng thẻ: ${words.length}`; // Cập nhật số lượng thẻ
    } else {
        cardCount.textContent = 'Số lượng thẻ: 0'; // Nếu không còn thẻ nào
    }
}

// Cập nhật thẻ ban đầu
updateCard(currentIndex);

// Cập nhật lại sự kiện nút điều hướng
prevButton.addEventListener("click", () => {
    slideCard("right", () => {
        currentIndex = (currentIndex - 1 + words.length) % words.length;
        updateCard(currentIndex);
    });
});

nextButton.addEventListener("click", () => {
    slideCard("left", () => {
        currentIndex = (currentIndex + 1) % words.length;
        updateCard(currentIndex);
    });
});

// Thêm từ mới vào mảng khi nhấn nút
addWordBtn.addEventListener('click', () => {
    const newWord = newWordInput.value.trim();
    const newDefinition = newDefinitionInput.value.trim();

    // Kiểm tra nếu cả từ và nghĩa không rỗng
    if (newWord && newDefinition) {
        // Thêm từ mới vào mảng
        words.push({ word: newWord, definition: newDefinition });
        
        // Lưu mảng từ vựng vào localStorage
        localStorage.setItem('words', JSON.stringify(words));
        
        // Cập nhật thẻ hiện tại
        updateCard(words.length - 1); // Hiển thị từ mới vừa thêm
        alert("Từ mới đã được thêm!");
        
        // Xóa dữ liệu trong input
        newWordInput.value = '';
        newDefinitionInput.value = '';
    } else {
        alert("Vui lòng nhập đầy đủ từ và nghĩa.");
    }
});

// // Trộn thẻ khi nhấn nút
// shuffleBtn.addEventListener('click', () => {
//     words.sort(() => Math.random() - 0.5); // Trộn ngẫu nhiên
//     updateCard(currentIndex);
// });

// Hàm xóa từ vựng hiện tại
function deleteCard() {
    if (words.length > 0) {
        // Xóa từ vựng tại vị trí hiện tại
        words.splice(currentIndex, 1);

        // Nếu xóa từ vựng cuối cùng, đưa chỉ số về 0
        if (currentIndex >= words.length) {
            currentIndex = words.length - 1;
        }

        // Lưu lại mảng đã thay đổi vào localStorage
        localStorage.setItem('words', JSON.stringify(words));

        // Cập nhật thẻ sau khi xóa
        updateCard(currentIndex);

        alert("Từ đã được xóa!");
    } else {
        alert("Không có từ để xóa!");
    }
}

// Hàm kiểm tra từ
function checkWord() {
    const inputWord = checkWordInput.value.trim().toLowerCase();
    const cardFrontWord = document.querySelector('.card-front .word');
    const correctWord = cardFrontWord.textContent.trim().toLowerCase();
    const hrElement = document.querySelector('.card-front .hr hr'); // Lấy thẻ <hr>
    const crWord = document.querySelector('.card-front .correct');

    // Xóa từ sai cũ (nếu có)
    let wrongWordElement = document.querySelector('.wrong-word');
    if (wrongWordElement) {
        wrongWordElement.remove();
    }    
    
    if (inputWord === correctWord) {        
        cardFrontWord.style.visibility = "visible";
        crWord.style.visibility = "visible";
        cardFrontWord.style.color = "green";
        crWord.style.color = "green";
        
        // Reset width về 0 rồi chuyển sang 100% với màu xanh
        hrElement.style.transition = "none"; // Tắt transition tạm thời để reset
        hrElement.style.width = "0"; // Reset về 0
        
        // Bật lại transition và chạy animation
        setTimeout(() => {
            hrElement.style.transition = "width 0.5s ease-in-out"; // Chỉ transition width
            hrElement.style.width = "100%"; // Mở rộng sang phải
            hrElement.style.height = "10%"; // Mở rộng sang phải
            hrElement.style.backgroundColor = "green"; // Chuyển sang xanh
        }, 10);

    } else {
        crWord.textContent = "Incorrect!";
        crWord.style.visibility = "visible";
        crWord.style.color = "red";

        // Tạo phần tử hiển thị từ sai
        wrongWordElement = document.createElement("div");
        wrongWordElement.classList.add("wrong-word");

        let initialText = "";
        let a = 0;
        let selectedIndices = new Set();
        
        for (let i = 0; i < correctWord.length; i++) {
            for (let j = a; j < inputWord.length; j++) {
                if (inputWord[j] === correctWord[i] && inputWord[j] !== " ") {
                    selectedIndices.add(j);
                    a = j + 1;
                    break;
                }
            }
        }
        
        for (let i = 0; i < inputWord.length; i++) {
            if (inputWord[i] === " ") {
                initialText += `<span> </span>`;
            } else if (selectedIndices.has(i)) {
                initialText += `<span style="color: green" class="correct-char">${inputWord[i]}</span>`;
            } else {
                initialText += `<span style="color: red; text-decoration: line-through" class="wrong-char">${inputWord[i]}</span>`;
            }
        }
        
        wrongWordElement.innerHTML = initialText;

        wrongWordElement.style.marginTop = "5px";
        wrongWordElement.style.textAlign = "center";
        wrongWordElement.style.width = "100%";
        wrongWordElement.style.fontSize = "25px";

        cardFrontWord.parentElement.appendChild(wrongWordElement);

        const wrongChars = wrongWordElement.querySelectorAll('.wrong-char');
        wrongChars.forEach((char) => {
            setTimeout(() => {
                char.style.transition = "opacity 0.5s ease-in-out";
                char.style.opacity = "0";
                setTimeout(() => {
                    char.remove(); 
                }, 500); 
            }, 1000);
        });

        setTimeout(() => {
            let finalText = "";
            let matchedIndices = new Set(selectedIndices);
            let inputPos = 0;
            let positionMap = new Map(); 

            for (let i = 0; i < correctWord.length; i++) {
                if (correctWord[i] === " ") {
                    finalText += `<span> </span>`;
                } else {
                    let matched = false;
                    for (let j = inputPos; j < inputWord.length; j++) {
                        if (matchedIndices.has(j) && inputWord[j] === correctWord[i]) {
                            finalText += `<span style="color: green" class="correct-char" data-from="${j}" data-to="${i}">${correctWord[i]}</span>`;
                            positionMap.set(i, j);
                            inputPos = j + 1;
                            matchedIndices.delete(j);
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        finalText += `<span style="color: red" class="added-char">${correctWord[i]}</span>`;
                    }
                }
            }
            wrongWordElement.innerHTML = finalText;

            const correctChars = wrongWordElement.querySelectorAll('.correct-char');
            const addedChars = wrongWordElement.querySelectorAll('.added-char');

            correctChars.forEach((char) => {
                const fromPos = parseInt(char.getAttribute('data-from')); 
                const toPos = parseInt(char.getAttribute('data-to'));
                const offset = (fromPos - toPos) * 20;
                char.style.position = "relative";
                char.style.left = `${offset}px`; 
                setTimeout(() => {
                    char.style.transition = "left 0.7s ease-in-out"; 
                    char.style.left = "0px"; 
                }, 50);
            });

            addedChars.forEach((char, index) => {
                char.style.opacity = "0";
                char.style.transform = "translateX(-20px)";
                setTimeout(() => {
                    char.style.transition = "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";
                    char.style.opacity = "1";
                    char.style.transform = "translateX(0)";
                }, index * 100);
            });
        }, 1500);

        hrElement.style.transition = "none";
        hrElement.style.width = "0";
        hrElement.style.backgroundColor = "ffcd1f";

        setTimeout(() => {
            hrElement.style.transition = "width 0.5s ease-in-out"; 
            hrElement.style.width = "100%";
            hrElement.style.height = "10%"; 
            hrElement.style.backgroundColor = "red"; 
        }, 10);

        setTimeout(() => {
            if (wrongWordElement) {
                wrongWordElement.remove();
            }

            hrElement.style.transition = "none";
            hrElement.style.width = "100%"; 
            hrElement.style.height = "10%"; 
            hrElement.style.backgroundColor = "red"; 

            setTimeout(() => {
                hrElement.style.transition = "width 0.5s ease-in-out";
                hrElement.style.width = "0"; 
                hrElement.style.backgroundColor = "red"; 
            }, 10);
    
            crWord.style.visibility = "hidden";
        }, 5000);
    }
    
    checkWordInput.value = "";
}

function speakWord() {
    if (words.length > 0) {
        const utterance = new SpeechSynthesisUtterance(words[currentIndex].word);
        utterance.lang = 'en-GB';  // Ngôn ngữ phát âm (tiếng Anh)
        speechSynthesis.speak(utterance);
    }
}

// Hàm tạo hiệu ứng trượt cho thẻ
function slideCard(direction, callback) {
    const card = document.querySelector(".card");
    if (!card) return;
    
    card.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
    card.style.transform = `translateX(${direction === 'left' ? '-100%' : '100%'})`;
    card.style.opacity = "0";
    
    setTimeout(() => {
        callback(); // Gọi hàm cập nhật thẻ
        
        // Thêm hiệu ứng trượt vào khi hiển thị thẻ mới
        const newCard = document.querySelector(".card");
        if (newCard) {
            newCard.style.transform = `translateX(${direction === 'left' ? '100%' : '-100%'})`;
            newCard.style.opacity = "0";
            setTimeout(() => {
                newCard.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
                newCard.style.transform = "translateX(0)";
                newCard.style.opacity = "1";
            }, 50);
        }
    }, 300);
}

// Thêm sự kiện cho nút Xóa từ
deleteWordBtn.addEventListener('click', deleteCard);
checkBtn.addEventListener('click', checkWord);
soundBtn.addEventListener('click', speakWord);

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") { 
        checkWord(); // Gọi hàm khi nhấn phím Enter
    }
});

document.addEventListener("keydown", (event) => {
    // Kiểm tra nếu đang nhập liệu trong input hoặc textarea thì bỏ qua
    if (event.target.tagName.toLowerCase() === "input" || event.target.tagName.toLowerCase() === "textarea") {
        return;
    }

    if (event.key === "ArrowLeft") {
        prevButton.click(); // Giả lập click vào nút prevButton
    } else if (event.key === "ArrowRight") {
        nextButton.click(); // Giả lập click vào nút nextButton
    }
});


document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {  
        speakWord();
    }
});

// function searchWord() {
//     let searchTerm = searchInput.value.trim().toLowerCase();
//     let foundIndex = words.findIndex(wordObj => wordObj.word.toLowerCase().includes(searchTerm) || wordObj.definition.toLowerCase().includes(searchTerm));
//     if (foundIndex !== -1) {
//         currentIndex = foundIndex;
//         updateCard(currentIndex);
//         alert(`Found!`);
//     } else {
//         alert("Không tìm thấy từ này!");
//     }

//     searchInput.value = ""; // Xóa nội dung ô nhập sau khi kiểm tra
// }

// searchButton.addEventListener('click', searchWord);