let config;

fetch('config.json')
    .then(response => response.json())
    .then(data => {
        config = data;
        console.log('Load config: ', data);
    })
    .catch(error => console.error('Error loading configuration:', error));

import {
    sendMessage
} from './message.js';

import {
    fetchMusic
} from './edit_play.js';

const INIT_BEAT_NUM = 70;
const MAX_NOTE_NUM = 36;

const pianoColor = '#99ccff';
const guitarColor = '#ffcc00';
const violinColor = '#ff99ff';

const pinch = [
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
    'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
    'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6'
];

document.addEventListener("DOMContentLoaded", function() {
    console.log('In function \'DOMContentLoaded\'')
    
    // 检查是否存在认证令牌
    const authToken = localStorage.getItem('authToken');

    if (authToken) {
        // 用户已登录，可以执行相关操作，例如显示用户信息或访问受限资源
        console.log('User is logged in');
    } else {
        // 用户未登录，重定向到登录页面
        console.log('User is not logged in');
        window.location.href = '/login';
    }
});

// Initialize
function initEditPage() {
    console.log('In function \'initEditPage\'');

    const content = document.getElementById('content');

    // Create track editor
    const trackEditor = document.createElement('div');
    trackEditor.classList.add('track-editor');
    trackEditor.dataset.trackNum = String(0);
    trackEditor.dataset.beatNum = String(INIT_BEAT_NUM);
    trackEditor.dataset.noteNum = String(MAX_NOTE_NUM);
    trackEditor.dataset.isNew = 'true';
    trackEditor.dataset.instrument = 'piano'
    content.appendChild(trackEditor);

    // Create 'new track' button
    const addTrackBtn = document.createElement('div');
    addTrackBtn.classList.add('add-track-button');
    addTrackBtn.textContent = '新建音轨';
    addTrackBtn.addEventListener('click', function(event) {
        event.stopPropagation();

        // Create track container
        const beatNum = parseInt(trackEditor.dataset.beatNum, 10);
        const noteNum = parseInt(trackEditor.dataset.noteNum, 10);
        const trackContainer = createTrackContainer(beatNum, noteNum);

        // Update track ID and track number
        const id = parseInt(trackEditor.dataset.trackNum, 10)
        trackContainer.dataset.id = String(id);
        trackEditor.dataset.trackNum = String(id + 1);
        trackEditor.appendChild(trackContainer);

        console.log(`Add track, id = ${id}`);
        // Send message to backend to create a track
        sendMessage({
            type: 'edit',
            option: 'new track',
            id: id,
            beatNum: beatNum,
            noteNum: noteNum
        });

    });
    content.appendChild(addTrackBtn);

    // Create 'play all' button
    const playButton = document.createElement('div');
    playButton.classList.add('play-button');
    playButton.textContent = '播放所有音轨';

    // Add event listener for 'play all' button
    playButton.addEventListener('click', function(){
        fetchMusic();
    });
    content.appendChild(playButton);
}

function fetchOpenedMusic() {
    sendMessage({
        type: 'fetch',
        option: 'fetch opened music'
    });
}

