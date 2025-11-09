let tasks = [];
const STORAGE_KEY = 'tasks';

const form = document.querySelector('.form');
const inputTitle = form.querySelector('input[name="title"]');
const inputDescription = form.querySelector('input[name="description"]');
const tasksList = document.querySelector('.tasks__list');
const emptyText = document.querySelector('.tasks__empty');
const taskTemplate = document.getElementById('task-template');
const alert = document.querySelector('.alert');
const editWindow = document.querySelector('.edit-window');
const shareBox = document.querySelector('.share-box');

let currentTaskForSharing = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
    loadTasks()
    setupEventListeners();
    renderTasks();
}

function loadTasks() {
    const data = localStorage.getItem(STORAGE_KEY);
    tasks = data ? JSON.parse(data) : [];
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function setupEventListeners() {
    form.addEventListener('submit', handleAddTask)
}

function handleAddTask(e) {
    e.preventDefault();

    const title = inputTitle.value.trim();
    const description = inputDescription.value.trim();

    if (!title) return;

    addTask(title, description);
    form.reset();
}

function addTask(title, description) {
    const task = {
        id: Date.now().toString(),
        title,
        description,
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
}

function editTask(id, newTitle, newDescription) {
    const task = tasks.find(t => t.id === id);

    if (!task) return

    task.title = newTitle;
    task.description = newDescription;
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function renderTasks() {
    tasksList.innerHTML = '';

    if (!tasks.length) {
        emptyText.style.display = 'block';
        return;
    }

    emptyText.style.display = 'none';
    tasks.forEach(task => tasksList.append(createTaskElement(task)));
}

function createTaskElement(task) {
    const fragment = taskTemplate.content.cloneNode(true);
    const titleEl = fragment.querySelector('.text__title');
    const descEl = fragment.querySelector('.text__description');
    const deleteBtn = fragment.querySelector('.button-delete');
    const editBtn = fragment.querySelector('.button-edit');
    const shareBtn = fragment.querySelector('.button-share');
    const tools = fragment.querySelector('.task__tools');
    const content = fragment.querySelector('.task__content');

    titleEl.textContent = task.title;
    descEl.textContent = task.description;

    deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        openDeleteConfirm(task.id);
    });

    editBtn.addEventListener('click', e => {
        e.stopPropagation();
        openEditModal(task);
    });

    shareBtn.addEventListener('click', e => {
        e.stopPropagation();
        currentTaskForSharing = task;
        openShareModal();
    });

    content.addEventListener('click', () => tools.classList.toggle('hidden'));

    return fragment;
}

function openModal(modal) {
    modal.classList.remove('hidden');
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
    });
}

function closeModal(modal) {
    modal.classList.add('hidden');
}

function openDeleteConfirm(id) {
    openModal(alert);

    const confirm = alert.querySelector('.button-confirm');
    const cancel = alert.querySelector('.button-cancel');

    confirm.replaceWith(confirm.cloneNode(true));
    cancel.replaceWith(cancel.cloneNode(true));

    const newConfirm = alert.querySelector('.button-confirm');
    const newCancel = alert.querySelector('.button-cancel');

    newConfirm.addEventListener('click', () => {
        deleteTask(id);
        closeModal(alert);
    });
    newCancel.addEventListener('click', () => closeModal(alert));
}

function openEditModal(task) {
    openModal(editWindow);

    const titleInput = editWindow.querySelector('input[name="new-title"]');
    const descriptionInput = editWindow.querySelector('textarea[name="new-description"]');
    const saveBtn = editWindow.querySelector('.button-confirm');
    const cancelBtn = editWindow.querySelector('.button-cancel');

    titleInput.value = task.title;
    descriptionInput.value = task.description;

    saveBtn.replaceWith(saveBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));

    const newSave = editWindow.querySelector('.button-confirm');
    const newCancel = editWindow.querySelector('.button-cancel');

    newSave.addEventListener('click', () => {
        editTask(task.id, titleInput.value.trim(), descriptionInput.value.trim());
        closeModal(editWindow);
    });

    newCancel.addEventListener('click', () => closeModal(editWindow));
}

function openShareModal() {
    openModal(shareBox);
    setupShareButtons();
}

function setupShareButtons() {
    const copyBtn = shareBox.querySelector('.button-copy');
    const vkBtn = shareBox.querySelector('.button-vk');
    const telegramBtn = shareBox.querySelector('.button-telegram');
    const whatsappBtn = shareBox.querySelector('.button-whatsapp');
    const facebookBtn = shareBox.querySelector('.button-facebook');

    copyBtn.replaceWith(copyBtn.cloneNode(true));
    vkBtn.replaceWith(vkBtn.cloneNode(true));
    telegramBtn.replaceWith(telegramBtn.cloneNode(true));
    whatsappBtn.replaceWith(whatsappBtn.cloneNode(true));
    facebookBtn.replaceWith(facebookBtn.cloneNode(true));

    const newCopyBtn = shareBox.querySelector('.button-copy');
    const newVkBtn = shareBox.querySelector('.button-vk');
    const newTelegramBtn = shareBox.querySelector('.button-telegram');
    const newWhatsappBtn = shareBox.querySelector('.button-whatsapp');
    const newFacebookBtn = shareBox.querySelector('.button-facebook');

    newCopyBtn.addEventListener('click', handleCopyTask);
    newVkBtn.addEventListener('click', handleShareToVK);
    newTelegramBtn.addEventListener('click', handleShareToTelegram);
    newWhatsappBtn.addEventListener('click', handleShareToWhatsApp);
    newFacebookBtn.addEventListener('click', handleShareToFacebook);
}

function handleCopyTask() {
    if (!currentTaskForSharing) return;

    const taskText = formatTaskText(currentTaskForSharing);

    navigator.clipboard.writeText(taskText)
        .then(() => {
            showNotification('The task was copied');
            closeModal(shareBox);
        })
        .catch(err => {
            console.error('Error', err);
        });
}

function handleShareToVK() {
    if (!currentTaskForSharing) return;

    const taskText = formatTaskText(currentTaskForSharing);
    const url = `https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(currentTaskForSharing.title)}&description=${encodeURIComponent(taskText)}`;

    window.open(url, '_blank', 'width=auto,height=auto');
    closeModal(shareBox);
}

function handleShareToTelegram() {
    if (!currentTaskForSharing) return;

    const taskText = formatTaskText(currentTaskForSharing);
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(taskText)}`;

    window.open(url, '_blank', 'width=auto,height=auto');
    closeModal(shareBox);
}

function handleShareToWhatsApp() {
    if (!currentTaskForSharing) return;

    const taskText = formatTaskText(currentTaskForSharing);
    const url = `https://wa.me/?text=${encodeURIComponent(taskText + '\n\n' + window.location.href)}`;

    window.open(url, '_blank');
    closeModal(shareBox);
}

function handleShareToFacebook() {
    if (!currentTaskForSharing) return;

    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(formatTaskText(currentTaskForSharing))}`;

    window.open(url, '_blank', 'width=auto,height=auto');
    closeModal(shareBox);
}

function formatTaskText(task) {
    let text = `Task ${task.title}`;
    if (task.description && task.description.trim() !== '') {
        text += `\nDescription ${task.description}`;
    }
    return text;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1B1A17;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-family: Roboto, sans-serif;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}