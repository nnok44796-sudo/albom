// ============================================
// ПЛЕЙЛИСТ — ЗАПОЛНИ СВОИМИ ТРЕКАМИ
// ============================================
const playlist = [
    {
        title: 'Это больно...',
        artist: 'Kilometor ot zemli',
        src: 'bolno.wav'
    },
    {
        title: 'Всё нормально!',
        artist: 'Kilometor ot zemli',
        src: 'norm.wav'
    },
    {
        title: 'Название трека 3',
        artist: 'Kilometor ot zemli',
        src: 'music/track3.mp3'
    },
    {
        title: 'Название трека 4',
        artist: 'Kilometor ot zemli',
        src: 'music/track4.mp3'
    },
    {
        title: 'Название трека 5',
        artist: 'Kilometor ot zemli',
        src: 'music/track5.mp3'
    },
    {
        title: 'Название трека 6',
        artist: 'Kilometor ot zemli',
        src: 'music/track6.mp3'
    },
    {
        title: 'Название трека 7',
        artist: 'Kilometor ot zemli',
        src: 'music/track7.mp3'
    },
    {
        title: 'Название трека 8',
        artist: 'Kilometor ot zemli',
        src: 'music/track8.mp3'
    },
    {
        title: 'Название трека 9',
        artist: 'Kilometor ot zemli',
        src: 'music/track9.mp3'
    },
    {
        title: 'Название трека 10',
        artist: 'Kilometor ot zemli',
        src: 'music/track10.mp3'
    },
    {
        title: 'Название трека 11',
        artist: 'Kilometor ot zemli',
        src: 'music/track11.mp3'
    },
    {
        title: 'Название трека 12',
        artist: 'Kilometor ot zemli',
        src: 'music/track12.mp3'
    }
];
// ============================================

let currentTrackIndex = 0;
let isPlaying = false;
let isLooping = false;
let audio = new Audio();
let isDraggingProgress = false;
let isDraggingVolume = false;
let pendingProgressPercent = null;
let bubbleInterval = null;

// DOM элементы
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loopBtn = document.getElementById('loopBtn');
const progressFill = document.querySelector('.progress-fill');
const progressBar = document.getElementById('progressBar');
const progressThumb = document.getElementById('progressThumb');
const currentTimeSpan = document.querySelector('.current-time');
const durationSpan = document.querySelector('.duration');
const trackTitle = document.querySelector('.track-title');
const trackArtist = document.querySelector('.track-artist');
const volumeFill = document.querySelector('.volume-fill');
const volumeBar = document.getElementById('volumeBar');
const volumeThumb = document.getElementById('volumeThumb');
const volumeIcon = document.getElementById('volumeIcon');
const volumePercent = document.getElementById('volumePercent');
const albumArt = document.querySelector('.album-art');
const currentTrackNumSpan = document.getElementById('currentTrackNum');
const totalTracksSpan = document.getElementById('totalTracks');
const playlistSongsDiv = document.getElementById('playlistSongs');
const verticalProgressFill = document.getElementById('verticalProgressFill');
const verticalCurrentTrack = document.getElementById('verticalCurrentTrack');
const verticalTotalTracks = document.getElementById('verticalTotalTracks');
const waterBubbles = document.getElementById('waterBubbles');
const albumProgressVertical = document.getElementById('albumProgressVertical');

// Устанавливаем общее количество треков
if (totalTracksSpan) totalTracksSpan.textContent = playlist.length;
if (verticalTotalTracks) verticalTotalTracks.textContent = playlist.length;

// Функция создания пузырьков
function createBubbles() {
    if (!waterBubbles) return;

    const fillHeight = verticalProgressFill ? parseInt(verticalProgressFill.style.height) || 0 : 0;
    if (fillHeight < 10) return;

    const bubbleCount = Math.floor(fillHeight / 30) + 3;

    for (let i = 0; i < bubbleCount; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            const size = 3 + Math.random() * 6;
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.left = (20 + Math.random() * 60) + '%';
            bubble.style.bottom = '0px';
            bubble.style.animationDelay = Math.random() * 3 + 's';
            bubble.style.animationDuration = (2 + Math.random() * 3) + 's';
            waterBubbles.appendChild(bubble);

            setTimeout(() => {
                if (bubble && bubble.remove) bubble.remove();
            }, 5000);
        }, i * 300);
    }
}

// Запуск анимации пузырьков
function startBubbleAnimation() {
    if (bubbleInterval) clearInterval(bubbleInterval);
    bubbleInterval = setInterval(() => {
        if (isPlaying && verticalProgressFill) {
            const height = parseInt(verticalProgressFill.style.height) || 0;
            if (height > 10) {
                createBubbles();
            }
        }
    }, 2000);
}

// Остановка анимации пузырьков
function stopBubbleAnimation() {
    if (bubbleInterval) {
        clearInterval(bubbleInterval);
        bubbleInterval = null;
    }
}