function loadEditMusic(currMusic) {
    console.log('In function \'initEditMusic\'');

    const trackEditor = document.querySelector('.track-editor');
    if (currMusic.isNew == false){
        trackEditor.dataset.isNew = 'false';
    }

    const trackNum = currMusic.music.tracks.length;
    let beatNum = INIT_BEAT_NUM;
    let noteNum = MAX_NOTE_NUM;
    if (trackNum) {
        beatNum = currMusic.music.tracks[0].beats.length;
        noteNum = currMusic.music.tracks[0].beats[0].notes.length;
    }
    trackEditor.dataset.trackNum = String(trackNum);
    trackEditor.dataset.beatNum = String(beatNum);
    trackEditor.dataset.noteNum = String(noteNum);

    console.log(`trackNum = ${trackNum}, beatNum = ${beatNum}, noteNum = ${noteNum}`);

    for (let i = 0; i < trackNum; i++) {
        const trackContainer = createTrackContainer(beatNum, noteNum);
        trackContainer.dataset.id = String(i);
        trackEditor.appendChild(trackContainer);
        
        const track = currMusic.music.tracks[i];
        for (let j = 0; j < beatNum; j++) {
            for (let k = 0; k < noteNum; k++) {
                const note = track.beats[j].notes[k];
                const noteElement = trackContainer.querySelector('.track').querySelectorAll('.beat')[j].querySelectorAll('.note')[noteNum - 1 - k];
                switch (note.instrument) {
                    case 'none':
                        noteElement.dataset.instrument = 'none';
                        break;
                    case 'piano':
                        noteElement.dataset.instrument = 'piano';
                        noteElement.style.backgroundColor = pianoColor;
                        break;
                    case 'guitar':
                        noteElement.dataset.instrument = 'guitar';
                        noteElement.style.backgroundColor = guitarColor;
                        break;
                    case 'violin':
                        noteElement.dataset.instrument = 'violin';
                        noteElement.style.backgroundColor = violinColor;
                        break;
                    default:
                        break;
                }
            }
        }
    }
}

// Create track container
function createTrackContainer(beatNum, noteNum) {
    // Create track container
    const trackContainer = document.createElement('div');
    trackContainer.classList.add('track-container');
    trackContainer.dataset.editMode = 'false';

    // Add pinch bar
    const pinchBar = document.createElement('div');
    pinchBar.classList.add('pinch-bar');

    const corner = document.createElement('div');
    corner.classList.add('corner');
    corner.textContent = '0';
    pinchBar.appendChild(corner);

    for (let i = 0; i < noteNum; i++) {
        const pinchLabel = document.createElement('div');
        pinchLabel.classList.add('pinch-label');
        const trackEditor = document.querySelector('.track-editor');
        const noteNum = parseInt(trackEditor.dataset.noteNum);
        pinchLabel.textContent = pinch[noteNum - 1 - i];
        pinchBar.appendChild(pinchLabel);
    }

    trackContainer.appendChild(pinchBar);

    // Add track
    const track = createTrack(beatNum, noteNum);
    trackContainer.appendChild(track);

    // Add playback indicator
    const playbackIndicator = document.createElement('div');
    playbackIndicator.classList.add('playback-indicator');
    trackContainer.appendChild(playbackIndicator);

    // Add 'delete' button
    const deleteButton = document.createElement('div');
    deleteButton.classList.add('delete-button');
    deleteButton.textContent = '删除';

    deleteButton.addEventListener('click', function(event) {
        event.stopPropagation();

        const id = parseInt(trackContainer.dataset.id, 10);
        const trackEditor = trackContainer.parentNode;

        // Delete track container
        deleteTrackContainer(trackContainer);

        // Update total track number
        const trackNum = parseInt(trackEditor.dataset.trackNum, 10);
        trackEditor.dataset.trackNum = String(trackNum - 1);

        // Edit id of track containers after it
        for (let i = 0; i < trackEditor.children.length; i++) {
            const element = trackEditor.children[i];
            const elementId = parseInt(element.dataset.id, 10);
            if (element.classList.contains('track-container') && elementId > id) {
                element.dataset.id = String(elementId - 1);
            }
        }

        console.log(`Delete track, id = ${id}`)

        // 向后端发送消息，删除音轨
        sendMessage({
            type: 'edit',
            option: 'delete track',
            id: id
        });
    });

    trackContainer.appendChild(deleteButton);

    return trackContainer;
}

// 创建音轨
function createTrack(beatNum, noteNum) {
    // 创建音轨元素
    const track = document.createElement('div');
    track.classList.add('track');

    // 为这个音轨元素添加鼠标点击事件的响应函数
    track.addEventListener('click', function(event) {
        event.stopPropagation();
        const trackContainer = track.parentElement;
        toggleTrackEdit(trackContainer);
    });

    // 添加节拍
    for (let i = 0; i < beatNum; ++i) {
        // 创建节拍元素
        const beat = createBeat(i, noteNum);

        // 添加编号
        beat.dataset.id = String(i);
        track.appendChild(beat);
    }

    return track;
}

