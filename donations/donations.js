/**
 * Noxith Donation Modal System
 * Highly portable script to inject a donation modal into any page.
 */

(function() {
    // Prevent multiple injections
    if (window.NoxithDonations) return;

    const CSS = `
        .nox-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            font-family: 'DM Sans', sans-serif;
        }
        .nox-modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }
        .nox-modal-box {
            background: #111;
            border: 1px solid #222;
            border-radius: 16px;
            width: 100%;
            max-width: 400px;
            padding: 32px;
            transform: translateY(20px);
            transition: transform 0.3s ease;
            color: #f0f0f0;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .nox-modal-overlay.active .nox-modal-box {
            transform: translateY(0);
        }
        .nox-modal-title {
            font-family: 'Syne', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 8px;
            text-align: center;
        }
        .nox-modal-sub {
            font-size: 0.88rem;
            color: #666;
            margin-bottom: 28px;
            text-align: center;
            line-height: 1.5;
        }
        .nox-donation-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
        }
        .nox-don-btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255,255,255,0.03);
            position: relative;
            overflow: hidden;
        }
        .nox-don-btn-content {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .nox-don-btn svg {
            width: 26px;
            height: 26px;
        }
        .nox-don-cashapp {
            background: linear-gradient(135deg, #00d632 0%, #00a326 100%);
            color: #000;
            box-shadow: 0 4px 15px rgba(0, 214, 50, 0.15);
        }
        .nox-don-cashapp:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 25px rgba(0, 214, 50, 0.3);
            filter: brightness(1.1);
        }
        .nox-don-paypal {
            background: rgba(255, 255, 255, 0.03);
            color: #555;
            border: 1px solid #222;
            cursor: not-allowed;
            pointer-events: none;
            filter: grayscale(1);
            opacity: 0.6;
        }
        .nox-badge {
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 4px 8px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.05);
            font-weight: 700;
        }
        .nox-don-cashapp .nox-badge {
            background: rgba(0, 0, 0, 0.1);
            color: rgba(0, 0, 0, 0.6);
        }
        .nox-modal-close {
            margin-top: 32px;
            width: 100%;
            background: transparent;
            border: 1px solid #222;
            color: #555;
            padding: 14px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.2s;
        }
        .nox-modal-close:hover {
            border-color: #333;
            color: #888;
            background: rgba(255, 255, 255, 0.02);
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
    `;

    const HTML = `
        <div class="nox-modal-overlay" id="noxDonationModal">
            <div class="nox-modal-box">
                <h2 class="nox-modal-title">Support Noxith</h2>
                <p class="nox-modal-sub">Thank you for your support. Every contribution allows us to dedicate more time to improving our projects and building new tools for the community.</p>
                
                <div class="nox-donation-grid">
                    <a href="https://cash.app/$noxith" target="_blank" class="nox-don-btn nox-don-cashapp">
                        <div class="nox-don-btn-content">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            <span>CashApp</span>
                        </div>
                        <span class="nox-badge">Active</span>
                    </a>
                    
                    <div class="nox-don-btn nox-don-paypal">
                        <div class="nox-don-btn-content">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .632-.54h7.49c1.97 0 3.504.425 4.562 1.265.986.782 1.488 1.93 1.488 3.41 0 1.238-.344 2.39-1.023 3.424-.658.995-1.597 1.812-2.79 2.427-1.192.615-2.58.924-4.124.924h-1.63a.641.641 0 0 0-.633.541l-.94 6.126a.641.641 0 0 1-.632.54z"/></svg>
                            <span>PayPal</span>
                        </div>
                        <span class="nox-badge">Soon</span>
                    </div>
                </div>
                
                <button class="nox-modal-close" onclick="NoxithDonations.close()">Return to site</button>
            </div>
        </div>
    `;

    function init() {
        // Inject CSS
        const styleTag = document.createElement('style');
        styleTag.textContent = CSS;
        document.head.appendChild(styleTag);

        // Inject HTML
        const container = document.createElement('div');
        container.innerHTML = HTML.trim();
        const modalElement = container.firstElementChild;
        document.body.appendChild(modalElement);

        // Close on overlay click
        modalElement.addEventListener('click', function(e) {
            if (e.target === this) window.NoxithDonations.close();
        });
    }

    // Public API
    window.NoxithDonations = {
        open: function() {
            const modal = document.getElementById('noxDonationModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },
        close: function() {
            const modal = document.getElementById('noxDonationModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