// Обновление прогресса альбома (вертикальный бар)
function updateAlbumProgress() {
    if (verticalProgressFill) {
        const total = playlist.length;
        const current = currentTrackIndex + 1;
        let percent = (current / total) * 100;
        percent = Math.min(100, Math.max(0, percent));
        verticalProgressFill.style.height = percent + '%';

        setTimeout(() => createBubbles(), 100);
    }

    if (verticalCurrentTrack) {
        verticalCurrentTrack.textContent = currentTrackIndex + 1;
    }
}

// Отрисовка плейлиста
function renderPlaylist() {
    if (!playlistSongsDiv) return;
    playlistSongsDiv.innerHTML = '';
    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
        item.innerHTML = `
            <div class="playlist-item-number">${(index + 1).toString().padStart(2, '0')}</div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${escapeHtml(track.title)}</div>
                <div class="playlist-item-artist">${escapeHtml(track.artist)}</div>
            </div>
            <div class="playlist-item-playing">
                <i class="fas fa-volume-up"></i>
            </div>
        `;
        item.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            if (isPlaying) {
                audio.play();
                if (albumArt) albumArt.classList.add('playing');
            } else {
                togglePlayPause();
            }
            renderPlaylist();
        });
        playlistSongsDiv.appendChild(item);
    });
}

// Эскейпинг HTML
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Загрузка трека
function loadTrack(index) {
    const track = playlist[index];
    if (!track) return;

    audio.src = track.src;
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    if (currentTrackNumSpan) currentTrackNumSpan.textContent = index + 1;

    if (progressFill) progressFill.style.width = '0%';
    if (progressThumb) progressThumb.style.left = '0%';
    if (currentTimeSpan) currentTimeSpan.textContent = '0:00';
    if (durationSpan) durationSpan.textContent = '0:00';

    updateAlbumProgress();
    renderPlaylist();

    if (isPlaying) {
        audio.play().catch(e => console.log('Ошибка:', e));
    }
}

// Обновление прогресса трека
function updateProgress() {
    if (audio.duration && !isNaN(audio.duration) && !isDraggingProgress) {
        const percent = (audio.currentTime / audio.duration) * 100;
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressThumb) progressThumb.style.left = percent + '%';

        const currentMin = Math.floor(audio.currentTime / 60);
        const currentSec = Math.floor(audio.currentTime % 60);
        if (currentTimeSpan) currentTimeSpan.textContent = `${currentMin}:${currentSec.toString().padStart(2, '0')}`;
    }
}

// Обновление длительности
function updateDuration() {
    if (audio.duration && !isNaN(audio.duration)) {
        const durationMin = Math.floor(audio.duration / 60);
        const durationSec = Math.floor(audio.duration % 60);
        if (durationSpan) durationSpan.textContent = `${durationMin}:${durationSec.toString().padStart(2, '0')}`;
    }
}

// Перемотка
function applySeek() {
    if (pendingProgressPercent !== null && audio.duration && !isNaN(audio.duration)) {
        const newTime = (pendingProgressPercent / 100) * audio.duration;
        audio.currentTime = newTime;
        pendingProgressPercent = null;
    }
}

function updateProgressVisual(percent) {
    percent = Math.min(100, Math.max(0, percent));
    if (progressFill) progressFill.style.width = percent + '%';
    if (progressThumb) progressThumb.style.left = percent + '%';

    if (audio.duration && !isNaN(audio.duration)) {
        const previewTime = (percent / 100) * audio.duration;
        const previewMin = Math.floor(previewTime / 60);
        const previewSec = Math.floor(previewTime % 60);
        if (currentTimeSpan) currentTimeSpan.textContent = `${previewMin}:${previewSec.toString().padStart(2, '0')}`;
    }
}

function handleProgressClick(e) {
    if (!progressBar) return;
    const rect = progressBar.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.min(100, Math.max(0, percent));

    if (audio.duration && !isNaN(audio.duration)) {
        audio.currentTime = (percent / 100) * audio.duration;
    }
}

function startProgressDrag(e) {
    isDraggingProgress = true;
    e.preventDefault();
    if (!progressBar) return;
    const rect = progressBar.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.min(100, Math.max(0, percent));
    updateProgressVisual(percent);
    pendingProgressPercent = percent;
}

function handleProgressDrag(e) {
    if (!isDraggingProgress || !progressBar) return;
    const rect = progressBar.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.min(100, Math.max(0, percent));
    updateProgressVisual(percent);
    pendingProgressPercent = percent;
}

function endProgressDrag() {
    if (isDraggingProgress) {
        isDraggingProgress = false;
        applySeek();
    }
}

