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
let editingWordOriginalIndex = -1; // Lưu chỉ số của từ đang được chỉnh sửa trong mảng 'words' gốc

// Lấy các phần tử DOM (Đã cập nhật và thêm các ID mới)
const cardContainer = document.getElementById('card-container');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const shuffleButton = document.getElementById('shuffle'); // Thêm nút shuffle
const addEditWordBtn = document.getElementById('add-edit-word-btn'); // Nút Add/Save
const editCurrentWordBtn = document.getElementById('edit-current-word-btn'); // Nút Edit
const newWordInput = document.getElementById('new-word');
const newDefinitionInput = document.getElementById('new-definition');
const deleteWordBtn = document.getElementById('delete-word-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const starToggle = document.getElementById('star-toggle'); // toggle Từ đã gắn sao
const starToggleStatus = document.getElementById('star-toggle-status');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleStatus = document.getElementById('theme-toggle-status');
const learnToggle = document.getElementById('learn-toggle'); // toggle Chế độ ôn tập
const learnToggleStatus = document.getElementById('learn-toggle-status');
const uploadFile = document.getElementById('upload-file');
const uploadBtn = document.getElementById('upload-btn');
const starButton = document.getElementById('star-button'); // Nút ngôi sao trên thẻ
const wordIndexDisplay = document.getElementById('word-index'); // Thêm phần tử hiển thị chỉ số từ
const toastNotification = document.getElementById('toast-notification'); // Thêm toast notification

// Modal Elements
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const wordToDeleteSpan = document.getElementById('wordToDelete');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');


// --- Hàm hiển thị thông báo (Toast Notification) ---
function showToast(message, type = 'info', duration = 3000) {
    toastNotification.textContent = message;
    toastNotification.className = `toast-notification show ${type}`; // Thêm type

    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, duration);
}

// --- Hàm cập nhật thẻ từ vựng ---
function updateCard(index) {
    if (filteredWords.length === 0) {
        cardContainer.innerHTML = `
            <div class="card">
                <div class="card-inner">
                    <div class="card-front">Không có từ nào để hiển thị</div>
                    <div class="card-back"></div>
                </div>
            </div>
        `;
        wordIndexDisplay.textContent = "0/0";
        prevButton.disabled = true;
        nextButton.disabled = true;
        shuffleButton.disabled = true; // Vô hiệu hóa shuffle khi không có từ
        starButton.style.display = 'none'; // Ẩn nút sao
        editCurrentWordBtn.disabled = true; // Vô hiệu hóa nút Edit
        deleteWordBtn.disabled = true; // Vô hiệu hóa nút Delete
        return;
    }

    // Đảm bảo index nằm trong giới hạn
    if (index >= filteredWords.length) {
        index = 0;
        currentIndex = 0;
    }
    if (index < 0) {
        index = filteredWords.length - 1;
        currentIndex = filteredWords.length - 1;
    }

    const currentWord = filteredWords[index];

    // Tạo HTML cho thẻ từ vựng
    cardContainer.innerHTML = `
        <div class="card" id="current-card">
            <div class="card-inner" id="card-inner">
                <div class="card-front">
                    <div class="card-front-content">
                        ${currentWord.word} 
                        <span class="speaker-icon" id="speakWordBtn" data-text="${currentWord.word}">🔊</span>
                    </div>
                </div>
                <div class="card-back">${currentWord.definition}</div>
            </div>
        </div>
    `;

    // Cập nhật trạng thái nút ngôi sao
    if (currentWord.starred) {
        starButton.classList.add('starred');
    } else {
        starButton.classList.remove('starred');
    }
    starButton.style.display = 'block'; // Hiển thị nút sao khi có từ

    // Cập nhật chỉ số từ
    wordIndexDisplay.textContent = `${currentIndex + 1}/${filteredWords.length}`;

    // Cập nhật trạng thái nút điều hướng và chức năng
    prevButton.disabled = (filteredWords.length <= 1);
    nextButton.disabled = (filteredWords.length <= 1);
    shuffleButton.disabled = (filteredWords.length <= 1);
    editCurrentWordBtn.disabled = false; // Bật lại nút Edit
    deleteWordBtn.disabled = false; // Bật lại nút Delete


    // Xử lý sự kiện lật thẻ
    document.getElementById('current-card').addEventListener('click', () => {
        document.getElementById('current-card').classList.toggle('flipped');
    });

    // --- LOGIC PHÁT ÂM ---
    const speakWordBtn = document.getElementById('speakWordBtn');
    if (speakWordBtn) {
        speakWordBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Ngăn sự kiện click này lan ra thẻ và làm lật thẻ
            const textToSpeak = event.target.dataset.text;
            speakText(textToSpeak, 'en-US'); // Gọi hàm phát âm
        });
    }
}

