import {
    config
} from './config.js';

// Create a new temporary music file in local storage
function newTmpMusic() {
    const tmpMusics = JSON.parse(localStorage.getItem('tmpMusics')) || {};
    const nonce = parseInt(localStorage.getItem('nonce'), 10) || 0;

    tmpMusics[nonce] = {
        fileId: null,
        uid: null,
        music: {
            tracks: []
        }
    };

    localStorage.setItem('tmpMusics', JSON.stringify(tmpMusics));
    localStorage.setItem('nonce', nonce + 1);

    return nonce;
}

// Edit a music file in local storage: adding a track
function tmpMusicNewTrack(tmpMusicId, trackId, beatNum, noteNum) {
    const tmpMusics = JSON.parse(localStorage.getItem('tmpMusics')) || {};
    const tmpMusic = tmpMusics[tmpMusicId];

    tmpMusic.music.tracks.push({ beats: [] });
    for (let i = 0; i < beatNum; i++) {
        tmpMusic.music.tracks[trackId].beats.push({ notes: [] });
        for (let j = 0; j < noteNum; j++) {
            tmpMusic.music.tracks[trackId].beats[i].notes.push({ instrument: 'none' });
        }
    }

    localStorage.setItem('tmpMusics', JSON.stringify(tmpMusics));

    console.log(`New track: tmpMusicId = ${tmpMusicId} trackId = ${trackId} beatNum = ${beatNum} noteNum = ${noteNum}`);

    console.log(tmpMusics);
}

// Save a music file in local storage to database
async function saveTmpMusicAs(tmpMusicId, uid, fileName) {
    console.log('In function \'saveTmpMusicAs\'');

    const tmpMusics = JSON.parse(localStorage.getItem('tmpMusics')) || {};
    const tmpMusic = tmpMusics[tmpMusicId];

    try {
        const music = tmpMusic.music;

        const response = await fetch(`http://${config.online ? config.onlineIP : config.offlineIP}:3333/file/saveAs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ music, uid, fileName })
        });

        const data = await response.json();
        console.log('Receiving response:', data)

        tmpMusic.fileId = data.fileId;
        tmpMusic.uid = uid;
        localStorage.setItem('tmpMusics', JSON.stringify(tmpMusics));
    } catch (error) {
        console.error('Error saving file as:', error);
    }
}

// Update a file in database
async function saveTmpMusic(tmpMusicId) {
    console.log('In function \'saveTmpMusic\'');
    
    const tmpMusics = JSON.parse(localStorage.getItem('tmpMusics')) || {};
    const tmpMusic = tmpMusics[tmpMusicId];

    try {
        const response = await fetch(`http://${config.online ? config.onlineIP : config.offlineIP}:3333/file/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tmpMusic })
        });

        const data = await response.json();
        console.log('Receiving response:', data)
    } catch (error) {
        console.error('Error saving file:', error);
    }
}

// Return a temporary music file in local storage
function getTmpMusic(tmpMusicId) {
    const tmpMusics = JSON.parse(localStorage.getItem('tmpMusics')) || {};
    const tmpMusic = tmpMusics[tmpMusicId];

    return tmpMusic;
}

// Load a music file to local storage
function loadMusicToTmp(music, fileId, uid) {
    const tmpMusics = JSON.parse(localStorage.getItem('tmpMusics')) || {};
    const nonce = parseInt(localStorage.getItem('nonce'), 10) || 0;

    tmpMusics[nonce] = {
        fileId: fileId,
        uid: uid,
        music: music
    };

    localStorage.setItem('tmpMusics', JSON.stringify(tmpMusics));
    localStorage.setItem('nonce', nonce + 1);

    return nonce;
}

// Edit a music file in local storage: editting a note
function tmpMusicEditNote(tmpMusicId, trackId, beatId, noteId, instrument) {
    const tmpMusics = JSON.parse(localStorage.getItem('tmpMusics')) || {};
    const tmpMusic = tmpMusics[tmpMusicId];

    tmpMusic.music.tracks[trackId].beats[beatId].notes[noteId].instrument = instrument;

    localStorage.setItem('tmpMusics', JSON.stringify(tmpMusics));
}

// Edit a music file in local storage: deleting a track
function tmpMusicDelTrack(tmpMusicId, trackId) {
    const tmpMusics = JSON.parse(localStorage.getItem('tmpMusics')) || {};
    const tmpMusic = tmpMusics[tmpMusicId];

    tmpMusic.music.tracks.splice(trackId, 1);

    localStorage.setItem('tmpMusics', JSON.stringify(tmpMusics));
}

// Remove a music file from local storage
function removeTmpMusic(tmpMusicId) {
    const tmpMusics = JSON.parse(localStorage.getItem('tmpMusics')) || {};

    delete tmpMusics[tmpMusicId];

    localStorage.setItem('tmpMusics', JSON.stringify(tmpMusics));
}

export {
    newTmpMusic,
    tmpMusicNewTrack,
    saveTmpMusicAs,
    saveTmpMusic,
    getTmpMusic,
    loadMusicToTmp,
    tmpMusicEditNote,
    tmpMusicDelTrack,
    removeTmpMusic
};