// Громкость
function setVolumePercent(percent) {
    percent = Math.min(100, Math.max(0, percent));
    const volume = percent / 100;
    audio.volume = volume;
    if (volumeFill) volumeFill.style.width = percent + '%';
    if (volumeThumb) volumeThumb.style.left = percent + '%';
    if (volumePercent) volumePercent.textContent = Math.round(percent) + '%';

    if (volumeIcon) {
        if (percent === 0) {
            volumeIcon.className = 'fas fa-volume-mute volume-icon';
        } else if (percent < 40) {
            volumeIcon.className = 'fas fa-volume-down volume-icon';
        } else {
            volumeIcon.className = 'fas fa-volume-up volume-icon';
        }
    }
}

function handleVolumeClick(e) {
    if (!volumeBar) return;
    const rect = volumeBar.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.min(100, Math.max(0, percent));
    setVolumePercent(percent);
}

function handleVolumeDrag(e) {
    if (!isDraggingVolume || !volumeBar) return;
    const rect = volumeBar.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.min(100, Math.max(0, percent));
    setVolumePercent(percent);
}

function toggleMute() {
    if (audio.volume > 0) {
        audio.dataset.prevVolume = audio.volume;
        setVolumePercent(0);
    } else {
        const prevVolume = audio.dataset.prevVolume || 0.7;
        setVolumePercent(prevVolume * 100);
    }
}

// Зацикливание
function toggleLoop() {
    isLooping = !isLooping;
    audio.loop = isLooping;
    if (loopBtn) {
        if (isLooping) {
            loopBtn.classList.add('active');
        } else {
            loopBtn.classList.remove('active');
        }
    }
}

// Воспроизведение/Пауза
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        isPlaying = false;
        if (albumArt) albumArt.classList.remove('playing');
        if (albumProgressVertical) albumProgressVertical.classList.remove('playing');
        stopBubbleAnimation();
    } else {
        audio.play().catch(e => {
            console.log('Ошибка:', e);
            alert('Не удалось воспроизвести файл. Проверь путь к треку ' + (currentTrackIndex + 1));
        });
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
        if (albumArt) albumArt.classList.add('playing');
        if (albumProgressVertical) albumProgressVertical.classList.add('playing');
        startBubbleAnimation();
    }
}

function nextTrack() {
    if (isLooping) {
        audio.currentTime = 0;
        if (isPlaying) audio.play();
        return;
    }
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        audio.play();
        if (albumArt) albumArt.classList.add('playing');
    }
}

function prevTrack() {
    if (isLooping) {
        audio.currentTime = 0;
        if (isPlaying) audio.play();
        return;
    }
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        audio.play();
        if (albumArt) albumArt.classList.add('playing');
    }
}

// События аудио
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', updateDuration);
audio.addEventListener('ended', () => {
    if (!isLooping) {
        nextTrack();
    } else {
        audio.currentTime = 0;
        audio.play();
    }
});
audio.addEventListener('play', () => {
    if (albumArt) albumArt.classList.add('playing');
});
audio.addEventListener('pause', () => {
    if (albumArt) albumArt.classList.remove('playing');
});

// Обработчики событий
if (progressBar) progressBar.addEventListener('click', handleProgressClick);
if (progressThumb) progressThumb.addEventListener('mousedown', startProgressDrag);
if (volumeBar) volumeBar.addEventListener('click', handleVolumeClick);
if (volumeThumb) volumeThumb.addEventListener('mousedown', (e) => {
    isDraggingVolume = true;
    e.preventDefault();
});
if (volumeIcon) volumeIcon.addEventListener('click', toggleMute);
if (loopBtn) loopBtn.addEventListener('click', toggleLoop);

document.addEventListener('mousemove', (e) => {
    handleProgressDrag(e);
    handleVolumeDrag(e);
});

document.addEventListener('mouseup', () => {
    endProgressDrag();
    isDraggingVolume = false;
});

if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
if (nextBtn) nextBtn.addEventListener('click', nextTrack);
if (prevBtn) prevBtn.addEventListener('click', prevTrack);

// Инициализация
renderPlaylist();
if (playlist.length > 0) {
    loadTrack(0);
}
setVolumePercent(70);
updateAlbumProgress();
// ===== УПРАВЛЕНИЕ С КЛАВИАТУРЫ =====
document.addEventListener('keydown', function(event) {
    // Пробел (код 32) - Play/Pause
    if (event.code === 'Space' || event.key === ' ' || event.keyCode === 32) {
        event.preventDefault(); // Отменяем прокрутку страницы при нажатии пробела
        togglePlayPause();
    }

    // Стрелка влево (код 37) - перемотка назад на 5 секунд
    if (event.keyCode === 37 || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (audio.duration && !isNaN(audio.duration)) {
            audio.currentTime = Math.max(0, audio.currentTime - 2);
        }
    }

    // Стрелка вправо (код 39) - перемотка вперёд на 5 секунд
    if (event.keyCode === 39 || event.key === 'ArrowRight') {
        event.preventDefault();
        if (audio.duration && !isNaN(audio.duration)) {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 2);
        }
    }
});