// --- Hàm phát âm văn bản ---
function speakText(text, lang = 'en-US', rate = 1.0, pitch = 1.0) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang; // Ngôn ngữ (ví dụ: 'en-US' cho tiếng Anh, 'vi-VN' cho tiếng Việt)
        utterance.rate = rate; // Tốc độ nói (0.1 - 10, mặc định 1)
        utterance.pitch = pitch; // Cao độ (0 - 2, mặc định 1)

        // Tùy chọn: Chọn giọng đọc cụ thể (nếu bạn muốn)
        // const voices = window.speechSynthesis.getVoices();
        // utterance.voice = voices.find(voice => voice.name === 'Google US English'); // Ví dụ chọn giọng

        window.speechSynthesis.speak(utterance);
    } else {
        showToast('Trình duyệt của bạn không hỗ trợ tính năng phát âm.', 'error', 3000);
        console.warn('SpeechSynthesis API not supported in this browser.');
    }
}

// --- Hàm lọc từ vựng ---
function filterWords() {
    const isStarFilterOn = starToggle.dataset.state === "1";
    const isLearnFilterOn = learnToggle.dataset.state === "1";

    if (isStarFilterOn) {
        filteredWords = words.filter(word => word.starred);
    } else if (isLearnFilterOn) {
        // Logic cho chế độ ôn tập: ví dụ lọc từ có nghĩa ngắn hơn 10 ký tự (có thể thay đổi)
        // Đây là một ví dụ đơn giản, bạn có thể thay đổi logic này dựa trên định nghĩa "ôn tập" của bạn
        filteredWords = words.filter(word => word.definition.length < 10);
        showToast("Chế độ ôn tập đang bật (hiển thị từ có nghĩa ngắn).", "info", 2000);
    } else {
        filteredWords = words; // Không lọc
    }

    if (filteredWords.length === 0 && (isStarFilterOn || isLearnFilterOn)) {
        showToast("Không có từ nào phù hợp với điều kiện lọc.", "info", 3000);
    }
}

// --- Hàm để reset chế độ chỉnh sửa về chế độ thêm mới ---
function resetEditMode() {
    addEditWordBtn.textContent = 'Add';
    addEditWordBtn.dataset.mode = 'add';
    newWordInput.value = '';
    newDefinitionInput.value = '';
    editingWordOriginalIndex = -1;
    newWordInput.focus(); // Focus lại vào ô nhập từ mới
}

// --- Event Listeners ---

// Nút Previous
prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
    updateCard(currentIndex);
    resetEditMode(); // Reset chế độ chỉnh sửa khi chuyển thẻ
});

// Nút Next
nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % filteredWords.length;
    updateCard(currentIndex);
    resetEditMode(); // Reset chế độ chỉnh sửa khi chuyển thẻ
});

// Nút Shuffle
shuffleButton.addEventListener('click', () => {
    if (filteredWords.length > 0) {
        // Trộn ngẫu nhiên filteredWords
        for (let i = filteredWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredWords[i], filteredWords[j]] = [filteredWords[j], filteredWords[i]];
        }
        currentIndex = 0; // Hiển thị từ đầu tiên sau khi trộn
        updateCard(currentIndex);
        resetEditMode(); // Reset chế độ chỉnh sửa khi trộn
        showToast('Đã trộn ngẫu nhiên danh sách từ!', 'info');
    }
});

