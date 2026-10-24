// ── Shared scripts for yesd3v.github.io ─────────────────────────────

// Custom scrollbar (native one is hidden in site.css)
(function () {
    var bar   = document.getElementById("custom-scrollbar");
    var thumb = document.getElementById("custom-scrollbar-thumb");
    if (!bar || !thumb) return;

    var scrollingTimer = null;

    function updateThumb() {
        var scrollTop    = window.scrollY || document.documentElement.scrollTop;
        var scrollHeight = document.documentElement.scrollHeight;
        var clientHeight = document.documentElement.clientHeight;
        var trackHeight  = bar.offsetHeight;

        if (scrollHeight <= clientHeight) {
            bar.style.display = "none";
            return;
        }

        bar.style.display = "";

        var thumbHeight = Math.max(28, (clientHeight / scrollHeight) * trackHeight);
        var maxTop      = trackHeight - thumbHeight;
        var thumbTop    = (scrollTop / (scrollHeight - clientHeight)) * maxTop;

        thumb.style.height = thumbHeight + "px";
        thumb.style.top    = thumbTop + "px";
    }

    window.addEventListener("scroll", function () {
        updateThumb();
        bar.classList.add("scrolling");
        clearTimeout(scrollingTimer);
        scrollingTimer = setTimeout(function () {
            bar.classList.remove("scrolling");
        }, 600);
    }, { passive: true });

    window.addEventListener("resize", updateThumb, { passive: true });
    window.addEventListener("load", updateThumb);
    updateThumb();
})();

// Background video: keep it still for reduced-motion users
(function () {
    var video = document.querySelector(".bg-video");
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        video.removeAttribute("autoplay");
        video.pause();
    }
})();

// Footer year
(function () {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
})();

// Download counter: sums GitHub release asset downloads matching `match`
// and reveals the #dlChip element once the number is known.
async function loadDownloadCount(apiUrl, match) {
    var chip  = document.getElementById("dlChip");
    var count = document.getElementById("dlCount");
    if (!chip || !count) return;

    try {
        const res = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const releases = Array.isArray(data) ? data : [data];

        let total = 0;
        for (const rel of releases) {
            for (const asset of (rel.assets || [])) {
                if (match(asset.name)) total += asset.download_count;
            }
        }

        count.textContent = new Intl.NumberFormat("en").format(total);
        chip.hidden = total === 0;
    } catch {
        chip.hidden = true;
    }
}
