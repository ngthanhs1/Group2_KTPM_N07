const savedWords = JSON.parse(localStorage.getItem('words'));

// Nếu có dữ liệu từ vựng, sử dụng dữ liệu đó, nếu không, dùng dữ liệu mặc định
const words = savedWords || [
    { word: "Web development", definition: "Phát triển web", starred: false },
    { word: "Artificial Intelligence", definition: "Trí tuệ nhân tạo", starred: false },
    { word: "Data Science", definition: "Khoa học dữ liệu", starred: false },
    { word: "Machine Learning", definition: "Học máy", starred: false }
];

// Khởi tạo trạng thái đánh dấu sao từ localStorage nếu có
words.forEach(word => {
    if (word.starred === undefined) {
        word.starred = false;
    }
});

let currentIndex = 0;
let enterHandledInInput = false;
let filteredWords = words; // Danh sách từ hiển thị sau khi lọc

// Lấy trạng thái toggle từ localStorage, mặc định là "0" (Off)
const savedToggleState = localStorage.getItem('learnToggleState') || "0";
let learnToggleState = parseInt(savedToggleState);

// Lấy các phần tử
const cardContainer = document.getElementById('card-container');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const addWordBtn = document.getElementById('add-word-btn');
const newWordInput = document.getElementById('new-word');
const newDefinitionInput = document.getElementById('new-definition');
const shuffleBtn = document.getElementById('shuffle-btn');
const deleteWordBtn = document.getElementById('delete-word-btn');
const checkBtn = document.getElementById('check-btn');
const checkWordInput = document.getElementById('check-word-input');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const soundBtn = document.getElementById('sound-btn');
const helpBtn = document.getElementById('help-btn');
const starBtn = document.getElementById('star-btn');
const learnToggle = document.getElementById('learn-toggle');
// const toggleStatus = document.querySelector('.toggle-status');
const toggleStatus = learnToggle.nextElementSibling;

// Hàm hiển thị modal phím tắt
// function showHelpModal() {
//     const modal = document.createElement('div');
//     modal.className = 'help-modal';
//     modal.innerHTML = `
//         <h3>Phím tắt</h3>
//         <ul>
//             <li><strong>Enter</strong>: Kiểm tra từ</li>
//             <li><strong>Escape</strong>: Phát âm từ</li>
//             <li><strong>Arrow Left</strong>: Thẻ trước</li>
//             <li><strong>Arrow Right</strong>: Thẻ sau</li>
//             <li><strong>Arrow Up/Down</strong>: Lật thẻ</li>
//             <li><strong>Delete</strong>: Xóa thẻ</li>
//             <li><strong>Ctrl + X</strong>: Focus ô kiểm tra từ</li>
//             <li><strong>Ctrl + F</strong>: Focus ô Search từ</li>
//         </ul>
//         <button id="close-help">Close</button>
//     `;
//     document.body.appendChild(modal);

//     // Đóng modal khi nhấn Close
//     document.getElementById('close-help').addEventListener('click', () => {
//         modal.remove();
//     });

//     // Đóng modal khi nhấn Escape
//     const closeOnEscape = (event) => {
//         if (event.key === 'Escape') {
//             modal.remove();
//             document.removeEventListener('keydown', closeOnEscape);
//         }
//     };
//     document.addEventListener('keydown', closeOnEscape);
// }

