// ============================================
// ETERNA CAPITAL.ID – SUPER APP FUTURISTIK
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ---------- LOADING SCREEN ----------
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    const desktopMessage = document.getElementById('desktop-message');

    // Deteksi device (mobile/desktop)
    function isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Setelah loading selesai, tampilkan konten sesuai device
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            if (isMobile()) {
                app.classList.remove('hidden');
                initApp(); // Inisialisasi fitur setelah app tampil
            } else {
                desktopMessage.classList.remove('hidden');
            }
        }, 600); // match transition
    }, 2500); // durasi loading

    // ---------- INISIALISASI FITUR (hanya jika mobile) ----------
    function initApp() {
        // Particle effect sederhana
        initParticles();

        // SPA Navigation
        const navItems = document.querySelectorAll('.nav-item');
        const views = document.querySelectorAll('.view');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetView = item.dataset.view;
                // Update active class
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                // Show target view
                views.forEach(view => {
                    view.classList.remove('active');
                    if (view.id === targetView + '-view') {
                        view.classList.add('active');
                    }
                });
            });
        });

        // ---------- AI CHAT ----------
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-chat');
        let messageHistory = [
            { role: "system", content: "Kamu adalah asisten AI Eterna Capital.id yang ramah dan membantu." },
            { role: "assistant", content: "Halo! Saya asisten AI Eterna. Ada yang bisa saya bantu?" }
        ];

        // Tampilkan pesan awal
        renderMessages();

        function renderMessages() {
            chatMessages.innerHTML = '';
            messageHistory.slice(1).forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.role === 'user' ? 'user' : 'bot'}`;
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.textContent = msg.content;
                messageDiv.appendChild(bubble);
                chatMessages.appendChild(messageDiv);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function addTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot';
            typingDiv.id = 'typing-indicator';
            typingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function removeTypingIndicator() {
            const typing = document.getElementById('typing-indicator');
            if (typing) typing.remove();
        }

        async function sendMessage() {
            const userText = chatInput.value.trim();
            if (!userText) return;

            // Tambahkan pesan user ke history dan tampilkan
            messageHistory.push({ role: 'user', content: userText });
            renderMessages();
            chatInput.value = '';

            // Tampilkan typing indicator
            addTypingIndicator();

            try {
                const response = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: messageHistory })
                });

                if (!response.ok) throw new Error('Network response error');

                const data = await response.json();
                const reply = data.reply || 'Maaf, terjadi kesalahan.';

                // Hapus typing dan tambahkan pesan bot
                removeTypingIndicator();
                messageHistory.push({ role: 'assistant', content: reply });
                renderMessages();
            } catch (error) {
                removeTypingIndicator();
                messageHistory.push({ role: 'assistant', content: '⚠️ Gagal terhubung ke server. Coba lagi.' });
                renderMessages();
                console.error('Chat error:', error);
            }
        }

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // ---------- KALKULATOR ----------
        const calcDisplay = document.getElementById('calc-display');
        let currentInput = '0';
        let operator = null;
        let previousValue = null;

        function updateDisplay(value) {
            calcDisplay.value = value;
        }

        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.textContent;

                if (btn.classList.contains('number')) {
                    if (currentInput === '0' || currentInput === '0') {
                        currentInput = action;
                    } else {
                        currentInput += action;
                    }
                    updateDisplay(currentInput);
                }
                else if (action === 'C') {
                    currentInput = '0';
                    operator = null;
                    previousValue = null;
                    updateDisplay(currentInput);
                }
                else if (action === '⌫') {
                    currentInput = currentInput.slice(0, -1) || '0';
                    updateDisplay(currentInput);
                }
                else if (action === '.' && !currentInput.includes('.')) {
                    currentInput += '.';
                    updateDisplay(currentInput);
                }
                else if (['+', '-', '×', '÷', '%'].includes(action)) {
                    if (previousValue === null) {
                        previousValue = parseFloat(currentInput);
                    } else if (operator) {
                        // Hitung sementara jika ada operator sebelumnya
                        calculate();
                    }
                    operator = action;
                    currentInput = '0';
                }
                else if (action === '=') {
                    calculate();
                    operator = null;
                }
            });
        });

        function calculate() {
            if (operator && previousValue !== null) {
                const current = parseFloat(currentInput);
                let result;
                switch (operator) {
                    case '+': result = previousValue + current; break;
                    case '-': result = previousValue - current; break;
                    case '×': result = previousValue * current; break;
                    case '÷': result = previousValue / current; break;
                    case '%': result = previousValue % current; break;
                    default: return;
                }
                currentInput = result.toString();
                previousValue = null;
                updateDisplay(currentInput);
            }
        }

        // ---------- KURS MATA UANG ----------
        const amountInput = document.getElementById('amount');
        const fromCurrency = document.getElementById('from-currency');
        const toCurrency = document.getElementById('to-currency');
        const resultInput = document.getElementById('result');
        const convertBtn = document.getElementById('convert-btn');

        async function convertCurrency() {
            const amount = parseFloat(amountInput.value) || 1;
            const from = fromCurrency.value;
            const to = toCurrency.value;

            try {
                // Gunakan API frankfurter (gratis, no key)
                const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
                if (!response.ok) throw new Error('Gagal ambil kurs');
                const data = await response.json();
                const rate = data.rates[to];
                const result = (amount * rate).toFixed(2);
                resultInput.value = result;
            } catch (error) {
                resultInput.value = 'Error';
                console.error(error);
                // Fallback ke nilai dummy jika offline
                const dummyRates = { USD: 1, IDR: 15500, EUR: 0.92, GBP: 0.78, JPY: 148, SGD: 1.35 };
                const rate = dummyRates[to] / dummyRates[from];
                resultInput.value = (amount * rate).toFixed(2);
            }
        }

        convertBtn.addEventListener('click', convertCurrency);
        // Inisialisasi pertama
        convertCurrency();

        // ---------- SIMULASI TABUNGAN ----------
        const saldoAwal = document.getElementById('saldo-awal');
        const setoranBulanan = document.getElementById('setoran-bulanan');
        const bungaTahunan = document.getElementById('bunga-tahunan');
        const waktuTahun = document.getElementById('waktu-tahun');
        const hitungBtn = document.getElementById('hitung-tabungan');
        const totalAkhirSpan = document.getElementById('total-akhir');

        function hitungTabungan() {
            const P = parseFloat(saldoAwal.value) || 0;
            const PMT = parseFloat(setoranBulanan.value) || 0;
            const rTahunan = parseFloat(bungaTahunan.value) / 100 || 0;
            const t = parseFloat(waktuTahun.value) || 0;

            const rBulanan = rTahunan / 12;
            const n = t * 12; // jumlah bulan

            // Future value saldo awal: FV = P * (1 + r)^n
            const fvPokok = P * Math.pow(1 + rBulanan, n);

            // Future value setoran bulanan (annuity due? kita asumsi akhir bulan)
            // FV = PMT * [((1+r)^n - 1) / r]
            let fvAnuitas = 0;
            if (rBulanan > 0) {
                fvAnuitas = PMT * (Math.pow(1 + rBulanan, n) - 1) / rBulanan;
            } else {
                fvAnuitas = PMT * n;
            }

            const total = fvPokok + fvAnuitas;
            totalAkhirSpan.textContent = `Rp ${total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
        }

        hitungBtn.addEventListener('click', hitungTabungan);
        hitungTabungan(); // hitung awal
    }

    // ---------- PARTICLE BACKGROUND SEDERHANA ----------
    function initParticles() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 0.2,
                    speedY: (Math.random() - 0.5) * 0.2,
                    color: `rgba(100, 150, 255, ${Math.random() * 0.5})`
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Gerakan
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
            });
            requestAnimationFrame(draw);
        }

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });

        resize();
        createParticles();
        draw();
    }
});