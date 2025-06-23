
const words = []; // Initialize empty array, will fetch from database

// Khởi tạo trạng thái đánh dấu sao từ dữ liệu API nếu cần
words.forEach(word => {
    if (word.starred === undefined) {
        word.starred = false;
    }
});

let currentIndex = 0;
let enterHandledInInput = false;
let filteredWords = words; // Danh sách từ hiển thị sau khi lọc
let topics = [];
let currentTopicId = null;

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

// Lấy danh sách chủ đề từ API
async function fetchTopics() {
    try {
        const res = await fetch("/api/topics");
        topics = await res.json();
        renderTopics();
        // Tự động chọn chủ đề đầu tiên nếu chưa chọn
        if (!currentTopicId && topics.length > 0) {
            selectTopic(topics[0].id);
        }
    } catch (err) {
        showToast("Không lấy được danh sách chủ đề!", "error");
    }
}

// Render danh sách chủ đề vào sidebar
// function renderTopics() {
//     const topicList = document.getElementById("topic-list");
//     topicList.innerHTML = "";
//     topics.forEach(topic => {
//         const btn = document.createElement("button");
//         btn.className = "sidebar-topic-item" + (topic.id === currentTopicId ? " active" : "");
//         btn.textContent = topic.name;
//         btn.onclick = () => selectTopic(topic.id);
//         topicList.appendChild(btn);
//     });
// }

function renderTopics() {
    const topicList = document.getElementById("topic-list");
    topicList.innerHTML = "";
    topics.forEach(topic => {
        // Tạo button cho mỗi chủ đề
        const btn = document.createElement("button");
        btn.className = "sidebar-topic-item" + (topic.id === currentTopicId ? " active" : "");
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "space-between";
        btn.style.width = "100%";
        btn.style.position = "relative";

        // Nội dung tên chủ đề
        const nameSpan = document.createElement("span");
        nameSpan.textContent = topic.name;
        nameSpan.style.flex = "1";
        nameSpan.style.textAlign = "left";
        nameSpan.style.overflow = "hidden";
        nameSpan.style.textOverflow = "ellipsis";
        nameSpan.style.whiteSpace = "nowrap";
        btn.appendChild(nameSpan);

        // Nút ba chấm SVG
        const menuBtn = document.createElement("button");
        menuBtn.className = "topic-menu-btn";
        menuBtn.setAttribute("aria-label", "Tùy chọn chủ đề");
        menuBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M15.498 8.50159C16.3254 8.50159 16.9959 9.17228 16.9961 9.99963C16.9961 10.8271 16.3256 11.4987 15.498 11.4987C14.6705 11.4987 14 10.8271 14 9.99963C14.0002 9.17228 14.6706 8.50159 15.498 8.50159Z"></path>
                <path d="M4.49805 8.50159C5.32544 8.50159 5.99689 9.17228 5.99707 9.99963C5.99707 10.8271 5.32555 11.4987 4.49805 11.4987C3.67069 11.4985 3 10.827 3 9.99963C3.00018 9.17239 3.6708 8.50176 4.49805 8.50159Z"></path>
                <path d="M10.0003 8.50159C10.8276 8.50176 11.4982 9.17239 11.4984 9.99963C11.4984 10.827 10.8277 11.4985 10.0003 11.4987C9.17283 11.4987 8.50131 10.8271 8.50131 9.99963C8.50149 9.17228 9.17294 8.50159 10.0003 8.50159Z"></path>
            </svg>
        `;
        menuBtn.style.display = "none"; // Ẩn mặc định

        // Sự kiện hover để hiện nút 3 chấm
        btn.addEventListener("mouseenter", () => {
            menuBtn.style.display = "inline-flex";
        });
        btn.addEventListener("mouseleave", () => {
            menuBtn.style.display = "none";
        });

        // Sự kiện click chọn chủ đề
        btn.onclick = (e) => {
            // Nếu click vào nút menu thì không chọn chủ đề
            if (e.target.closest('.topic-menu-btn')) return;
            selectTopic(topic.id);
        };

        // Menu popup và các sự kiện như cũ...
        // (giữ nguyên phần tạo menu popup, đổi tên, xóa như bạn đã làm)

        // Menu popup
        const menu = document.createElement("div");
        menu.className = "topic-menu-popup";
        menu.style.display = "none";
        menu.style.position = "absolute";
        menu.style.right = "0";
        menu.style.top = "110%";
        menu.style.background = "#fff";
        menu.style.border = "1px solid #e1e1e1";
        menu.style.borderRadius = "8px";
        menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        menu.style.zIndex = "999";
        menu.innerHTML = `
            <button class="topic-menu-item" style="padding:8px 16px;width:100%;border:none;background:none;cursor:pointer;text-align:left;">Đổi tên</button>
            <button class="topic-menu-item" style="padding:8px 16px;width:100%;border:none;background:none;cursor:pointer;text-align:left;color:#dc3545;">Xóa</button>
        `;

        menuBtn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.topic-menu-popup').forEach(m => m.style.display = "none");
            menu.style.display = menu.style.display === "block" ? "none" : "block";

            if (menu.style.display === "block") {
                // Tính toán vị trí để không đè lên sidebar-bottom-spacer
                const btnRect = menuBtn.getBoundingClientRect();
                const menuHeight = menu.offsetHeight || 80;
                const sidebar = document.querySelector('.sidebar');
                const sidebarRect = sidebar.getBoundingClientRect();
                const bottomSpacer = document.querySelector('.sidebar-bottom-spacer');
                const bottomSpacerRect = bottomSpacer
                    ? bottomSpacer.getBoundingClientRect()
                    : { top: sidebarRect.bottom };

                // Khoảng trống từ đáy nút ba chấm đến đỉnh sidebar-bottom-spacer
                const spaceBelow = bottomSpacerRect.top - btnRect.bottom;

                if (spaceBelow < menuHeight + 10) {
                    // Không đủ chỗ bên dưới, mở lên trên
                    menu.style.top = "auto";
                    menu.style.bottom = "110%";
                } else {
                    // Đủ chỗ bên dưới, mở xuống dưới
                    menu.style.bottom = "auto";
                    menu.style.top = "110%";
                }

                // Đóng menu khi click ra ngoài
                const closeMenu = (event) => {
                    if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
                        menu.style.display = "none";
                        document.removeEventListener("mousedown", closeMenu);
                    }
                };
                setTimeout(() => {
                    document.addEventListener("mousedown", closeMenu);
                }, 0);
            }
        };

        menu.children[0].onclick = async () => {
            menu.style.display = "none";
            const newName = prompt("Nhập tên mới cho chủ đề:", topic.name);
            if (newName && newName !== topic.name) {
                try {
                    const res = await fetch(`/api/topics/${topic.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: newName })
                    });
                    const data = await res.json();
                    if (data.success) {
                        await fetchTopics();
                        showToast("Đã đổi tên chủ đề!", "success");
                    } else {
                        showToast(data.message || "Lỗi khi đổi tên!", "error");
                    }
                } catch {
                    showToast("Lỗi khi đổi tên!", "error");
                }
            }
        };
        
        menu.children[1].onclick = async () => {
            menu.style.display = "none";
            if (confirm(`Bạn có chắc chắn muốn xóa chủ đề "${topic.name}"?`)) {
                try {
                    const res = await fetch(`/api/topics/${topic.id}`, {
                        method: "DELETE"
                    });
                    const data = await res.json();
                    if (data.success) {
                        await fetchTopics();
                        showToast("Đã xóa chủ đề!", "success");
                        // Nếu vừa xóa là chủ đề đang chọn, chọn chủ đề khác
                        if (topic.id === currentTopicId) {
                            if (topics.length > 0) {
                                selectTopic(topics[0].id);
                            } else {
                                currentTopicId = null;
                                // Xử lý giao diện khi không còn chủ đề nào (nếu muốn)
                            }
                        }
                    } else {
                        showToast(data.message || "Lỗi khi xóa!", "error");
                    }
                } catch {
                    showToast("Lỗi khi xóa!", "error");
                }
            }
        };

        // document.addEventListener("click", function closeMenu(e) {
        //     if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        //         menu.style.display = "none";
        //         document.removeEventListener("click", closeMenu);
        //     }
        // });

        btn.appendChild(menuBtn);
        btn.appendChild(menu);
        topicList.appendChild(btn);
    });

    document.querySelectorAll('.sidebar-topic-item').forEach(btn => {
        btn.addEventListener('click', function(event) {
            if (!requireLogin(event)) return;
        }, true);
    });
}