function showHelpModal() {
    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Nửa trong suốt
    overlay.style.zIndex = '1999'; // Nằm ngay dưới modal (modal có z-index 2000)
    document.body.appendChild(overlay);

    // Tạo modal
    const modal = document.createElement('div');
    modal.className = 'help-modal';
    modal.innerHTML = `
        <h3>Phím tắt</h3>
        <ul>
            <li><strong>Enter</strong>: Kiểm tra từ</li>
            <li><strong>Escape</strong>: Phát âm từ</li>
            <li><strong>Arrow Left</strong>: Thẻ trước</li>
            <li><strong>Arrow Right</strong>: Thẻ sau</li>
            <li><strong>Arrow Up/Down</strong>: Lật thẻ</li>
            <li><strong>Delete</strong>: Xóa thẻ</li>
            <li><strong>Ctrl + X</strong>: Focus ô kiểm tra từ</li>
            <li><strong>Ctrl + F</strong>: Focus ô Search từ</li>
            <p>Cách thêm nhiều từ mới bằng file word:<br>Tạo file có cấu trúc:<br><strong>""<br>Từ Vựng<br>Nghĩa của từ<br>""</strong><br>Sau đó ghi vào file Word và tải lên Web</p>
        </ul>
        <button id="close-help">Close</button>
    `;
    document.body.appendChild(modal);

    // Hàm đóng modal
    const closeModal = () => {
        modal.remove();
        overlay.remove();
        document.removeEventListener('keydown', closeOnEscape);
    };

    // Đóng modal khi nhấn nút Close
    document.getElementById('close-help').addEventListener('click', closeModal);

    // Đóng modal khi nhấn Escape
    const closeOnEscape = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
        // Ngăn chặn các phím khác hoạt động khi modal đang hiển thị
        event.stopPropagation();
    };
    document.addEventListener('keydown', closeOnEscape);

    // Ngăn chặn các sự kiện click bên ngoài modal
    overlay.addEventListener('click', (event) => {
        event.stopPropagation(); // Ngăn click xuyên qua overlay
    });

    // Ngăn chặn các sự kiện phím khác (trừ Escape) khi modal hiển thị
    const preventOtherKeys = (event) => {
        if (event.key !== 'Escape') {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    document.addEventListener('keydown', preventOtherKeys);

    // Dọn dẹp sự kiện preventOtherKeys khi đóng modal
    modal.addEventListener('remove', () => {
        document.removeEventListener('keydown', preventOtherKeys);
    });
}

// Sự kiện nhấn nút Help
helpBtn.addEventListener('click', showHelpModal);

// Hàm hiển thị toast notification
function showToast(message, type = 'info', duration = 1500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Tự động xóa toast sau duration
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Hàm tạo thẻ từ vựng
function createCard(wordObj) {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    cardFront.innerHTML = `<span class="front">
                            <span style="text-align: center;">${currentIndex + 1} / ${filteredWords.length}</span><hr style="margin: 15px 0;">
                            <span class="word" style='visibility:hidden'>${wordObj.word}</span>
                            </span>`;

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.innerHTML = `<span class="definition">${wordObj.definition}</span>`;

    card.appendChild(cardInner);
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    cardContainer.appendChild(card);

    cardInner.addEventListener('click', () => {
        if (cardInner.style.transform === "rotateX(180deg)") {
            cardInner.style.transform = "rotateX(0deg)";
        } else {
            cardInner.style.transform = "rotateX(180deg)";
        }
    });
}

// Hàm cập nhật thẻ từ vựng theo index
function updateCard(index) {
    cardContainer.innerHTML = '';
    if (filteredWords.length > 0) {
        createCard(filteredWords[index]);
    } else {
        // Hiển thị thông báo nếu không có thẻ nào
        const noCardMessage = document.createElement('div');
        noCardMessage.textContent = 'Không có thẻ nào để hiển thị.';
        cardContainer.appendChild(noCardMessage);
    }
    // Cập nhật trạng thái nút ngôi sao
    if (filteredWords[index] && filteredWords[index].starred) {
        starBtn.classList.add('active');
    } else {
        starBtn.classList.remove('active');
    }
}

// Hàm lọc danh sách từ dựa trên trạng thái toggle
function filterWords() {
    if (learnToggleState === 0) { // Off
        filteredWords = words;
    } else if (learnToggleState === 1) { // Unlearned
        filteredWords = words.filter(word => word.starred);
        if (filteredWords.length === 0) {
            showToast("Chưa có thẻ nào được đánh dấu!", 'error', 2000);
            learnToggleState = 0; // Quay lại Off
            learnToggle.setAttribute('data-state', learnToggleState);
            toggleStatus.textContent = "Off";
            localStorage.setItem('learnToggleState', 0);
            filteredWords = words;
        }
    } else { // Learned
        filteredWords = words.filter(word => !word.starred);
    }
    currentIndex = 0; // Reset chỉ số về 0 khi lọc
    updateCard(currentIndex);
}

// Cập nhật trạng thái toggle ban đầu
learnToggle.setAttribute('data-state', learnToggleState);
toggleStatus.textContent = learnToggleState === 0 ? "Off" : learnToggleState === 1 ? "Unlearned" : "Learned";
filterWords(); // Lọc từ ban đầu dựa trên trạng thái toggle

// Sự kiện cho nút ngôi sao
starBtn.addEventListener('click', () => {
    if (filteredWords[currentIndex]) {
        filteredWords[currentIndex].starred = !filteredWords[currentIndex].starred;
        starBtn.classList.toggle('active', filteredWords[currentIndex].starred);
        localStorage.setItem('words', JSON.stringify(words));
        showToast(filteredWords[currentIndex].starred ? "Đã đánh dấu từ!" : "Đã bỏ đánh dấu từ!", 'success', 1500);
    }
});

// Sự kiện cho toggle switch
learnToggle.addEventListener('click', () => {
    learnToggleState = (learnToggleState + 1) % 3; // Chuyển đổi trạng thái: 0 -> 1 -> 2 -> 0
    learnToggle.setAttribute('data-state', learnToggleState);
    toggleStatus.textContent = learnToggleState === 0 ? "Off" : learnToggleState === 1 ? "Unlearned" : "Learned";
    localStorage.setItem('learnToggleState', learnToggleState);
    filterWords();
});

// Cập nhật thẻ ban đầu
updateCard(currentIndex);

// Cập nhật lại sự kiện nút điều hướng
prevButton.addEventListener("click", () => {
    slideCard("right", () => {
        currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
        updateCard(currentIndex);
    });
});

nextButton.addEventListener("click", () => {
    slideCard("left", () => {
        currentIndex = (currentIndex + 1) % filteredWords.length;
        updateCard(currentIndex);
    });
});

// Lắng nghe sự kiện Enter trên newWordInput và newDefinitionInput
[newWordInput, newDefinitionInput].forEach(input => {
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addWordBtn.click();
        }
    });
});

