function swapDivs() {
    const url = window.location.href;
    const idMatch = url.match(/[?&]v=([^&]+)/);
    const videoId = idMatch ? idMatch[1] : null;

    if (!videoId) {
        console.error('no YouTube id found');
        return;
    }

    const messages = ["Please sign in", "This content isn't", "This content isn’t available."];
    const boxes = document.querySelectorAll('div.h-box');

    boxes.forEach(box => {
        const hasMessage = messages.some(msg => box.textContent.includes(msg));
        
        if (hasMessage) {
            const embed = document.createElement('iframe');
            embed.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
            embed.width = '560';
            embed.height = '315';
            embed.frameBorder = '0';
            embed.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            embed.allowFullscreen = true;

            box.innerHTML = '';
            box.appendChild(embed);
        }
    });
}

swapDivs();
