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

// 获取保存弹窗容器
const saveModal = document.querySelector('.save-modal');

// 保存为已有文件
function saveFile() {
    console.log('In function \'saveFile\'');

    // 向后端发送消息，执行保存操作
    sendMessage({
        type: 'file',
        option: 'save file'
    });
}

// 保存为新的文件
function saveFileAs() {
    console.log('In function \'saveFileAs\'');

    // 显示保存弹窗
    saveModal.style.display = "block";

    // 当点击关闭按钮时，隐藏保存弹窗
    const saveModelCloseBtn = document.querySelectorAll('.close')[0];
    saveModelCloseBtn.onclick = function() {
        saveModal.style.display = "none";
    };

    // 当用户点击其他地方时，隐藏保存弹窗
    window.onclick = function(event) {
        if (event.target == saveModal) {
            saveModal.style.display = "none";
        }
    };

    // 点击保存按钮时，保存为输入的文件名
    const saveBtn = document.getElementById('saveButton');
    saveBtn.addEventListener('click', function() {
        // 获取用户 id 和文件名
        const uid = localStorage.getItem('uid');
        const fileName = document.getElementById('saveFileName').value;
        
        // 向后端发送消息，执行保存操作
        sendMessage({
            type: 'file',
            option: 'save file as',
            uid: uid,
            fileName: fileName
        });

        // 更新当前音乐文件状态
        const trackEditor = document.querySelector('.track-editor');
        trackEditor.dataset.isNew = 'false';
    });
}

export {
    saveFile,
    saveFileAs
};