// Thêm từ mới vào mảng khi nhấn nút
addWordBtn.addEventListener('click', () => {
    const newWord = newWordInput.value.trim();
    const newDefinition = newDefinitionInput.value.trim();
    
    if (newWord && newDefinition) {
        const existingWords = words.filter(w => w.word.toLowerCase() === newWord.toLowerCase());
        if (existingWords.length > 0) {
            const existingList = existingWords.map((w, index) => `${index + 1}. "${w.word}" - "${w.definition}"`).join('\n');
            const confirmAdd = confirm(`Từ "${newWord}" đã tồn tại trong danh sách:\n${existingList}\nBạn có muốn thêm từ mới này không?`);
            if (!confirmAdd) {
                showToast("Hủy thêm từ mới.", 'info', 1500);
                newWordInput.value = '';
                newDefinitionInput.value = '';
                return;
            }
        }
        words.push({ word: newWord, definition: newDefinition, starred: false });
        localStorage.setItem('words', JSON.stringify(words));
        filterWords(); // Cập nhật lại danh sách lọc
        updateCard(filteredWords.length - 1);
        showToast("Từ mới đã được thêm!", 'success', 1500);
        newWordInput.value = '';
        newDefinitionInput.value = '';
    } else {
        showToast("Vui lòng nhập đầy đủ từ và nghĩa.", 'error', 1500);
    }
});

// Trộn thẻ khi nhấn nút
shuffleBtn.addEventListener('click', () => {
    filteredWords.sort(() => Math.random() - 0.5);
    updateCard(currentIndex);
});

