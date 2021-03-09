const container = document.getElementById('container')
const modalMessage = document.getElementById('modal-message')
const modalAvatar = document.getElementById('modal-avatar')
const close = document.getElementById('close')

document.addEventListener('DOMContentLoaded', e => {
    fetch('./data.json')
        .then(res => res.json())
        .then(json =>  json.forEach(data => {
            displayPupil(data)
        }))
})

close.addEventListener('click', e => {
    modalMessage.style.display = 'none'
})

function displayPupil(data) {
    const pupil = document.createElement('div')
    pupil.classList.add('pupil-container')
    pupil.innerHTML = `
        <div class="avatar">
            <h1>${data.name}</h1>
            <div class="img-container">
                <span><i class="fas fa-chevron-left"></i></span> 
                <img class="img" src="${data.avatar}" alt="img">
                <span><i class="fas fa-chevron-right" ></i></span> 
            </div>
            <h3 class="level">Nivel ${data.stats.level}</h3>
        </div>
    `

    const tasks = document.createElement('div')
    tasks.classList.add('tasks-container')

    data.taskBlocks.forEach(taskBlock => {
        const block = document.createElement('div')
        block.classList.add('month-container')

        const sumTaskGrades = taskBlock.tasks.map(task => task.taskGrades.reduce((total, grade) => total += grade, 0))
        const sumTasksGrades = sumTaskGrades.reduce((total, grade) => total += grade, 0)

        block.innerHTML = `
            <div class="month-info">
                <i class="fas fa-clipboard-list"></i>
                <h4>${taskBlock.block}</h4>
                <h3 class="total-points">${data.stats.points += sumTasksGrades} puntos</h3>
            </div>
           
            <table class="task-table hide" id="table">
                <thead class="table-head">
                    <tr>
                        <th class="table-main"></th>
                        ${taskBlock.values.map((value, index) => (
                            `<td>${value}<br>${taskBlock.maxGrades[index]}⭐</td>`
                        )).join('')}
                        <td>Total</td>
                    </tr>
                </thead>
                <tbody>
                    ${taskBlock.tasks.map((task, index) => (
                        `
                            <tr>
                                <th class="table-task">${index + 1}ª tarea</th>
                                ${task.taskGrades.map((grade, index) => (
                                    `<td class="${index === 0 && task.handed ? 'handed' : 'nohanded'} ${index !== 0 ? 'small' : ''}">
                                        ${(taskBlock.values[index] !== 'Entregado' && task.done 
                                        ? `${Array(task.taskGrades[index]).fill().map((_, i) => `⭐`).join('')}</td>` 
                                        : (task.handed ? 'Sí' : (task.done && !task.handed) ? 'No' : ''))}`
                                )).join('')}
                                <td class=${task.taskGrades.reduce((total, grade) => total += grade, 0) === 10 ? 'handed' : ''}>${task.done ? `${task.taskGrades.reduce((total, grade) => total += grade, 0)} / 10` : ''}</td>
                            </tr>
                        `
                    )).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <th class="table-target">Objetivo</th>
                        <td colspan="4" class="table-target">Alcanzar al menos <span>${data.aim} puntos</span> en el mes</td>
                        <td class="table-total">${sumTasksGrades} / 40</td>
                    </tr>
                </tfoot>
            </table>
        `
        tasks.appendChild(block)
    })

    pupil.appendChild(tasks)
 
    const img = pupil.querySelector('.img')
    const leftArrow = pupil.querySelector('.fa-chevron-left')
    const rightArrow = pupil.querySelector('.fa-chevron-right')
    const levelDOM = pupil.querySelector('.level')
    const taskTitles = pupil.querySelectorAll('.table-task')
    
    setMessage(pupil, data)
    handleTable(tasks)
    calculateLevel(data, levelDOM)
    setModal(img, taskTitles, data, levelDOM)
    handleArrows(data, levelDOM, img, leftArrow, rightArrow)
    displayLevel(data, levelDOM, img, leftArrow, rightArrow)

    container.appendChild(pupil)
}

