document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    addTaskBtn.addEventListener('click', addTask);
    taskList.addEventListener('click', handleTaskClick);

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const li = document.createElement('li');
        li.textContent = taskText;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
        taskInput.value = '';
    }

    function handleTaskClick(e) {
        if (e.target.classList.contains('delete-btn')) {
            const li = e.target.parentElement;
            taskList.removeChild(li);
        } else if (e.target.tagName === 'LI') {
            e.target.classList.toggle('completed');
        }
    }
});