        document.addEventListener('DOMContentLoaded', function() {
            const floatingContainer = document.getElementById('floatingElements');
            const elementCount = 15;
            for (let i = 0; i < elementCount; i++) {
                const element = document.createElement('div');
                element.classList.add('floating-element');
                const size = Math.random() * 40 + 10;
                const posX = Math.random() * 100;
                const delay = Math.random() * 10;
                const duration = Math.random() * 20 + 10;
                element.style.width = `${size}px`;
                element.style.height = `${size}px`;
                element.style.left = `${posX}%`;
                element.style.top = `100vh`;
                element.style.animationDuration = `${duration}s`;
                element.style.animationDelay = `${delay}s`;
                if (Math.random() > 0.5) {
                    element.style.borderRadius = '10%';
                    element.style.transform = `rotate(${Math.random() * 360}deg)`;
                }
                const colors = [
                    'rgba(0, 243, 255, 0.1)',
                    'rgba(123, 44, 191, 0.1)',
                    'rgba(255, 42, 109, 0.1)'
                ];
                element.style.background = colors[Math.floor(Math.random() * colors.length)];
                floatingContainer.appendChild(element);
            }
            const card = document.querySelector('.card');
            const header = document.querySelector('h1');
            document.addEventListener('mousemove', (e) => {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                card.style.transform = `translate(${x * 10 - 5}px, ${y * 10 - 5}px)`;
                if (Math.random() > 0.995) {
                    header.classList.add('glitch');
                    setTimeout(() => {
                        header.classList.remove('glitch');
                    }, 200);
                }
            });
        });