// Chọn chủ đề
function selectTopic(topicId) {
    currentTopicId = topicId;
    renderTopics();
    fetchWords(); // Lấy từ vựng của chủ đề này
}

// Thêm chủ đề mới
document.getElementById("add-topic-btn").onclick = async function() {
    const name = prompt("Nhập tên chủ đề mới:");
    if (!name) return;
    try {
        const res = await fetch("/api/topics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (data.success) {
            await fetchTopics();
            selectTopic(data.id);
            showToast("Đã thêm chủ đề mới!", "success");
        } else {
            showToast(data.message || "Lỗi khi thêm chủ đề!", "error");
        }
    } catch (err) {
        showToast("Lỗi khi thêm chủ đề!", "error");
    }
};

document.getElementById("sidebar-add-topic").addEventListener("click", async function() {
    const name = prompt("Nhập tên chủ đề mới:");
    if (!name) return;
    try {
        const res = await fetch("/api/topics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (data.success) {
            await fetchTopics();
            selectTopic(data.id);
            showToast("Đã thêm chủ đề mới!", "success");
        } else {
            showToast(data.message || "Lỗi khi thêm chủ đề!", "error");
        }
    } catch (err) {
        showToast("Lỗi khi thêm chủ đề!", "error");
    }
});

// // Hàm lấy danh sách từ vựng từ API
// async function fetchWords() {
//     try {
//         const response = await fetch('/api/words', {
//             method: 'GET',
//             headers: { 'Content-Type': 'application/json' },
//             credentials: 'include' // Gửi cookie để xác thực
//         });
//         if (response.ok) {
//             const data = await response.json();
//             words.length = 0; // Xóa danh sách hiện tại
//             words.push(...data); // Thêm dữ liệu từ API
//             filterWords();
//             updateCard(currentIndex);
//         } else {
//             showToast('Lỗi khi tải từ vựng!', 'error', 2000);
//         }
//     } catch (err) {
//         showToast('Lỗi kết nối đến server!', 'error', 2000);
//         console.error(err);
//     }
// }