// Hàm xóa từ vựng hiện tại
function deleteCard() {
    if (filteredWords.length > 0) {
        const wordToDelete = filteredWords[currentIndex].word;
        const definitionToDelete = filteredWords[currentIndex].definition;

        const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa từ "${wordToDelete}: ${definitionToDelete}" không?`);

        if (confirmDelete) {
            const originalIndex = words.findIndex(word => word.word === wordToDelete && word.definition === definitionToDelete);
            words.splice(originalIndex, 1);
            if (currentIndex >= filteredWords.length) {
                currentIndex = filteredWords.length - 1;
            }
            localStorage.setItem('words', JSON.stringify(words));
            filterWords();
            updateCard(currentIndex);
            showToast("Từ đã được xóa!", 'success', 1500);
        }
    } else {
        showToast("Không có từ để xóa!", 'error', 1500);
    }
}

// Hàm kiểm tra từ
function checkWord() {
    const inputWord = checkWordInput.value.trim().toLowerCase();
    const cardFrontWord = document.querySelector('.card-front .word');
    const correctWord = cardFrontWord.textContent.trim().toLowerCase();

    let wrongWordElement = document.querySelector('.wrong-word');
    if (wrongWordElement) {
        wrongWordElement.remove();
    }
    
    if (inputWord === correctWord) {
        cardFrontWord.style.visibility = "visible";
        cardFrontWord.style.color = "green";
        
        setTimeout(() => {
            cardFrontWord.style.visibility = "hidden";
        }, 10000);
    } else {

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
                initialText += `<span style="color:red; text-decoration: line-through" class="wrong-char">${inputWord[i]}</span>`;
            }
        }
        
        wrongWordElement.innerHTML = initialText;
        wrongWordElement.style.marginTop = "5px";
        wrongWordElement.style.textAlign = "center";
        wrongWordElement.style.width = "100%";
        wrongWordElement.style.fontSize = "30px";
        cardFrontWord.parentElement.appendChild(wrongWordElement);

        const wrongChars = wrongWordElement.querySelectorAll('.wrong-char');
        wrongChars.forEach((char) => {
            setTimeout(() => {
                char.style.transition = "opacity 0.5s ease-in-out";
                char.style.opacity = "0";
                setTimeout(() => char.remove(), 500);
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

        setTimeout(() => {
            if (wrongWordElement) {
                wrongWordElement.remove();
            }
        }, 5000);
    }
    
    checkWordInput.value = "";
}

function speakWord() {
    if (filteredWords.length > 0) {
        const utterance = new SpeechSynthesisUtterance(filteredWords[currentIndex].word);
        utterance.lang = 'en-GB';
        speechSynthesis.speak(utterance);
    }
}

function slideCard(direction, callback) {
    const card = document.querySelector(".card");
    if (!card) return;
    
    card.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
    card.style.transform = `translateX(${direction === 'left' ? '-100%' : '100%'})`;
    card.style.opacity = "0";
    
    setTimeout(() => {
        callback();
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

deleteWordBtn.addEventListener('click', deleteCard);
checkBtn.addEventListener('click', checkWord);
soundBtn.addEventListener('click', speakWord);

document.addEventListener('keydown', (event) => {
    const cardInner = document.querySelector('.card-inner');
    if (!cardInner) return;

    const currentTransform = cardInner.style.transform;

    if (event.key === 'ArrowUp') {
        if (currentTransform === "rotateX(-180deg)") {
            cardInner.style.transform = "rotateX(0deg)";
        } else {
            cardInner.style.transform = currentTransform === "rotateX(180deg)" ? "rotateX(0deg)" : "rotateX(180deg)";
        }
        event.preventDefault();
    } else if (event.key === 'ArrowDown') {
        if (currentTransform === "rotateX(180deg)") {
            cardInner.style.transform = "rotateX(0deg)";
        } else {
            cardInner.style.transform = currentTransform === "rotateX(-180deg)" ? "rotateX(0deg)" : "rotateX(-180deg)";
        }
        event.preventDefault();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        if (enterHandledInInput) {
            enterHandledInInput = false;
            return;
        }

        const activeElement = document.activeElement;
        if (
            activeElement.id === "new-word" ||
            activeElement.id === "new-definition" ||
            activeElement.id === "search-input"
        ) {
            return;
        }
        checkWord();
        activeElement.blur();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.target.tagName.toLowerCase() === "input" || event.target.tagName.toLowerCase() === "textarea") {
        return;
    }

    if (event.key === "ArrowLeft") {
        prevButton.click();
    } else if (event.key === "ArrowRight") {
        nextButton.click();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        speakWord();
    }
});

document.addEventListener('keydown', (event) => {
    const activeElement = document.activeElement;
    const inputIds = ['new-word', 'new-definition', 'search-input', 'check-word-input'];

    if (event.key === 'Delete' && !inputIds.includes(activeElement.id)) {
        deleteCard();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'x') {
        event.preventDefault();
        checkWordInput.focus();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        searchInput.focus();
    }
});

[searchInput].forEach(input => {
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            enterHandledInInput = true;
            searchWord();
            input.blur();
        }
    });
});

function searchWord() {
    let searchTerm = searchInput.value.trim().toLowerCase();
    let foundIndex = filteredWords.findIndex(wordObj => wordObj.word.toLowerCase().includes(searchTerm) || wordObj.definition.toLowerCase().includes(searchTerm));
    if (foundIndex !== -1 && searchTerm) {
        currentIndex = foundIndex;
        updateCard(currentIndex);
        const search = filteredWords[currentIndex].word;
        showToast(`Found: ${search}`, 'success', 2000);
    } else if (foundIndex !== -1) {
        showToast("Hãy nhập từ cần tìm!", 'error', 1500);
    } else {
        showToast("Không tìm thấy từ này!", 'error', 1500);
    }
    searchInput.value = "";
}

searchButton.addEventListener('click', searchWord);

// function showWordList() {
//     const overlay = document.createElement('div');
//     overlay.className = 'modal-overlay';
//     overlay.style.position = 'fixed';
//     overlay.style.top = '0';
//     overlay.style.left = '0';
//     overlay.style.width = '100%';
//     overlay.style.height = '100%';
//     overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
//     overlay.style.zIndex = '1999';
//     document.body.appendChild(overlay);

//     const modal = document.createElement('div');
//     modal.className = 'help-modal';
//     let wordListHTML = '<h3>Danh sách từ vựng</h3><div class="word-list-scroll"><ul>';
//     words.forEach((wordObj, index) => {
//         wordListHTML += `<li>
//             <span>${wordObj.word} - ${wordObj.definition}${wordObj.starred ? ' ⭐' : ''}</span>
//             <div>
//                 <button class="edit-word-btn" onclick="editWord(${index})">Sửa</button>
//                 <button class="delete-word-btn" onclick="deleteWord(${index})">Xóa</button>
//             </div>
//         </li>`;
//     });
//     wordListHTML += '</ul></div><button id="close-list">Đóng</button>';
//     modal.innerHTML = wordListHTML;
//     document.body.appendChild(modal);

//     const closeModal = () => {
//         modal.remove();
//         overlay.remove();
//     };

//     document.getElementById('close-list').addEventListener('click', closeModal);
//     overlay.addEventListener('click', closeModal);
// }

// function editWord(index) {
//     const newWord = prompt('Nhập từ mới:', words[index].word);
//     const newDefinition = prompt('Nhập nghĩa mới:', words[index].definition);
//     if (newWord && newDefinition) {
//         words[index].word = newWord;
//         words[index].definition = newDefinition;
//         localStorage.setItem('words', JSON.stringify(words));
//         filterWords();
//         updateCard(currentIndex);
//         showToast('Từ đã được chỉnh sửa!', 'success', 1500);
//     }
// }

// function deleteWord(index) {
//     if (confirm(`Xóa từ "${words[index].word}"?`)) {
//         words.splice(index, 1);
//         localStorage.setItem('words', JSON.stringify(words));
//         filterWords();
//         updateCard(currentIndex);
//         showToast('Từ đã được xóa!', 'success', 1500);
//     }
// }

// function showWordList() {
//     // Kiểm tra xem modal và overlay đã tồn tại chưa
//     let modal = document.querySelector('.help-modal');
//     let overlay = document.querySelector('.modal-overlay');

//     // Nếu modal chưa tồn tại, tạo mới
//     if (!modal || !overlay) {
//         overlay = document.createElement('div');
//         overlay.className = 'modal-overlay';
//         overlay.style.position = 'fixed';
//         overlay.style.top = '0';
//         overlay.style.left = '0';
//         overlay.style.width = '100%';
//         overlay.style.height = '100%';
//         overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
//         overlay.style.zIndex = '1999';
//         document.body.appendChild(overlay);

//         modal = document.createElement('div');
//         modal.className = 'help-modal';
//         modal.dataset.type = 'word-list'; // Đánh dấu là modal danh sách từ vựng
//         document.body.appendChild(modal);

//         // Sự kiện đóng modal
//         const closeModal = () => {
//             modal.remove();
//             overlay.remove();
//         };
//         overlay.addEventListener('click', closeModal);
//     } else {
//         // Nếu modal đã tồn tại, cập nhật type
//         modal.dataset.type = 'word-list';
//     }

//     // Cập nhật nội dung modal
//     let wordListHTML = '<h3>Danh sách từ vựng</h3><div class="word-list-scroll"><ul>';
//     words.forEach((wordObj, index) => {
//         wordListHTML += `<li>
//             <span>${wordObj.word} - ${wordObj.definition}${wordObj.starred ? ' ⭐' : ''}</span>
//             <div>
//                 <button class="edit-word-btn" onclick="editWord(${index})">Sửa</button>
//                 <button class="delete-word-btn" onclick="deleteWord(${index})">Xóa</button>
//             </div>
//         </li>`;
//     });
//     wordListHTML += '</ul></div><button id="close-list">Đóng</button>';
//     modal.innerHTML = wordListHTML;

//     // Gắn lại sự kiện đóng modal
//     document.getElementById('close-list').addEventListener('click', () => {
//         modal.remove();
//         overlay.remove();
//     });
// }

// function editWord(index) {
//     const newWord = prompt('Nhập từ mới:', words[index].word);
//     const newDefinition = prompt('Nhập nghĩa mới:', words[index].definition);
//     if (newWord && newDefinition) {
//         words[index].word = newWord;
//         words[index].definition = newDefinition;
//         localStorage.setItem('words', JSON.stringify(words));
//         filterWords();
//         updateCard(currentIndex);
//         showToast('Từ đã được chỉnh sửa!', 'success', 1500);
//         // Làm mới modal nếu đang hiển thị danh sách từ vựng
//         const modal = document.querySelector('.help-modal');
//         if (modal && modal.dataset.type === 'word-list') {
//             showWordList();
//         }
//     }
// }

// function deleteWord(index) {
//     if (confirm(`Xóa từ "${words[index].word}"?`)) {
//         words.splice(index, 1);
//         localStorage.setItem('words', JSON.stringify(words));
//         filterWords();
//         updateCard(currentIndex);
//         showToast('Từ đã được xóa!', 'success', 1500);
//         // Làm mới modal nếu đang hiển thị danh sách từ vựng
//         const modal = document.querySelector('.help-modal');
//         if (modal && modal.dataset.type === 'word-list') {
//             showWordList();
//         }
//     }
// }


// function showWordList() {
//     // Kiểm tra xem modal đã tồn tại chưa
//     let modal = document.querySelector('.help-modal');
//     let overlay = document.querySelector('.modal-overlay');

//     // Nếu modal chưa tồn tại, tạo mới
//     if (!modal || !overlay) {
//         overlay = document.createElement('div');
//         overlay.className = 'modal-overlay';
//         overlay.style.position = 'fixed';
//         overlay.style.top = '0';
//         overlay.style.left = '0';
//         overlay.style.width = '100%';
//         overlay.style.height = '100%';
//         overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
//         overlay.style.zIndex = '1999';
//         document.body.appendChild(overlay);

//         modal = document.createElement('div');
//         modal.className = 'help-modal';
//         modal.dataset.type = 'word-list'; // Đánh dấu là modal danh sách từ vựng
//         document.body.appendChild(modal);

//         // Sự kiện đóng modal
//         const closeModal = () => {
//             modal.remove();
//             overlay.remove();
//         };
//         overlay.addEventListener('click', closeModal);
//     } else {
//         modal.dataset.type = 'word-list';
//     }

//     // Cập nhật nội dung modal
//     let wordListHTML = '<h3>Danh sách từ vựng</h3><div class="word-list-scroll"><ul>';
//     words.forEach((wordObj, index) => {
//         wordListHTML += `<li data-index="${index}">
//             <span>${wordObj.word} - ${wordObj.definition}${wordObj.starred ? ' ⭐' : ''}</span>
//             <div>
//                 <button class="edit-word-btn" onclick="editWord(${index})">Sửa</button>
//                 <button class="delete-word-btn" onclick="deleteWord(${index})">Xóa</button>
//             </div>
//         </li>`;
//     });
//     wordListHTML += '</ul></div><button id="close-list">Đóng</button>';
//     modal.innerHTML = wordListHTML;

//     // Gắn sự kiện đóng modal
//     document.getElementById('close-list').addEventListener('click', () => {
//         modal.remove();
//         overlay.remove();
//     });
// }

// hàm thêm tính năng tìm kiếm, hàm trên chưa có
function showWordList() {
    // Kiểm tra xem modal đã tồn tại chưa
    let modal = document.querySelector('.help-modal');
    let overlay = document.querySelector('.modal-overlay');

    // Nếu modal chưa tồn tại, tạo mới
    if (!modal || !overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '1999';
        document.body.appendChild(overlay);

        modal = document.createElement('div');
        modal.className = 'help-modal';
        modal.dataset.type = 'word-list'; // Đánh dấu là modal danh sách từ vựng
        document.body.appendChild(modal);

        // Sự kiện đóng modal
        const closeModal = () => {
            modal.remove();
            overlay.remove();
        };
        overlay.addEventListener('click', closeModal);
    } else {
        modal.dataset.type = 'word-list';
    }

    // Cập nhật nội dung modal với ô tìm kiếm
    let wordListHTML = `
        <h3>Danh sách từ vựng</h3>
        <div class="word-search-container">
            <input type="text" id="word-list-search" placeholder="Tìm từ hoặc nghĩa...">
            <button id="word-list-search-btn">Tìm</button>
        </div>
        <div class="word-list-scroll"><ul id="word-list-content">`;
    words.forEach((wordObj, index) => {
        wordListHTML += `<li data-index="${index}">
            <span>${wordObj.word} - ${wordObj.definition}${wordObj.starred ? ' ⭐' : ''}</span>
            <div>
                <button class="edit-word-btn" onclick="editWord(${index})">Sửa</button>
                <button class="delete-word-btn" onclick="deleteWord(${index})">Xóa</button>
            </div>
        </li>`;
    });
    wordListHTML += `</ul></div><button id="close-list">Đóng</button>`;
    modal.innerHTML = wordListHTML;

    // Gắn sự kiện đóng modal
    document.getElementById('close-list').addEventListener('click', () => {
        modal.remove();
        overlay.remove();
    });

    // Hàm tìm kiếm trong danh sách từ vựng
    function searchWordList() {
        const searchTerm = document.getElementById('word-list-search').value.trim().toLowerCase();
        const wordListContent = document.getElementById('word-list-content');
        wordListContent.innerHTML = ''; // Xóa nội dung hiện tại

        const filtered = words.filter(wordObj =>
            wordObj.word.toLowerCase().includes(searchTerm) ||
            wordObj.definition.toLowerCase().includes(searchTerm)
        );

        if (filtered.length > 0) {
            filtered.forEach((wordObj, index) => {
                const originalIndex = words.findIndex(w => w.word === wordObj.word && w.definition === wordObj.definition);
                const li = document.createElement('li');
                li.dataset.index = originalIndex;
                li.innerHTML = `
                    <span>${wordObj.word} - ${wordObj.definition}${wordObj.starred ? ' ⭐' : ''}</span>
                    <div>
                        <button class="edit-word-btn" onclick="editWord(${originalIndex})">Sửa</button>
                        <button class="delete-word-btn" onclick="deleteWord(${originalIndex})">Xóa</button>
                    </div>
                `;
                wordListContent.appendChild(li);
            });
            showToast(`Tìm thấy ${filtered.length} từ!`, 'success', 1500);
        } else {
            wordListContent.innerHTML = '<li>Không tìm thấy từ nào!</li>';
            showToast('Không tìm thấy từ nào!', 'error', 1500);
        }
    }

    // Gắn sự kiện cho nút tìm kiếm
    document.getElementById('word-list-search-btn').addEventListener('click', searchWordList);

    // Gắn sự kiện Enter cho ô tìm kiếm
    document.getElementById('word-list-search').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchWordList();
        }
    });
}