// Xử lý nút Add/Save Changes
addEditWordBtn.addEventListener('click', () => {
    const word = newWordInput.value.trim();
    const definition = newDefinitionInput.value.trim();

    if (!word || !definition) {
        showToast('Vui lòng nhập cả từ và nghĩa!', 'error');
        return;
    }

    if (addEditWordBtn.dataset.mode === 'add') {
        // --- CHẾ ĐỘ THÊM MỚI ---
        const isDuplicate = words.some(w => w.word.toLowerCase() === word.toLowerCase());
        if (isDuplicate) {
            showToast('Từ này đã tồn tại trong danh sách!', 'error');
            return;
        }

        words.push({ word, definition, starred: false });
        localStorage.setItem('words', JSON.stringify(words));
        showToast('Đã thêm từ mới thành công!', 'success');
        resetEditMode(); // Reset input và mode
        filterWords(); // Cập nhật lại danh sách sau khi thêm
        currentIndex = filteredWords.length - 1; // Chuyển đến từ vừa thêm
        updateCard(currentIndex);

    } else if (addEditWordBtn.dataset.mode === 'edit') {
        // --- CHẾ ĐỘ CHỈNH SỬA ---
        if (editingWordOriginalIndex === -1) {
            showToast('Không có từ nào đang được chỉnh sửa!', 'error');
            return;
        }

        const originalWordObject = words[editingWordOriginalIndex];

        // Kiểm tra xem có từ nào khác trong danh sách (trừ từ đang sửa) có cùng từ mới không
        const isDuplicate = words.some((w, idx) =>
            idx !== editingWordOriginalIndex && w.word.toLowerCase() === word.toLowerCase()
        );

        if (isDuplicate) {
            showToast('Từ mới này đã tồn tại ở một từ khác!', 'error');
            return;
        }

        // Cập nhật từ trong mảng gốc
        originalWordObject.word = word;
        originalWordObject.definition = definition;
        localStorage.setItem('words', JSON.stringify(words));
        showToast('Đã cập nhật từ thành công!', 'success');

        resetEditMode(); // Reset về chế độ "Add"
        filterWords(); // Cập nhật lại danh sách sau khi sửa
        // Tìm lại index của từ vừa sửa trong filteredWords để hiển thị
        currentIndex = filteredWords.findIndex(w => w.word === word && w.definition === definition);
        if (currentIndex === -1 && filteredWords.length > 0) { // Nếu không tìm thấy (do bộ lọc)
            currentIndex = 0; // Chuyển về từ đầu tiên
        } else if (filteredWords.length === 0) {
             currentIndex = 0;
        }
        updateCard(currentIndex);
    }
});

// Nút Edit - Bắt đầu chỉnh sửa từ hiện tại
editCurrentWordBtn.addEventListener('click', () => {
    if (filteredWords.length === 0) {
        showToast('Không có từ nào để chỉnh sửa!', 'info');
        return;
    }

    const currentWord = filteredWords[currentIndex];
    newWordInput.value = currentWord.word;
    newDefinitionInput.value = currentWord.definition;

    // Tìm chỉ số của từ hiện tại trong mảng `words` gốc
    editingWordOriginalIndex = words.findIndex(w => w.word === currentWord.word && w.definition === currentWord.definition);

    if (editingWordOriginalIndex === -1) {
        showToast('Không thể tìm thấy từ để chỉnh sửa. Vui lòng thử lại.', 'error');
        resetEditMode(); // Reset input và mode
        return;
    }

    // Chuyển nút Add thành Save Changes
    addEditWordBtn.textContent = 'Save Changes';
    addEditWordBtn.dataset.mode = 'edit';
    newWordInput.focus(); // Tập trung vào ô nhập từ để bắt đầu chỉnh sửa
    showToast(`Đang chỉnh sửa từ "${currentWord.word}". Nhấn "Save Changes" để lưu.`, 'info', 4000);
});


// Xóa từ (sử dụng Modal tùy chỉnh)
deleteWordBtn.addEventListener('click', () => {
    if (filteredWords.length === 0) {
        showToast('Không có từ nào để xóa!', 'info');
        return;
    }

    const currentWordText = filteredWords[currentIndex].word;
    wordToDeleteSpan.textContent = currentWordText; // Hiển thị từ sẽ bị xóa
    deleteConfirmModal.classList.add('show'); // Hiển thị modal

    // Xử lý khi nhấn nút "Xóa" trong modal
    confirmDeleteBtn.onclick = () => {
        const wordToDelete = filteredWords[currentIndex].word; // Đảm bảo lấy đúng từ
        // Xóa từ khỏi mảng 'words' gốc
        const originalIndex = words.findIndex(w => w.word === wordToDelete);
        if (originalIndex > -1) {
            words.splice(originalIndex, 1);
            localStorage.setItem('words', JSON.stringify(words));
            showToast(`Đã xóa từ "${wordToDelete}" thành công!`, 'success');
            resetEditMode(); // Reset chế độ chỉnh sửa sau khi xóa
        }

        filterWords(); // Cập nhật lại danh sách sau khi xóa

        // Điều chỉnh currentIndex sau khi xóa
        if (filteredWords.length > 0) {
            currentIndex = Math.min(currentIndex, filteredWords.length - 1);
        } else {
            currentIndex = 0;
        }
        
        updateCard(currentIndex);
        deleteConfirmModal.classList.remove('show'); // Ẩn modal sau khi xóa
    };

    // Xử lý khi nhấn nút "Hủy" hoặc đóng modal
    cancelDeleteBtn.onclick = () => {
        deleteConfirmModal.classList.remove('show');
    };

    closeDeleteModalBtn.onclick = () => {
        deleteConfirmModal.classList.remove('show');
    };

    // Đóng modal khi click ra ngoài (lớp nền)
    window.onclick = (event) => {
        if (event.target === deleteConfirmModal) {
            deleteConfirmModal.classList.remove('show');
        }
    };
});