// 删除音轨容器
function deleteTrackContainer(trackContainer) {
    trackContainer.remove();
}

// 切管音轨容器状态为编辑状态
function toggleTrackEdit(trackContainer) {
    if (trackContainer.dataset.editMode == 'true') {
        return;
    }

    // Increase track height
    const track = trackContainer.querySelector('.track');
    track.style.height = '557px';

    // Increase time stamp height
    const timeStamps = track.querySelectorAll('.time-stamp');
    timeStamps.forEach(timeStamp => {
        timeStamp.style.height = '17px';
    })

    // Increase pinch bar height
    const pinchBar = trackContainer.querySelector('.pinch-bar');
    pinchBar.style.height = '557px';
    pinchBar.style.width = '20px';

    // 标记进入编辑模式
    sleep(500).then(() => {
        trackContainer.dataset.editMode = 'true';
    });

    // 添加收回按钮
    const closeButton = document.createElement('div');
    closeButton.classList.add('close-button');
    closeButton.textContent = '收回';
    closeButton.addEventListener('click', function(event) {
        event.stopPropagation();
        closeTrackEdit(trackContainer);
    }, {passive: true});
    trackContainer.appendChild(closeButton);
}

// 关闭音轨容器的编辑状态
function closeTrackEdit(trackContainer) {
    // 取消标记编辑模式
    trackContainer.dataset.editMode = 'false';

    // 降低音轨高度
    const track = trackContainer.querySelector('.track');
    if (track) {
        track.style.height = '100px';
    }

    // Decrease time stamp height
    const timeStamps = track.querySelectorAll('.time-stamp');
    timeStamps.forEach(timeStamp => {
        timeStamp.style.height = '0px';
    })

    // Decrease pinch bar height
    const pinchBar = trackContainer.querySelector('.pinch-bar');
    pinchBar.style.height = '100px';
    pinchBar.style.width = '0px';

    // 删除收回按钮
    const closeButton = trackContainer.querySelector('.close-button');
    if (closeButton) {
        closeButton.remove();
    }
}

// Create beat
function createBeat(id, noteNum) {
    // Create beat element
    const beat = document.createElement('div');
    beat.classList.add('beat');

    // Add time stamp
    const timeStamp = document.createElement('div');
    timeStamp.classList.add('time-stamp');
    timeStamp.textContent = String(id + 1);
    timeStamp.style.height = '0px';
    beat.appendChild(timeStamp);

    // Add note
    for (let i = 0; i < noteNum; ++i) {
        // 创建音符元素
        const note = createNote();

        // 添加编号
        note.dataset.id = String(noteNum - 1 - i);
        beat.appendChild(note);
    }

    return beat;
}

// 创建音符
function createNote() {
    // 创建音符元素
    const note = document.createElement('div');
    note.classList.add('note');
    note.dataset.instrument = 'none';

    // 为这个音符元素添加鼠标点击事件的响应函数
    note.addEventListener('click', function() {
        const trackContainer = note.parentElement.parentElement.parentElement;
        if (trackContainer.dataset.editMode == 'true'){
            editNote(note);
        }
    });

    // 为这个音符元素添加鼠标悬停事件的响应函数
    note.addEventListener('mouseenter', () => {
        const trackContainer = note.parentElement.parentElement.parentElement;
        if (trackContainer.dataset.editMode == 'true'){
            hoverNote(note);
        }
    });

    // 为这个音符元素添加鼠标离开事件的响应函数
    note.addEventListener('mouseleave', () => {
        const trackContainer = note.parentElement.parentElement.parentElement;
        if (trackContainer.dataset.editMode == 'true'){
            cancelHoverNote(note);
        }
    });

    return note;
}