function editWord(index) {
    const newWord = prompt('Nhập từ mới:', words[index].word);
    const newDefinition = prompt('Nhập nghĩa mới:', words[index].definition);
    if (newWord && newDefinition) {
        words[index].word = newWord;
        words[index].definition = newDefinition;
        localStorage.setItem('words', JSON.stringify(words));
        filterWords();
        updateCard(currentIndex);
        showToast('Từ đã được chỉnh sửa!', 'success', 1500);

        // Cập nhật mục trong modal mà không tạo lại
        const modal = document.querySelector('.help-modal');
        if (modal && modal.dataset.type === 'word-list') {
            const scrollContainer = modal.querySelector('.word-list-scroll');
            const scrollTop = scrollContainer.scrollTop; // Lưu vị trí cuộn
            const listItem = modal.querySelector(`li[data-index="${index}"]`);
            if (listItem) {
                listItem.querySelector('span').innerHTML = `${newWord} - ${newDefinition}${words[index].starred ? ' ⭐' : ''}`;
            }
            scrollContainer.scrollTop = scrollTop; // Khôi phục vị trí cuộn
        }
    }
}

function deleteWord(index) {
    if (confirm(`Xóa từ "${words[index].word}"?`)) {
        words.splice(index, 1);
        localStorage.setItem('words', JSON.stringify(words));
        filterWords();
        updateCard(currentIndex);
        showToast('Từ đã được xóa!', 'success', 1500);

        // Xóa mục trong modal mà không tạo lại
        const modal = document.querySelector('.help-modal');
        if (modal && modal.dataset.type === 'word-list') {
            const scrollContainer = modal.querySelector('.word-list-scroll');
            const scrollTop = scrollContainer.scrollTop; // Lưu vị trí cuộn
            const listItem = modal.querySelector(`li[data-index="${index}"]`);
            if (listItem) {
                listItem.remove(); // Xóa mục <li> khỏi danh sách
            }
            // Cập nhật lại data-index cho các mục còn lại
            const listItems = modal.querySelectorAll('.word-list-scroll ul li');
            listItems.forEach((item, i) => {
                item.dataset.index = i;
                item.querySelector('.edit-word-btn').setAttribute('onclick', `editWord(${i})`);
                item.querySelector('.delete-word-btn').setAttribute('onclick', `deleteWord(${i})`);
            });
            scrollContainer.scrollTop = scrollTop; // Khôi phục vị trí cuộn
        }
    }
}

