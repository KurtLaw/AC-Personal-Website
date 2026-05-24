(function () {
    const API_BASE = "https://spotify-now-playing-alpha-rose.vercel.app";
    const esc = (value) => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    const $ = (id) => document.getElementById(id);
    let currentTopType = "top-artists";

    async function request(type, params = {}) {
        const url = new URL(`${API_BASE}/api/spotify`);
        url.searchParams.set("type", type);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
        });
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        return res.json();
    }

    function showModal({ title, subtitle, image, link, kicker, meta = [] }) {
        $("detail-modal-kicker").textContent = kicker || "SPOTIFY";
        $("detail-modal-title").textContent = title || "未命名";
        $("detail-modal-subtitle").textContent = subtitle || "";
        $("detail-modal-img").src = image || "";
        $("detail-modal-link").href = link || "#";
        $("detail-modal-meta").innerHTML = meta.map((item) => `<div class="rounded-ac-md border border-ac-border bg-ac-cream px-3 py-2">${item}</div>`).join("");
        const modal = $("detail-modal");
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function hideModal() {
        const modal = $("detail-modal");
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function artistCard(item, index) {
        const image = item.image || item.avatar || "";
        return `
            <button type="button" data-artist-id="${esc(item.id)}" data-artist-name="${esc(item.name || "未知艺人")}" data-artist-image="${esc(image)}" data-artist-link="${esc(item.spotify || item.url || "#")}" class="group w-full overflow-hidden rounded-ac-lg border-2 border-ac-border bg-ac-cream text-left shadow-ac transition hover:-translate-y-1 hover:border-ac-primary hover:shadow-ac-hover">
                <div class="relative aspect-square overflow-hidden bg-base-100">
                    <img src="${esc(image)}" alt="${esc(item.name || "艺人")}" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                    <div class="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">#${index + 1}</div>
                </div>
                <div class="space-y-1 px-3 py-2.5">
                    <p class="line-clamp-1 text-sm font-semibold text-ac-text-dark">${esc(item.name || "未知艺人")}</p>
                </div>
            </button>`;
    }

    function trackCard(item, index) {
        return `
            <button type="button" data-track-id="${esc(item.id)}" data-track-url="${esc(item.url || "#")}" data-track-title="${esc(item.title || "未知歌曲")}" data-track-artist="${esc(item.artist || "未知艺人")}" data-track-cover="${esc(item.cover || "")}" class="group overflow-hidden rounded-ac-lg border-2 border-ac-border bg-ac-cream text-left shadow-ac transition hover:-translate-y-1 hover:border-ac-primary hover:shadow-ac-hover">
                <div class="relative aspect-square overflow-hidden bg-base-100">
                    <img src="${esc(item.cover || "")}" alt="${esc(item.title || "歌曲")}" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                    <div class="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">#${index + 1}</div>
                </div>
                <div class="space-y-1 px-3 py-2.5">
                    <p class="line-clamp-1 text-sm font-semibold text-ac-text-dark">${esc(item.title || "未知歌曲")}</p>
                    <p class="line-clamp-1 text-xs text-ac-text-light">${esc(item.artist || "未知艺人")}</p>
                </div>
            </button>`;
    }

    async function loadProfile() {
        const data = await request("me");
        $("user-name").textContent = data.name || "未知用户";
        $("user-profile-link").href = data.profile || "#";
        if (data.avatar) {
            $("user-avatar").src = data.avatar;
            $("user-avatar").classList.remove("hidden");
        }
    }

    async function loadNowPlaying() {
        const data = await request("now-playing");
        const badge = $("now-playing-status");
        const box = $("now-playing");
        if (!data || data.isPlaying === false) {
            badge.textContent = "未播放";
            badge.className = "rounded-full bg-ac-cream px-4 py-1.5 text-sm font-bold text-ac-text-light";
            box.innerHTML = `<div class="py-6 text-center text-sm text-ac-text-light">当前没有正在播放的歌曲</div>`;
            return;
        }
        badge.textContent = "播放中";
        badge.className = "rounded-full bg-[#1DB954]/10 px-5 py-2 text-lg font-extrabold text-[#1DB954]";
        box.innerHTML = `
            <div class="flex flex-col gap-4 md:flex-row md:items-stretch">
                <div class="md:w-1/3 md:min-w-[220px] md:max-w-[33.333%]">
                    <img src="${esc(data.albumImage || "")}" alt="${esc(data.album || "专辑封面")}" class="h-44 w-full rounded-ac-lg border-2 border-ac-border object-cover shadow-ac md:h-full md:min-h-[220px]" />
                </div>
                <div class="flex-1 text-left">
                    <div class="mb-4 flex flex-wrap items-center gap-2 text-xs text-ac-text-light">
                        <span class="rounded-full bg-ac-cream px-2.5 py-1 font-bold text-ac-text-dark">设备：${esc(data.device || "ALAIR")}</span>
                        <span class="rounded-full bg-ac-cream px-2.5 py-1 font-bold text-ac-text-dark">进度：${esc(data.progress || "-")}</span>
                    </div>
                    <div class="space-y-2">
                        <p class="text-xs font-bold tracking-[0.22em] text-ac-primary-dark">歌名</p>
                        <h3 class="text-2xl font-bold leading-snug text-ac-text-dark md:text-3xl">${esc(data.title || "未知歌曲")}</h3>
                    </div>
                    <div class="mt-4 space-y-2">
                        <p class="text-xs font-bold tracking-[0.22em] text-ac-primary-dark">艺人</p>
                        <p class="text-base font-semibold leading-7 text-ac-text-light">${esc(data.artist || "未知艺人")}</p>
                    </div>
                    <div class="mt-4 space-y-2">
                        <p class="text-xs font-bold tracking-[0.22em] text-ac-primary-dark">专辑</p>
                        <p class="text-sm leading-6 text-ac-text-light">${esc(data.album || "未知专辑")}</p>
                    </div>
                    <div class="mt-5 flex flex-wrap items-center gap-3">
                        <a href="${esc(data.songUrl || "#")}" target="_blank" class="rounded-ac-md border-2 border-ac-primary bg-ac-primary/10 px-4 py-2 text-sm font-bold text-ac-primary-dark transition hover:bg-ac-primary/20">打开歌曲</a>
                    </div>
                </div>
            </div>`;
    }

    async function loadTop() {
        const grid = $("top-grid");
        grid.innerHTML = `<div class="col-span-full py-8 text-center text-sm text-ac-text-light">加载中...</div>`;
        const data = await request(currentTopType);
        if (!Array.isArray(data) || data.length === 0) {
            grid.innerHTML = `<div class="col-span-full py-8 text-center text-sm text-ac-text-light">暂无数据</div>`;
            return;
        }
        grid.innerHTML = currentTopType === "top-tracks"
            ? data.map((item, index) => trackCard(item, index)).join("")
            : data.map((item, index) => artistCard(item, index)).join("");
    }

    async function loadFollowing() {
        const grid = $("following-grid");
        grid.innerHTML = `<div class="col-span-full py-8 text-center text-sm text-ac-text-light">加载中...</div>`;
        const data = await request("following");
        if (!Array.isArray(data) || data.length === 0) {
            grid.innerHTML = `<div class="col-span-full py-8 text-center text-sm text-ac-text-light">暂无关注艺人</div>`;
            return;
        }
        grid.innerHTML = data.map((item, index) => artistCard(item, index)).join("");
    }

    function bindEvents() {
        document.querySelectorAll(".top-tab").forEach((btn) => {
            btn.addEventListener("click", () => {
                currentTopType = btn.dataset.topType;
                document.querySelectorAll(".top-tab").forEach((b) => {
                    b.className = "top-tab rounded-ac-md border-2 border-ac-border bg-ac-cream px-3 py-1.5 text-xs font-bold text-ac-text-light";
                });
                btn.className = "top-tab rounded-ac-md border-2 border-ac-primary bg-ac-primary/10 px-3 py-1.5 text-xs font-bold text-ac-primary-dark";
                loadTop();
            });
        });

        $("detail-modal-backdrop").addEventListener("click", hideModal);
        $("detail-modal-close").addEventListener("click", hideModal);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") hideModal();
        });

        document.addEventListener("click", (e) => {
            const artistBtn = e.target.closest("[data-artist-id]");
            if (artistBtn) {
                request("artist", { id: artistBtn.dataset.artistId }).then((artist) => {
                    showModal({
                        title: artist.name || artistBtn.dataset.artistName || "未知艺人",
                        subtitle: "艺人详情",
                        image: artist.image || artistBtn.dataset.artistImage || "",
                        link: artist.spotify || artistBtn.dataset.artistLink || "#",
                        kicker: "ARTIST",
                        meta: [
                            `<div class="text-xs text-ac-text-light">名称</div><div class="mt-1 font-semibold text-ac-text-dark">${esc(artist.name || artistBtn.dataset.artistName || "未知艺人")}</div>`,
                            `<div class="text-xs text-ac-text-light">链接</div><div class="mt-1 truncate font-semibold text-ac-text-dark">${esc(artist.spotify || artistBtn.dataset.artistLink || "")}</div>`
                        ]
                    });
                }).catch(() => {});
                return;
            }

            const trackBtn = e.target.closest("[data-track-id]");
            if (trackBtn) {
                showModal({
                    title: trackBtn.dataset.trackTitle || "未知歌曲",
                    subtitle: trackBtn.dataset.trackArtist || "未知艺人",
                    image: trackBtn.dataset.trackCover || "",
                    link: trackBtn.dataset.trackUrl || "#",
                    kicker: "TRACK",
                    meta: [
                        `<div class="text-xs text-ac-text-light">歌曲</div><div class="mt-1 font-semibold text-ac-text-dark">${esc(trackBtn.dataset.trackTitle || "未知歌曲")}</div>`,
                        `<div class="text-xs text-ac-text-light">艺人</div><div class="mt-1 font-semibold text-ac-text-dark">${esc(trackBtn.dataset.trackArtist || "未知艺人")}</div>`,
                        `<div class="text-xs text-ac-text-light">跳转</div><div class="mt-1 truncate font-semibold text-ac-text-dark">${esc(trackBtn.dataset.trackUrl || "")}</div>`
                    ]
                });
            }
        });
    }

    async function init() {
        bindEvents();
        try {
            await Promise.all([loadProfile(), loadNowPlaying(), loadTop(), loadFollowing()]);
        } catch (err) {
            console.error(err);
        }
    }

    init();
})();
