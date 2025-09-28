document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    // ข้อมูลอุปกรณ์ทั้งหมด
    const initialEquipmentData = [
        { id: 1, name: 'ฟุตบอล', total: 10, available: 10, image: 'https://thanatip04.github.io/sport-lending/images/football.jpg' },
        { id: 2, name: 'ฟุตซอล', total: 8, available: 8, image: 'https://thanatip04.github.io/sport-lending/images/futsal.jpg' },
        { id: 3, name: 'บาสเกตบอล', total: 5, available: 5, image: 'https://thanatip04.github.io/sport-lending/images/basketball.jpg' },
        { id: 4, name: 'วอลเลย์บอล', total: 7, available: 7, image: 'https://thanatip04.github.io/sport-lending/images/volleyball.jpg' },
        { id: 5, name: 'ตะกร้อ', total: 12, available: 12, image: 'https://thanatip04.github.io/sport-lending/images/takraw.jpg' },
        { id: 6, name: 'แบดมินตัน', total: 15, available: 15, image: 'https://thanatip04.github.io/sport-lending/images/badminton.jpg' },
        { id: 7, name: 'ปิงปอง', total: 10, available: 10, image: 'https://thanatip04.github.io/sport-lending/images/pingpong.jpg' }
    ];

    // โหลดข้อมูลจาก Local Storage หรือใช้ข้อมูลเริ่มต้น
    let equipmentData = JSON.parse(localStorage.getItem('equipmentData')) || initialEquipmentData;
    let historyLog = JSON.parse(localStorage.getItem('historyLog')) || [];


    // --- DOM ELEMENTS ---
    const equipmentListContainer = document.getElementById('equipment-list');
    const historyTableBody = document.querySelector('#history-table tbody');
    const noHistoryMessage = document.getElementById('no-history-message');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const modal = document.getElementById('borrow-modal');
    const closeModalButton = document.querySelector('.close-button');
    const borrowForm = document.getElementById('borrow-form');


    // --- FUNCTIONS ---

    // Function to save data to Local Storage
    function saveData() {
        localStorage.setItem('equipmentData', JSON.stringify(equipmentData));
        localStorage.setItem('historyLog', JSON.stringify(historyLog));
    }

    // Function to render (display) equipment cards
    function renderEquipmentCards() {
        equipmentListContainer.innerHTML = ''; // Clear existing cards
        equipmentData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="card-image">
                <div class="card-content">
                    <h2 class="card-title">${item.name}</h2>
                    <p class="card-quantity">
                        คงเหลือ: <span class="quantity-number">${item.available}</span> / ${item.total}
                    </p>
                    <div class="card-actions">
                        <button class="btn borrow-btn" data-id="${item.id}" ${item.available === 0 ? 'disabled' : ''}>
                            ยืม
                        </button>
                        <button class="btn return-btn" data-id="${item.id}">
                            คืน
                        </button>
                    </div>
                </div>
            `;
            equipmentListContainer.appendChild(card);
        });
    }

    // Function to render (display) history log
    function renderHistory() {
        historyTableBody.innerHTML = ''; // Clear existing history
        if (historyLog.length === 0) {
            noHistoryMessage.classList.remove('hidden');
        } else {
            noHistoryMessage.classList.add('hidden');
            // เรียงลำดับประวัติจากใหม่ไปเก่า
            const reversedHistory = [...historyLog].reverse();
            reversedHistory.forEach(log => {
                const row = document.createElement('tr');
                const logTypeClass = log.type === 'borrow' ? 'log-borrow' : 'log-return';
                row.innerHTML = `
                    <td>${log.itemName}</td>
                    <td class="${logTypeClass}">${log.type === 'borrow' ? 'ยืม' : 'คืน'}</td>
                    <td>${log.studentInfo || '-'}</td>
                    <td>${new Date(log.timestamp).toLocaleString('th-TH')}</td>
                `;
                historyTableBody.appendChild(row);
            });
        }
    }

    // Function to handle click events on cards
    function handleCardAction(e) {
        const target = e.target;
        const itemId = parseInt(target.dataset.id);

        if (target.classList.contains('borrow-btn')) {
            // Open modal to borrow
            const itemToBorrow = equipmentData.find(item => item.id === itemId);
            if (itemToBorrow && itemToBorrow.available > 0) {
                document.getElementById('borrow-item-id').value = itemId;
                modal.style.display = 'flex';
            }
        } else if (target.classList.contains('return-btn')) {
            // Return item
            const itemToReturn = equipmentData.find(item => item.id === itemId);
            if (itemToReturn && itemToReturn.available < itemToReturn.total) {
                itemToReturn.available++;
                addHistoryLog(itemId, 'return');
                updateUI();
            } else {
                alert('อุปกรณ์เต็มสต็อกแล้ว ไม่สามารถคืนได้');
            }
        }
    }

    // Function to add a new log to history
    function addHistoryLog(itemId, type, studentInfo = null) {
        const item = equipmentData.find(i => i.id === itemId);
        const newLog = {
            itemId: itemId,
            itemName: item.name,
            type: type, // 'borrow' or 'return'
            studentInfo: studentInfo,
            timestamp: new Date().toISOString()
        };
        historyLog.push(newLog);
    }
    
    // Function to update the entire UI
    function updateUI() {
        renderEquipmentCards();
        renderHistory();
        saveData(); // Save state after every update
    }

    // Function to handle form submission for borrowing
    function handleBorrowSubmit(e) {
        e.preventDefault();
        const itemId = parseInt(document.getElementById('borrow-item-id').value);
        const studentName = document.getElementById('student-name').value;
        const studentId = document.getElementById('student-id').value;
        const studentClass = document.getElementById('student-class').value;

        const itemToBorrow = equipmentData.find(item => item.id === itemId);

        if (itemToBorrow && itemToBorrow.available > 0) {
            itemToBorrow.available--;
            const studentInfo = `ชื่อ: ${studentName}, รหัส: ${studentId}, ห้อง: ${studentClass}`;
            addHistoryLog(itemId, 'borrow', studentInfo);
            
            // Close and reset form
            modal.style.display = 'none';
            borrowForm.reset();
            
            updateUI();
        }
    }
    
    // Function to switch between sections (Equipment / History)
    function switchSection(e) {
        e.preventDefault();
        const targetId = e.currentTarget.dataset.target;
        
        // Update content sections
        contentSections.forEach(section => {
            section.classList.toggle('active', section.id === targetId);
        });

        // Update nav link styles
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.target === targetId);
        });
    }

    // --- EVENT LISTENERS ---
    equipmentListContainer.addEventListener('click', handleCardAction);
    closeModalButton.addEventListener('click', () => modal.style.display = 'none');
    borrowForm.addEventListener('click', (e) => e.stopPropagation()); // Prevent modal from closing when clicking inside
    modal.addEventListener('click', () => modal.style.display = 'none'); // Close modal on overlay click
    borrowForm.addEventListener('submit', handleBorrowSubmit);
    navLinks.forEach(link => link.addEventListener('click', switchSection));


    // --- INITIALIZATION ---
    updateUI(); // Initial render of the page

});