// Gắn sự kiện cho nút "Xem danh sách"
document.getElementById('word-list-btn').addEventListener('click', showWordList);

// Lấy trạng thái chế độ từ localStorage, mặc định là "0" (sáng)
const savedThemeState = localStorage.getItem('themeState') || "0";
let themeState = parseInt(savedThemeState);

// Áp dụng chế độ khi tải trang
const themeToggle = document.getElementById('theme-toggle');
const themeStatus = themeToggle.nextElementSibling; // .toggle-status
if (themeState === 1) {
    document.body.classList.add('dark-mode');
    themeToggle.setAttribute('data-state', '1');
    themeStatus.textContent = 'Tối';
} else {
    document.body.classList.remove('dark-mode');
    themeToggle.setAttribute('data-state', '0');
    themeStatus.textContent = 'Sáng';
}

// Sự kiện cho toggle chế độ sáng/tối
themeToggle.addEventListener('click', () => {
    themeState = (themeState + 1) % 2; // Chuyển đổi giữa 0 (sáng) và 1 (tối)
    themeToggle.setAttribute('data-state', themeState);
    themeStatus.textContent = themeState === 0 ? 'Sáng' : 'Tìm kiếm';
    document.body.classList.toggle('dark-mode', themeState === 1);
    localStorage.setItem('themeState', themeState);
});