// Tìm kiếm từ
searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm === '') {
        showToast('Vui lòng nhập từ cần tìm!', 'error');
        filterWords(); // Reset về danh sách ban đầu nếu ô tìm kiếm trống
        currentIndex = 0;
        updateCard(currentIndex);
        return;
    }

    const foundIndex = filteredWords.findIndex(word =>
        word.word.toLowerCase().includes(searchTerm) ||
        word.definition.toLowerCase().includes(searchTerm)
    );

    if (foundIndex !== -1) {
        currentIndex = foundIndex;
        updateCard(currentIndex);
        showToast(`Đã tìm thấy từ "${filteredWords[currentIndex].word}"!`, 'success');
    } else {
        showToast('Không tìm thấy từ nào phù hợp.', 'info');
    }
    resetEditMode(); // Reset chế độ chỉnh sửa khi tìm kiếm
});

// Xử lý Enter trong input
newWordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        newDefinitionInput.focus();
    }
});

newDefinitionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addEditWordBtn.click(); // Kích hoạt nút Add/Save
    }
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchBtn.click(); // Kích hoạt nút Search
    }
});

// Toggle Ngôi sao cho từ hiện tại
starButton.addEventListener('click', () => {
    if (filteredWords.length > 0) {
        const currentWord = filteredWords[currentIndex];
        currentWord.starred = !currentWord.starred;
        // Cập nhật từ trong mảng 'words' gốc cũng, không chỉ filteredWords
        const originalIndex = words.findIndex(w => w.word === currentWord.word && w.definition === currentWord.definition);
        if (originalIndex > -1) {
             words[originalIndex].starred = currentWord.starred;
        }
        localStorage.setItem('words', JSON.stringify(words)); // Cập nhật toàn bộ danh sách từ
        updateCard(currentIndex); // Cập nhật lại thẻ để hiển thị trạng thái sao
        showToast(`Từ "${currentWord.word}" đã ${currentWord.starred ? 'được gắn sao' : 'bỏ gắn sao'}.`, 'info');
    }
});

// Toggle lọc từ đã gắn sao (star-toggle)
starToggle.addEventListener('click', () => {
    // Tắt các toggle lọc khác để tránh xung đột
    learnToggle.dataset.state = "0";
    learnToggleStatus.textContent = "Off";

    const currentState = parseInt(starToggle.dataset.state);
    starToggle.dataset.state = (currentState === 0 ? "1" : "0").toString();
    starToggleStatus.textContent = (currentState === 0 ? "On" : "Off");
    localStorage.setItem('starToggleState', starToggle.dataset.state); // Lưu trạng thái
    filterWords(); // Lọc lại từ
    currentIndex = 0; // Reset về từ đầu tiên của danh sách đã lọc
    updateCard(currentIndex);
    resetEditMode(); // Reset chế độ chỉnh sửa khi lọc
    showToast(`Chế độ "Từ đã gắn sao" đã ${starToggle.dataset.state === "1" ? 'BẬT' : 'TẮT'}.`, 'info');
});

// Chuyển đổi trạng thái "Ôn tập" (learn-toggle) - Đảm bảo chỉ 1 chế độ lọc hoạt động
learnToggle.addEventListener('click', () => {
    // Tắt các toggle lọc khác để tránh xung đột
    starToggle.dataset.state = "0";
    starToggleStatus.textContent = "Off";

    const currentState = parseInt(learnToggle.dataset.state);
    learnToggle.dataset.state = (currentState === 0 ? "1" : "0").toString();
    learnToggleStatus.textContent = (currentState === 0 ? "On" : "Off");
    localStorage.setItem('learnToggleState', learnToggle.dataset.state); // Lưu trạng thái
    filterWords(); // Lọc lại từ
    currentIndex = 0; // Reset về từ đầu tiên của danh sách đã lọc
    updateCard(currentIndex);
    resetEditMode(); // Reset chế độ chỉnh sửa khi lọc
    showToast(`Chế độ "Ôn tập" đã ${learnToggle.dataset.state === "1" ? 'BẬT' : 'TẮT'}.`, 'info');
});