// 鼠标在音符上悬停
function hoverNote(currNote) {
    const beat = currNote.parentElement;
    const track = beat.parentElement;
    const trackContainer = track.parentElement;
    const trackEditor = trackContainer.parentElement;

    const noteId = parseInt(currNote.dataset.id, 10);
    const noteNum = parseInt(trackEditor.dataset.noteNum, 10);

    // Add shadow effect to notes in the same column
    const notes = beat.querySelectorAll('.note');
    notes.forEach(note => {
        note.style.filter = 'brightness(95%)';
    });

    // Add shadow effect to notes in the same row
    const beats = track.querySelectorAll('.beat');
    beats.forEach(beat => {
        const notes = beat.querySelectorAll('.note');
        notes[noteNum - 1 - noteId].style.filter = 'brightness(95%)';
    })
    
    // Add shadow effect to current note
    currNote.style.filter = 'brightness(80%)';

    // Add shadow effect to corresponding time stamp
    const timeStamp = beat.querySelector('.time-stamp');
    timeStamp.style.filter = 'brightness(90%)';

    // Add shadow effect to corresponding pinch
    const pinchBar = trackContainer.querySelector('.pinch-bar');
    const pinchLabels = pinchBar.querySelectorAll('.pinch-label');
    pinchLabels[noteNum - 1 - noteId].style.filter = 'brightness(90%)';
}

// 鼠标离开音符
function cancelHoverNote(currNote) {
    const beat = currNote.parentElement;
    const track = beat.parentElement;
    const trackContainer = track.parentElement;
    const trackEditor = trackContainer.parentElement;

    const noteId = parseInt(currNote.dataset.id, 10);
    const noteNum = parseInt(trackEditor.dataset.noteNum, 10);

    // Remove shadow effect from notes in the same column
    const notes = beat.querySelectorAll('.note');
    notes.forEach(note => {
        note.style.filter = '';
    });

    // Remove shadow effect from notes in the same row
    const beats = track.querySelectorAll('.beat');
    beats.forEach(beat => {
        const notes = beat.querySelectorAll('.note');
        notes[noteNum - 1 - noteId].style.filter = '';
    })
    
    // Remove shadow effect from corresponding time stamp
    const timeStamp = beat.querySelector('.time-stamp');
    timeStamp.style.filter = '';

    // Remove shadow effect from corresponding pinch label
    const pinchBar = trackContainer.querySelector('.pinch-bar');
    const pinchLabels = pinchBar.querySelectorAll('.pinch-label');
    pinchLabels[noteNum - 1 - noteId].style.filter = '';
}

// 编辑音符
function editNote(note) {
    // 定位音符编号
    const noteId = parseInt(note.dataset.id, 10);
    const beat = note.parentNode;
    const beatId = parseInt(beat.dataset.id, 10);
    const trackContainer = beat.parentNode.parentNode;
    const trackId = parseInt(trackContainer.dataset.id, 10);

    const trackEditor = document.querySelector('.track-editor');

    if (note.dataset.instrument == trackEditor.dataset.instrument) {
        // Delete note feature
        note.dataset.instrument = 'none';
        note.style.backgroundColor = 'aliceblue';
    } else {
        // Add note feature
        note.dataset.instrument = trackEditor.dataset.instrument;

        switch (note.dataset.instrument) {
            case 'piano':
                note.style.backgroundColor = pianoColor;
                break;
            case 'guitar':
                note.style.backgroundColor = guitarColor;
                break;
            case 'violin':
                note.style.backgroundColor = violinColor;
                break;
            default:
                console.error('Unknown instrument: ', cote.dataset.instrument);
                break;
        }
    }

    // 向后端发送消息，更新音符
    sendMessage({
        type: 'edit',
        option: 'edit note',
        trackId: trackId,
        beatId: beatId,
        noteId: noteId,
        instrument: note.dataset.instrument
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {
    initEditPage,
    fetchOpenedMusic,
    loadEditMusic
}