// Lấy phần tử upload
const uploadBtn = document.getElementById('upload-btn');
const uploadFileInput = document.getElementById('upload-file');

// Hàm xử lý file .docx
function handleFileUpload(event) {
    const file = uploadFileInput.files[0];
    if (!file) {
        showToast("Vui lòng chọn một file .docx!", 'error', 2000);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(function(result) {
                const text = result.value; // Nội dung text từ file .docx
                parseAndAddWords(text);
            })
            .catch(function(err) {
                showToast("Lỗi khi đọc file .docx!", 'error', 2000);
                console.error(err);
            });
    };
    reader.readAsArrayBuffer(file);
}

// Hàm phân tích nội dung và thêm từ vựng
function parseAndAddWords(text) {
    const lines = text.trim().split('\n');
    let newWords = [];
    let currentWord = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Bỏ qua dòng trống

        if (!currentWord) {
            // Dòng đầu tiên là từ vựng
            currentWord = { word: line, definition: null, starred: false };
        } else {
            // Dòng thứ hai là nghĩa (lưu nguyên văn)
            currentWord.definition = line;
            newWords.push(currentWord);
            currentWord = null;
            // Bỏ qua dòng trống tiếp theo (nếu có)
            if (i + 1 < lines.length && !lines[i + 1].trim()) {
                i++;
            }
        }
    }

    // Kiểm tra và thêm từ mới
    let addedCount = 0;
    newWords.forEach(newWord => {
        if (newWord.word && newWord.definition) {
            const existingWords = words.filter(w => w.word.toLowerCase() === newWord.word.toLowerCase());
            if (existingWords.length > 0) {
                const existingList = existingWords.map((w, index) => `${index + 1}. "${w.word}" - "${w.definition}"`).join('\n');
                const confirmAdd = confirm(`Từ "${newWord.word}" đã tồn tại:\n${existingList}\nBạn có muốn thêm từ mới này không?`);
                if (!confirmAdd) return;
            }
            words.push(newWord);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        localStorage.setItem('words', JSON.stringify(words));
        filterWords();
        updateCard(currentIndex);
        showToast(`Đã thêm ${addedCount} từ mới từ file!`, 'success', 2000);
    } else {
        showToast("Không tìm thấy từ vựng hợp lệ trong file!", 'error', 2000);
    }

    // Reset input file
    uploadFileInput.value = '';
}

// Sự kiện cho nút tải lên
uploadBtn.addEventListener('click', handleFileUpload);