// Toggle Chủ đề sáng/tối
themeToggle.addEventListener('click', () => {
    const currentState = parseInt(themeToggle.dataset.state);
    themeToggle.dataset.state = (currentState === 0 ? "1" : "0").toString();
    document.body.dataset.theme = (themeToggle.dataset.state === "1" ? "dark" : "light");
    themeToggleStatus.textContent = (themeToggle.dataset.state === "1" ? "Dark" : "Light");
    localStorage.setItem('themeState', themeToggle.dataset.state); // Lưu trạng thái
});

// Xử lý tải lên file DOCX
uploadBtn.addEventListener('click', () => {
    const file = uploadFile.files[0];
    if (!file) {
        showToast('Vui lòng chọn một file .docx!', 'error');
        return;
    }

    showToast('Đang xử lý file...', 'info', 5000); // Hiển thị thông báo đang xử lý

    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(function(result) {
                const text = result.value;
                const messages = result.messages; // Lấy các thông báo/cảnh báo từ mammoth

                if (messages.length > 0) {
                    console.warn("Mammoth messages:", messages); // In ra console để debug
                    // showToast("Có cảnh báo khi đọc file. Kiểm tra console.", "warning");
                }

                const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
                const newWordsFromFile = [];
                let currentWordObject = null;

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (!currentWordObject) {
                        currentWordObject = { word: line, definition: "", starred: false };
                    } else {
                        currentWordObject.definition = line;
                        newWordsFromFile.push(currentWordObject);
                        currentWordObject = null;
                        // Bỏ qua dòng trống tiếp theo (nếu có)
                        if (i + 1 < lines.length && !lines[i + 1].trim()) {
                            i++;
                        }
                    }
                }

                let addedCount = 0;
                let duplicateCount = 0;
                let skippedCount = 0;

                // Xử lý từ mới từ file, kiểm tra trùng lặp và thêm vào danh sách chính
                newWordsFromFile.forEach(newWord => {
                    if (newWord.word && newWord.definition) {
                        const isDuplicate = words.some(w => 
                            w.word.toLowerCase() === newWord.word.toLowerCase() && 
                            w.definition.toLowerCase() === newWord.definition.toLowerCase()
                        );
                        
                        if (isDuplicate) {
                            duplicateCount++;
                        } else {
                            words.push(newWord);
                            addedCount++;
                        }
                    } else {
                        skippedCount++; // Bỏ qua từ thiếu thông tin
                    }
                });


                if (addedCount > 0 || duplicateCount > 0 || skippedCount > 0) {
                    localStorage.setItem('words', JSON.stringify(words));
                    filterWords(); // Áp dụng lại bộ lọc nếu có
                    currentIndex = 0; // Reset về từ đầu tiên
                    updateCard(currentIndex);
                    resetEditMode(); // Reset chế độ chỉnh sửa

                    let msg = `Hoàn thành tải file: Đã thêm ${addedCount} từ.`;
                    if (duplicateCount > 0) {
                        msg += ` ${duplicateCount} từ đã tồn tại (đã bỏ qua).`;
                    }
                    if (skippedCount > 0) {
                        msg += ` ${skippedCount} từ bị bỏ qua (thiếu thông tin).`;
                    }
                    showToast(msg, 'success', 6000);
                } else {
                    showToast('Không có từ mới nào được tìm thấy hoặc tất cả đều lỗi.', 'error', 5000);
                }
                uploadFile.value = ''; // Xóa tên file trên input
            })
            .done();
    };
    reader.readAsArrayBuffer(file);
});


// --- Khởi tạo ứng dụng ---
// Hàm khởi tạo chính
function initializeApp() {
    // Khởi tạo trạng thái toggle từ localStorage khi tải trang
    const savedLearnToggleState = localStorage.getItem('learnToggleState') || "0";
    learnToggle.dataset.state = savedLearnToggleState;
    learnToggleStatus.textContent = (savedLearnToggleState === "1" ? "On" : "Off");

    const savedStarToggleState = localStorage.getItem('starToggleState') || "0";
    starToggle.dataset.state = savedStarToggleState;
    starToggleStatus.textContent = (savedStarToggleState === "1" ? "On" : "Off");

    const savedThemeState = localStorage.getItem('themeState') || "0"; // Mặc định là light
    themeToggle.dataset.state = savedThemeState;
    document.body.dataset.theme = (savedThemeState === "1" ? "dark" : "light");
    themeToggleStatus.textContent = (savedThemeState === "1" ? "Dark" : "Light");

    // Áp dụng bộ lọc ban đầu và hiển thị thẻ
    filterWords();
    updateCard(currentIndex);
}

// Gọi hàm khởi tạo khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', initializeApp);