// Sửa fetchWords để truyền topic_id
async function fetchWords() {
    if (!currentTopicId) return;
    try {
        const res = await fetch(`/api/words?topic_id=${currentTopicId}`);
        const data = await res.json();
        words.length = 0;
        data.forEach(w => words.push(w));
        filterWords();
        updateCard(currentIndex);
    } catch (err) {
        showToast("Không lấy được từ vựng!", "error");
    }
}

function showHelpModal() {
    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '1999';
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
        document.removeEventListener('keydown', preventOtherKeys);
    };

    // Đóng modal khi nhấn nút Close
    document.getElementById('close-help').addEventListener('click', closeModal);

    // Đóng modal khi nhấn Escape
    const closeOnEscape = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };
    document.addEventListener('keydown', closeOnEscape);

    // Ngăn chặn các sự kiện phím khác (trừ Escape) khi modal hiển thị
    const preventOtherKeys = (event) => {
        if (event.key !== 'Escape') {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    document.addEventListener('keydown', preventOtherKeys);

    // Ngăn chặn các sự kiện click bên ngoài modal
    overlay.addEventListener('click', (event) => {
        event.stopPropagation();
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
fetchWords(); // Lấy từ từ API ban đầu

// Sự kiện cho nút ngôi sao
starBtn.addEventListener('click', async () => {
    if (filteredWords[currentIndex]) {
        filteredWords[currentIndex].starred = !filteredWords[currentIndex].starred;
        starBtn.classList.toggle('active', filteredWords[currentIndex].starred);
        try {
            const prevWordId = filteredWords[currentIndex].id; // Lưu lại id thẻ hiện tại
            const response = await fetch(`/api/words/${filteredWords[currentIndex].id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    word: filteredWords[currentIndex].word,
                    definition: filteredWords[currentIndex].definition,
                    starred: filteredWords[currentIndex].starred
                })
            });
            if (response.ok) {
                showToast(filteredWords[currentIndex].starred ? "Đã đánh dấu từ!" : "Đã bỏ đánh dấu từ!", 'success', 1500);
                await fetchWords(); // Đồng bộ lại dữ liệu

                // Sau khi fetchWords, tìm lại vị trí thẻ cũ
                const newIndex = filteredWords.findIndex(w => w.id === prevWordId);
                if (newIndex !== -1) {
                    currentIndex = newIndex;
                } else {
                    currentIndex = 0;
                }
                updateCard(currentIndex);
            } else {
                showToast('Lỗi khi cập nhật trạng thái sao!', 'error', 2000);
                filteredWords[currentIndex].starred = !filteredWords[currentIndex].starred; // Hoàn tác
                starBtn.classList.toggle('active', filteredWords[currentIndex].starred);
            }
        } catch (err) {
            showToast('Lỗi kết nối đến server!', 'error', 2000);
            filteredWords[currentIndex].starred = !filteredWords[currentIndex].starred; // Hoàn tác
            starBtn.classList.toggle('active', filteredWords[currentIndex].starred);
            console.error(err);
        }
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

// // Thêm từ mới vào mảng khi nhấn nút
// addWordBtn.addEventListener('click', async () => {
//     const newWord = newWordInput.value.trim();
//     const newDefinition = newDefinitionInput.value.trim();
    
//     if (newWord && newDefinition) {
//         const existingWords = words.filter(w => w.word.toLowerCase() === newWord.toLowerCase());
//         if (existingWords.length > 0) {
//             const existingList = existingWords.map((w, index) => `${index + 1}. "${w.word}" - "${w.definition}"`).join('\n');
//             const confirmAdd = confirm(`Từ "${newWord}" đã tồn tại trong danh sách:\n${existingList}\nBạn có muốn thêm từ mới này không?`);
//             if (!confirmAdd) {
//                 showToast("Hủy thêm từ mới.", 'info', 1500);
//                 newWordInput.value = '';
//                 newDefinitionInput.value = '';
//                 return;
//             }
//         }
//         try {
//             const response = await fetch('/api/words', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 credentials: 'include',
//                 body: JSON.stringify({
//                     word: newWord,
//                     definition: newDefinition,
//                     starred: false
//                 })
//             });
//             if (response.ok) {
//                 const data = await response.json();
//                 if (data.success) {
//                     await fetchWords(); // Đồng bộ lại dữ liệu
//                     currentIndex = words.findIndex(w => w.id === data.id); // Chuyển đến từ mới
//                     filterWords();
//                     updateCard(currentIndex);
//                     showToast("Từ mới đã được thêm!", 'success', 1500);
//                     newWordInput.value = '';
//                     newDefinitionInput.value = '';
//                 } else {
//                     showToast(data.message || "Lỗi khi thêm từ mới!", 'error', 2000);
//                 }
//             } else {
//                 showToast('Lỗi khi thêm từ mới!', 'error', 2000);
//             }
//         } catch (err) {
//             showToast('Lỗi kết nối đến server!', 'error', 2000);
//             console.error(err);
//         }
//     } else {
//         showToast("Vui lòng nhập đầy đủ từ và nghĩa.", 'error', 1500);
//     }
// });

// Khi thêm từ mới, cần truyền topic_id
addWordBtn.addEventListener('click', async () => {
    const newWord = newWordInput.value.trim();
    const newDefinition = newDefinitionInput.value.trim();
    if (!currentTopicId) {
        showToast("Hãy chọn chủ đề!", "error");
        return;
    }
    if (newWord && newDefinition) {
        try {
            const res = await fetch("/api/words", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word: newWord, definition: newDefinition, topic_id: currentTopicId })
            });
            const data = await res.json();
            if (data.success) {
                await fetchWords();
                showToast("Từ mới đã được thêm!", "success");
                newWordInput.value = '';
                newDefinitionInput.value = '';
            } else {
                showToast(data.message || "Lỗi khi thêm từ!", "error");
            }
        } catch (err) {
            showToast("Lỗi khi thêm từ!", "error");
        }
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
async function deleteCard() {
    if (filteredWords.length > 0) {
        const wordToDelete = filteredWords[currentIndex].word;
        const definitionToDelete = filteredWords[currentIndex].definition;
        const wordId = filteredWords[currentIndex].id;

        const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa từ "${wordToDelete}: ${definitionToDelete}" không?`);

        if (confirmDelete) {
            try {
                const response = await fetch(`/api/words/${wordId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                if (response.ok) {
                    await fetchWords(); // Đồng bộ lại dữ liệu
                    if (currentIndex >= filteredWords.length) {
                        currentIndex = filteredWords.length - 1;
                    }
                    filterWords();
                    updateCard(currentIndex);
                    showToast("Từ đã được xóa!", 'success', 1500);
                } else {
                    showToast('Lỗi khi xóa từ!', 'error', 2000);
                }
            } catch (err) {
                showToast('Lỗi kết nối đến server!', 'error', 2000);
                console.error(err);
            }
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
        utterance.lang = 'en-US';
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
        wordListHTML += `<li data-index="${wordObj.id}">
            <span>${wordObj.word} - ${wordObj.definition}${wordObj.starred ? ' ⭐' : ''}</span>
            <div>
                <button class="edit-word-btn" onclick="editWord(${wordObj.id})">Sửa</button>
                <button class="delete-word-btn" onclick="deleteWord(${wordObj.id})">Xóa</button>
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
            filtered.forEach((wordObj) => {
                const li = document.createElement('li');
                li.dataset.index = wordObj.id;
                li.innerHTML = `
                    <span>${wordObj.word} - ${wordObj.definition}${wordObj.starred ? ' ⭐' : ''}</span>
                    <div>
                        <button class="edit-word-btn" onclick="editWord(${wordObj.id})">Sửa</button>
                        <button class="delete-word-btn" onclick="deleteWord(${wordObj.id})">Xóa</button>
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

async function editWord(wordId) {
    const wordObj = words.find(w => w.id === wordId);
    if (!wordObj) return;

    const newWord = prompt('Nhập từ mới:', wordObj.word);
    const newDefinition = prompt('Nhập nghĩa mới:', wordObj.definition);
    if (newWord && newDefinition) {
        try {
            const response = await fetch(`/api/words/${wordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    word: newWord,
                    definition: newDefinition,
                    starred: wordObj.starred
                })
            });
            if (response.ok) {
                await fetchWords(); // Đồng bộ lại dữ liệu
                showToast('Từ đã được chỉnh sửa!', 'success', 1500);

                // Cập nhật mục trong modal mà không tạo lại
                const modal = document.querySelector('.help-modal');
                if (modal && modal.dataset.type === 'word-list') {
                    const scrollContainer = modal.querySelector('.word-list-scroll');
                    const scrollTop = scrollContainer.scrollTop; // Lưu vị trí cuộn
                    const listItem = modal.querySelector(`li[data-index="${wordId}"]`);
                    if (listItem) {
                        listItem.querySelector('span').innerHTML = `${newWord} - ${newDefinition}${wordObj.starred ? ' ⭐' : ''}`;
                    }
                    scrollContainer.scrollTop = scrollTop; // Khôi phục vị trí cuộn
                }
            } else {
                showToast('Lỗi khi chỉnh sửa từ!', 'error', 2000);
            }
        } catch (err) {
            showToast('Lỗi kết nối đến server!', 'error', 2000);
            console.error(err);
        }
    }
}

async function deleteWord(wordId) {
    const wordObj = words.find(w => w.id === wordId);
    if (!wordObj) return;

    if (confirm(`Xóa từ "${wordObj.word}"?`)) {
        try {
            const response = await fetch(`/api/words/${wordId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (response.ok) {
                await fetchWords(); // Đồng bộ lại dữ liệu
                if (currentIndex >= filteredWords.length) {
                    currentIndex = filteredWords.length - 1;
                }
                filterWords();
                updateCard(currentIndex);
                showToast('Từ đã được xóa!', 'success', 1500);

                // Xóa mục trong modal mà không tạo lại
                const modal = document.querySelector('.help-modal');
                if (modal && modal.dataset.type === 'word-list') {
                    const scrollContainer = modal.querySelector('.word-list-scroll');
                    const scrollTop = scrollContainer.scrollTop; // Lưu vị trí cuộn
                    const listItem = modal.querySelector(`li[data-index="${wordId}"]`);
                    if (listItem) {
                        listItem.remove(); // Xóa mục <li> khỏi danh sách
                    }
                    // Cập nhật lại data-index cho các mục còn lại
                    const listItems = modal.querySelectorAll('.word-list-scroll ul li');
                    listItems.forEach((item) => {
                        const id = item.dataset.index;
                        item.querySelector('.edit-word-btn').setAttribute('onclick', `editWord(${id})`);
                        item.querySelector('.delete-word-btn').setAttribute('onclick', `deleteWord(${id})`);
                    });
                    scrollContainer.scrollTop = scrollTop; // Khôi phục vị trí cuộn
                }
            } else {
                showToast('Lỗi khi xóa từ!', 'error', 2000);
            }
        } catch (err) {
            showToast('Lỗi kết nối đến server!', 'error', 2000);
            console.error(err);
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
    themeStatus.textContent = themeState === 0 ? 'Sáng' : 'Tối';
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
// async function parseAndAddWords(text) {
//     const lines = text.trim().split('\n');
//     let newWords = [];
//     let currentWord = null;

//     for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].trim();
//         if (!line) continue; // Bỏ qua dòng trống

//         if (!currentWord) {
//             // Dòng đầu tiên là từ vựng
//             currentWord = { word: line, definition: null, starred: false };
//         } else {
//             // Dòng thứ hai là nghĩa (lưu nguyên văn)
//             currentWord.definition = line;
//             newWords.push(currentWord);
//             currentWord = null;
//             // Bỏ qua dòng trống tiếp theo (nếu có)
//             if (i + 1 < lines.length && !lines[i + 1].trim()) {
//                 i++;
//             }
//         }
//     }

//     // Kiểm tra và thêm từ mới
//     let addedCount = 0;
//     for (const newWord of newWords) {
//         if (newWord.word && newWord.definition) {
//             const existingWords = words.filter(w => w.word.toLowerCase() === newWord.word.toLowerCase());
//             if (existingWords.length > 0) {
//                 const existingList = existingWords.map((w, index) => `${index + 1}. "${w.word}" - "${w.definition}"`).join('\n');
//                 const confirmAdd = confirm(`Từ "${newWord.word}" đã tồn tại:\n${existingList}\nBạn có muốn thêm từ mới này không?`);
//                 if (!confirmAdd) continue;
//             }
//             try {
//                 const response = await fetch('/api/words', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     credentials: 'include',
//                     body: JSON.stringify({
//                         word: newWord.word,
//                         definition: newWord.definition,
//                         starred: false,
//                         topic_id: currentTopicId // <-- Thêm dòng này
//                     })
//                 });
//                 if (response.ok) {
//                     const data = await response.json();
//                     if (data.success) {
//                         addedCount++;
//                     } else {
//                         showToast(data.message || "Lỗi khi thêm từ!", 'error', 2000);
//                     }
//                 } else {
//                     showToast('Lỗi khi thêm từ!', 'error', 2000);
//                 }
//             } catch (err) {
//                 showToast('Lỗi kết nối đến server!', 'error', 2000);
//                 console.error(err);
//             }
//         }
//     }

//     if (addedCount > 0) {
//         await fetchWords(); // Đồng bộ lại dữ liệu
//         filterWords();
//         updateCard(currentIndex);
//         showToast(`Đã thêm ${addedCount} từ mới từ file!`, 'success', 2000);
//     } else {
//         showToast("Không tìm thấy từ vựng hợp lệ trong file!", 'error', 2000);
//     }

//     // Reset input file
//     uploadFileInput.value = '';
// }

async function parseAndAddWords(text) {
    const lines = text.trim().split('\n');
    let newWords = [];
    let currentWord = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (!currentWord) {
            currentWord = { word: line, definition: null, starred: false };
        } else {
            currentWord.definition = line;
            newWords.push(currentWord);
            currentWord = null;
            if (i + 1 < lines.length && !lines[i + 1].trim()) i++;
        }
    }

    // Lọc trùng và xác nhận từng từ
    let filteredWordsToAdd = [];
    for (const newWord of newWords) {
        if (newWord.word && newWord.definition) {
            const existingWords = words.filter(w => w.word.toLowerCase() === newWord.word.toLowerCase());
            if (existingWords.length > 0) {
                const existingList = existingWords.map((w, index) => `${index + 1}. "${w.word}" - "${w.definition}"`).join('\n');
                const confirmAdd = confirm(`Từ "${newWord.word}" đã tồn tại:\n${existingList}\nBạn có muốn thêm từ mới này không?`);
                if (!confirmAdd) continue;
            }
            filteredWordsToAdd.push(newWord);
        }
    }

    if (filteredWordsToAdd.length > 0 && currentTopicId) {
        try {
            const response = await fetch('/api/words/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    words: filteredWordsToAdd,
                    topic_id: currentTopicId
                })
            });
            const data = await response.json();
            if (data.success) {
                await fetchWords();
                filterWords();
                updateCard(currentIndex);
                showToast(`Đã thêm ${data.added} từ mới từ file!`, 'success', 2000);
            } else {
                showToast(data.message || "Lỗi khi thêm từ!", 'error', 2000);
            }
        } catch (err) {
            showToast('Lỗi kết nối đến server!', 'error', 2000);
            console.error(err);
        }
    } else {
        showToast("Không tìm thấy từ vựng hợp lệ trong file!", 'error', 2000);
    }

    uploadFileInput.value = '';
}

// Sự kiện cho nút tải lên
uploadBtn.addEventListener('click', handleFileUpload);

// Khi load trang, lấy danh sách chủ đề
document.addEventListener('DOMContentLoaded', function() {
    fetchTopics();
});

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('sidebar-open');

    openBtn.addEventListener('click', () => {
    sidebar.setAttribute(
        'data-state',
        sidebar.getAttribute('data-state') === 'open' ? 'closed' : 'open'
    );
    });

    // // Đóng sidebar khi nhấn Escape
    // document.addEventListener('keydown', (e) => {
    //     if (e.key === 'Escape' && sidebar.getAttribute('data-state') === 'open') {
    //     sidebar.setAttribute('data-state', 'closed');
    //     }
    // });

    // Đóng sidebar khi click ra ngoài (trên mobile)
    document.addEventListener('click', (e) => {
        if (
        sidebar.getAttribute('data-state') === 'open' &&
        window.innerWidth < 700 &&
        !sidebar.contains(e.target) &&
        !openBtn.contains(e.target)
        ) {
        sidebar.setAttribute('data-state', 'closed');
        }
    });
});

// Hàm kiểm tra trạng thái người dùng và cập nhật nút
async function updateUserMenu() {
    try {
        const response = await fetch('/api/check-auth', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await response.json();
        const userMenuBtn = document.getElementById('user-menu-btn');
        if (data.success && data.isAuthenticated) {
            // Cập nhật thông tin người dùng
            const usernameSpan = userMenuBtn.querySelector('.font-medium');
            const emailSpan = userMenuBtn.querySelector('.text-muted-foreground');

            usernameSpan.textContent = data.user.username || 'Guest';
            emailSpan.textContent = data.user.email || 'no-email@example.com';
            
            userMenuBtn.dataset.authState = 'logged-in';
            userMenuBtn.disabled = false;
        } else {
            // Người dùng chưa đăng nhập
            userMenuBtn.dataset.authState = 'logged-out';
            userMenuBtn.disabled = true;
            const usernameSpan = userMenuBtn.querySelector('.font-medium');
            const emailSpan = userMenuBtn.querySelector('.text-muted-foreground');
            usernameSpan.textContent = 'Guest';
            emailSpan.textContent = '';
        }
    } catch (err) {
        showToast('Lỗi khi lấy thông tin người dùng!', 'error', 2000);
        console.error(err);
        const userMenuBtn = document.getElementById('user-menu-btn');
        userMenuBtn.disabled = true;
        const usernameSpan = userMenuBtn.querySelector('.font-medium');
        const emailSpan = userMenuBtn.querySelector('.text-muted-foreground');
        usernameSpan.textContent = 'Guest';
        emailSpan.textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateUserMenu();
});


// Lấy các phần tử
const userMenuBtn = document.getElementById('user-menu-btn');
const userMenuPopup = document.querySelector('.user-menu-popup');
const logoutBtn = document.getElementById('logout-btn');

// Hàm hiển thị/ẩn menu
// function toggleUserMenu() {
//     const isOpen = userMenuBtn.getAttribute('data-state') === 'open';
//     userMenuBtn.setAttribute('data-state', isOpen ? 'closed' : 'open');
//     userMenuPopup.setAttribute('data-state', isOpen ? 'closed' : 'open');
//     userMenuPopup.style.display = isOpen ? 'none' : 'block';
//     // Đảm bảo menu hiển thị với opacity và transform đúng
//     if (!isOpen) {
//         userMenuPopup.style.opacity = '1';
//         userMenuPopup.style.transform = 'scale(1)';
//     }
// }

function toggleUserMenu() {
    const isOpen = userMenuBtn.getAttribute('data-state') === 'open';
    userMenuBtn.setAttribute('data-state', isOpen ? 'closed' : 'open');
    userMenuPopup.setAttribute('data-state', isOpen ? 'closed' : 'open');
    userMenuPopup.style.display = isOpen ? 'none' : 'block';

if (!isOpen) {
    // Tính toán vị trí popup
    const sidebar = document.getElementById('sidebar');
    const sidebarRect = sidebar.getBoundingClientRect();
    const btnRect = userMenuBtn.getBoundingClientRect();

    // Tạm thời hiển thị menu để lấy chiều cao thực tế
    userMenuPopup.style.display = 'block';
    userMenuPopup.style.visibility = 'hidden';
    userMenuPopup.style.top = '0px';
    userMenuPopup.style.left = '0px';

    const menuHeight = userMenuPopup.offsetHeight;

    // Đặt vị trí popup phía trên nút user-menu-btn
    userMenuPopup.style.top = (btnRect.bottom + window.scrollY - menuHeight) + 'px';
    userMenuPopup.style.left = (sidebarRect.right) + 'px';
    userMenuPopup.style.bottom = ''; // Xóa thuộc tính bottom nếu có

    userMenuPopup.style.visibility = 'visible';
    userMenuPopup.style.opacity = '1';
    userMenuPopup.style.transform = 'scale(1)';
}
}

// Đóng menu khi click ra ngoài
function closeUserMenu(event) {
    if (!userMenuPopup.contains(event.target) && !userMenuBtn.contains(event.target)) {
        userMenuBtn.setAttribute('data-state', 'closed');
        userMenuPopup.setAttribute('data-state', 'closed');
        userMenuPopup.style.display = 'none';
        document.removeEventListener('mousedown', closeUserMenu);
    }
}

// Sự kiện click vào nút user-menu-btn
userMenuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleUserMenu();
    if (userMenuPopup.style.display === 'block') {
        // Thêm sự kiện đóng menu khi click ra ngoài
        setTimeout(() => {
            document.addEventListener('mousedown', closeUserMenu);
        }, 0);
    }
});

// Cập nhật thông tin người dùng từ API
async function updateUserMenu() {
    try {
        const response = await fetch('/api/check-auth', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await response.json();
        const usernameSpan = userMenuBtn.querySelector('.font-medium');
        const emailSpan = userMenuBtn.querySelector('.text-muted-foreground');
        const menuUsernameSpan = userMenuPopup.querySelector('.font-medium');
        const menuEmailSpan = userMenuPopup.querySelector('.text-muted-foreground');
        const avatarImg = userMenuPopup.querySelector('[data-slot="avatar-image"]');

        if (data.success && data.isAuthenticated) {
            // Cập nhật thông tin người dùng
            usernameSpan.textContent = data.user.username || 'Guest';
            emailSpan.textContent = data.user.email || 'no-email@example.com';
            menuUsernameSpan.textContent = data.user.username || 'Guest';
            menuEmailSpan.textContent = data.user.email || 'no-email@example.com';
            if (data.user.avatar) {
                avatarImg.src = data.user.avatar; // Cập nhật ảnh đại diện nếu có
            }
            userMenuBtn.dataset.authState = 'logged-in';
            userMenuBtn.disabled = false;
        } else {
            // Người dùng chưa đăng nhập
            usernameSpan.textContent = 'Guest';
            emailSpan.textContent = '';
            menuUsernameSpan.textContent = 'Guest';
            menuEmailSpan.textContent = '';
            userMenuBtn.dataset.authState = 'logged-out';
            userMenuBtn.disabled = true;
        }
    } catch (err) {
        showToast('Lỗi khi lấy thông tin người dùng!', 'error', 2000);
        console.error(err);
        userMenuBtn.disabled = true;
    }
}

// Xử lý đăng xuất
logoutBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (response.ok) {
            showToast('Đã đăng xuất!', 'success', 1500);
            userMenuPopup.setAttribute('data-state', 'closed');
            userMenuPopup.style.display = 'none';
            userMenuBtn.setAttribute('data-state', 'closed');
            updateUserMenu(); // Cập nhật lại giao diện
            window.location.href = '/Login/'; // Chuyển hướng đến trang đăng nhập
        } else {
            showToast('Lỗi khi đăng xuất!', 'error', 2000);
        }
    } catch (err) {
        showToast('Lỗi kết nối đến server!', 'error', 2000);
        console.error(err);
    }
});

// Cập nhật thông tin người dùng khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    updateUserMenu();
    // Đảm bảo menu ẩn ban đầu
    userMenuPopup.style.display = 'none';
    userMenuPopup.setAttribute('data-state', 'closed');
});

// ...existing code...

// Hàm kiểm tra đăng nhập và chặn thao tác nếu chưa đăng nhập
function requireLogin(event) {
    if (userMenuBtn.dataset.authState === 'logged-out') {
        showToast('Bạn cần đăng nhập để sử dụng chức năng này!', 'error', 1500);
        setTimeout(() => {
            window.location.href = '/Login/';
        }, 1500);
        if (event) event.preventDefault();
        return false;
    }
    return true;
}

// Chặn mọi thao tác chính nếu chưa đăng nhập
// ...existing code...

function showLoginOverlay() {
    if (document.getElementById('login-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.3)';
    overlay.style.zIndex = '99999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.innerHTML = `<div style="background:#fff;padding:32px 48px;border-radius:12px;font-size:1.2rem;box-shadow:0 2px 16px #0002;">
        Bạn cần đăng nhập để sử dụng!<br>Đang chuyển về trang đăng nhập...
    </div>`;
    document.body.appendChild(overlay);
}

// Kiểm tra cả khi tải lại và khi quay lại trang (bfcache)
function checkLoginStateAndRedirect() {
    if (userMenuBtn && userMenuBtn.dataset.authState === 'logged-out') {
        showLoginOverlay();
        setTimeout(() => {
            window.location.href = '/Login/';
        }, 1200);
    }
}

// Khi tải trang lần đầu
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkLoginStateAndRedirect, 300);
});

// Khi quay lại trang từ cache (bfcache)
window.addEventListener('pageshow', function(event) {
    setTimeout(checkLoginStateAndRedirect, 100);
});

// Khi tải trang, nếu chưa đăng nhập thì chuyển hướng luôn
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (userMenuBtn.dataset.authState === 'logged-out') {
            showToast('Bạn cần đăng nhập để sử dụng!', 'error', 1500);
            setTimeout(() => {
                window.location.href = '/Login/';
            }, 1500);
        }
    }, 300); // Đợi updateUserMenu chạy xong
});


// ...existing code...

// Xử lý khi click vào "Tài khoản"
document.querySelector('a.user-menu-item[href="/account"]').addEventListener('click', async function(e) {
    // Chặn reload trang
    e.preventDefault();

    // Đóng menu nếu có
    if (typeof userMenuPopup !== "undefined" && userMenuPopup) {
        userMenuPopup.setAttribute('data-state', 'closed');
        userMenuPopup.style.display = 'none';
    }

    // Lấy thông tin user từ API
    let user = null;
    try {
        const res = await fetch('/api/check-auth', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await res.json();
        if (data.success && data.isAuthenticated) {
            user = data.user;
        }
    } catch {}
    if (!user) {
        showToast('Không lấy được thông tin tài khoản!', 'error', 2000);
        return;
    }

    // Render giao diện account vào main-content
    const mainContent = document.querySelector('.main-content');
    const tpl = document.getElementById('account-template');
    mainContent.innerHTML = tpl.innerHTML;

    // Hiển thị thông tin
    document.getElementById('account-email').textContent = user.email || '';
    document.getElementById('account-username').textContent = user.username || '';

    // Đổi mật khẩu
    const changeBtn = document.getElementById('change-password-btn');
    const form = document.getElementById('change-password-form');
    const saveBtn = document.getElementById('save-password-btn');
    const cancelBtn = document.getElementById('cancel-password-btn');
    const msg = document.getElementById('account-message');

    changeBtn.onclick = () => {
        form.style.display = 'block';
        changeBtn.style.display = 'none';
        msg.textContent = '';
    };
    cancelBtn.onclick = () => {
        form.style.display = 'none';
        changeBtn.style.display = '';
        msg.textContent = '';
    };
saveBtn.onclick = async () => {
    const oldPass = document.getElementById('old-password').value.trim();
    const newPass = document.getElementById('new-password').value.trim();
    msg.style.color = '#d00';
    msg.textContent = '';
    if (!oldPass || !newPass) {
        msg.textContent = 'Vui lòng nhập đầy đủ mật khẩu!';
        return;
    }
    if (newPass.length < 6) {
        msg.textContent = 'Mật khẩu mới phải từ 6 ký tự!';
        return;
    }
    try {
        const res = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ old_password: oldPass, password: newPass })
        });
        const data = await res.json();
        if (data.success) {
            msg.style.color = 'green';
            msg.textContent = 'Đổi mật khẩu thành công!';
            form.style.display = 'none';
            changeBtn.style.display = '';
        } else {
            msg.style.color = '#d00';
            msg.textContent = data.message || 'Lỗi đổi mật khẩu!';
        }
    } catch {
        msg.style.color = '#d00';
        msg.textContent = 'Lỗi kết nối server!';
    }
};
});

document.querySelector('a.user-menu-item[href="/changelog"]').addEventListener('click', function(e) {
    e.preventDefault();

    // Đóng menu nếu có
    if (typeof userMenuPopup !== "undefined" && userMenuPopup) {
        userMenuPopup.setAttribute('data-state', 'closed');
        userMenuPopup.style.display = 'none';
    }

    // Render giao diện changelog vào main-content
    const mainContent = document.querySelector('.main-content');
    const tpl = document.getElementById('changelog-template');
    mainContent.innerHTML = tpl.innerHTML;

    // Thêm class để áp dụng style riêng cho changelog
    mainContent.classList.add('changelog-mode');
});

    document.getElementById('print-word-btn').addEventListener('click', async function () {
        // Sử dụng docx.umd.js đã nhúng ở HTML
        const { Document, Packer, Paragraph, TextRun } = window.docx;
    
        // Tạo mảng các đoạn văn bản
        const children = [];
        words.forEach(wordObj => {
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: wordObj.word, bold: true, size: 28 })],
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: wordObj.definition, italics: true, size: 24 })],
                    spacing: { after: 300 }
                })
            );
        });
    
        // Tạo document
        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        });
    
        // Xuất file
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TuVung.docx';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        showToast('Đã tạo file từ vựng!', 'success', 1500);
    });