function handleArrows(data, levelDOM, img, leftArrow, rightArrow) {   
    leftArrow.addEventListener('click', e => {
        if (data.stats.levelsPassed + data.bonus > 1) {
            data.stats.level -= 1
            displayLevel(data, levelDOM, img, leftArrow, rightArrow)
        } 
    })
    
    rightArrow.addEventListener('click', e => {
        if (data.stats.level < data.stats.levelsPassed + data.bonus) {
            data.stats.level += 1
            displayLevel(data, levelDOM, img, leftArrow, rightArrow)
        } 
    })
}

function displayLevel(data, levelDOM, img, leftArrow, rightArrow) {
    const level = data.stats.level + data.bonus
    img.src = `./Levels/Lvl${level}.jpg`

    if (leftArrow && rightArrow) {
        if (data.stats.level + data.bonus <= 1) {
            leftArrow.style.visibility = 'hidden'
        }  else leftArrow.style.visibility = 'visible'
        if (data.stats.level >= data.stats.levelsPassed - data.bonus) {
            rightArrow.style.visibility = 'hidden'
        }  else rightArrow.style.visibility = 'visible'
    }

    levelDOM.innerText = `Nivel ${data.stats.level + data.bonus}`
}

function handleTable(tasks) {
    const monthTasks = tasks.querySelectorAll('.month-info');

    monthTasks.forEach((monthTask, index) => monthTask.addEventListener('click', e => {
        monthTask.nextElementSibling.classList.toggle('hide')
        if (monthTask.nextElementSibling.classList.contains('hide')) {
            monthTask.nextElementSibling.addEventListener('animationend', e => {
                monthTask.nextElementSibling.style.display = 'none' 
            })
        } else {
            monthTask.nextElementSibling.style.display = 'table' 
        }
        monthTask.parentElement.parentElement.scrollTop = index * monthTask.scrollHeight
    }))
}

function calculateLevel(data, levelDOM) {
    data.taskBlocks.forEach(taskBlock => {
        taskBlock.tasks.map(task => {
            if (task.handed) {
                data.stats.level++
            }
        })
    })
    data.stats.levelsPassed = data.stats.level
    data.stats.levelsPassed += data.bonus
    levelDOM.innerText = `Nivel ${data.stats.level}`
}

function setMessage(pupil, data) {
    const message = document.createElement('h1')
    message.classList.add('message')
    message.classList.add(`${data.status.kind ? 'kind' : 'unkind'}`)
    message.innerText = data.messages[data.status.message]

    pupil.appendChild(message)
}

function getTaskTitles(data) {
    const taskTitles = []
    data.taskBlocks.forEach(taskBlock => {
        taskBlock.tasks.forEach(task => {
            taskTitles.push(task.title)
        })
    })
    return taskTitles
}

function getTaskNotes(data) {
    let taskNotes = []
    data.taskBlocks.forEach(taskBlock => {
        taskBlock.tasks.forEach(task => {
            taskNotes.push(task.notes)
        })
    })
    return taskNotes
}

function setModal(img, taskTitles, data, levelDOM) {
    taskTitles.forEach((taskTitle, index) => {
        const modalMessageTitles = getTaskTitles(data)
        const modalMessageNotes = getTaskNotes(data, index)
        taskTitle.addEventListener('click', e => {
            modalMessage.style.display = 'block'
            const title = modalMessage.children[0].children[1]
            const notes = modalMessage.children[0].children[2]
            notes.innerHTML = ''
            title.textContent = `Tarea ${index + 1}: ${modalMessageTitles[index]}`
            for (let i = 0; i < modalMessageNotes[index].length; i++) {
                notes.innerHTML += `<li>${modalMessageNotes[index][i]}</li>`
            }
        })
    })

    img.addEventListener('click', e => {
        modalAvatar.style.display = 'block'
        
        const name = document.getElementById('name')
        const img = document.getElementById('img')
        const level = document.getElementById('level')
        
        name.textContent = data.name
        img.src = data.avatar
        img.src = `./Levels/Lvl${data.stats.level + data.bonus}.jpg`
        level.textContent = `Nivel ${data.stats.level + data.bonus}`

        displayLevel(data, levelDOM, img)
    })

    modalAvatar.addEventListener('click', e => {
        if (e.target.classList.value === 'img-container' || e.target.classList.value === 'avatar-content') {
            modalAvatar.style.display = 'none'
        }
    })
}