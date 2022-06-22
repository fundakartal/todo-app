const userName = document.querySelector('.user-name')
const uname = document.querySelector('.uname')
const taskContainer = document.querySelector('.task-container')
const btnLogin = document.querySelector('.login-btn')
const loginForm = document.querySelector('.login-form')
const saveTask = document.querySelector('.add-task-save')
const cancelTask = document.querySelector('.add-task-cancel')
const addTaskBtn = document.querySelector('.add-task-btn')
const addTaskInput = document.querySelector('.add-task-input')
const addTaskDate = document.querySelector('.add-task-date')
const taskList = document.querySelector('.todo-list-items')
const addTaskModal = document.querySelector('.modal-overlay')
const dateHeader = document.querySelector('.date-header')

let users = []
let tasks

eventListeners()

function eventListeners() {
  loginForm.addEventListener('submit', addNewUser)
  saveTask.addEventListener('click', addTaskToList)
  addTaskBtn.addEventListener('click', openModal)
  cancelTask.addEventListener('click', (e) => {
    e.preventDefault()
    openModal(false)
  })
  addTaskModal.addEventListener('click', (e) => {
    if (!e.target.classList.contains('modal-overlay')) {
      return
    } else {
      openModal(false)
    }
  })
}

function addNewUser(e) {
  e.preventDefault()
  if (userName.value === '') {
    alert('Please enter your name')
    userName.focus()
    return
  }
  const newUser = {
    name: userName.value,
    tasks: JSON.parse(localStorage.getItem(userName.value)) || [],
  }
  if (users.length > 0) {
    users.map((user) => {
      if (user.name === newUser.name) {
        uname.textContent = user.name
        user.tasks.map((task) => {
          addTaskToList(task)
        })
        loginForm.parentElement.style.display = 'none'
        taskContainer.style.display = 'block'
      }
    })
  } else {
    users.push(newUser)
    localStorage.setItem(newUser.name, JSON.stringify(newUser.tasks))
    userName.value = ''
    uname.textContent = newUser.name
    loginForm.parentElement.style.display = 'none'
    taskContainer.style.display = 'flex'
    newUser.tasks.forEach((task) => {
      createTask(task)
    })
  }
}

function addTaskToList(e) {
  e.preventDefault()
  if (addTaskInput.value === '' || addTaskDate.value === '') {
    addTaskInput.focus()
    return
  }
  const newTask = {
    text: addTaskInput.value,
    date: addTaskDate.value,
    id: addTaskInput.value,
  }
  if (users.length > 0) {
    users.map((user) => {
      if (user.name === uname.textContent) {
        user.tasks.push(newTask)
        localStorage.setItem(uname.textContent, JSON.stringify(user.tasks))
      }
    })
  }
  createTask(newTask)
  addTaskInput.value = ''
  openModal(false)
}

function createTask() {
  const tasks = JSON.parse(localStorage.getItem(uname.textContent))

  const tasksByDate = tasks.reduce((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = []
    }
    acc[task.date].push(task)
    return acc
  }, {})

  for (const date in tasksByDate) {
    const dateHeader = document.createElement('div')
    dateHeader.classList.add('date-header')
    dateHeader.id = date
    dateHeader.innerHTML = `<img src="./img/takvim.svg" alt="" /><h2>${formatDate(
      date
    )}</h2>`
    taskList.appendChild(dateHeader)

    tasksByDate[date].forEach((task) => {
      const taskItem = document.createElement('li')
      taskItem.classList.add('todo-list-item')
      taskItem.id = task.id + '-' + task.date
      taskItem.innerHTML = `
      <button class="empty"></button>
      <span class="task-text">${task.text}</span>
      <button class='edit'></button>
      <button class='delete'></button>`
      taskList.appendChild(taskItem)
      taskItem.querySelector('.delete').addEventListener('click', deleteTask)
      taskItem.querySelector('.edit').addEventListener('click', editTask)
      taskItem.querySelector('.empty').addEventListener('click', (e) => {
        e.target.classList.toggle('done')
        e.target.parentElement.classList.toggle('done')
      })
    })
  }

  const dates = Array.from(taskList.querySelectorAll('.date-header'))
  dates.forEach((date) => {
    const dateId = date.id
    const dateList = Array.from(taskList.querySelectorAll(`[id="${dateId}"]`))
    if (dateList.length > 1) {
      dateList.slice(1).forEach((date) => {
        date.remove()
      })
    }
  })

  const items = Array.from(taskList.querySelectorAll('.todo-list-item'))
  items.forEach((item) => {
    const itemId = item.id
    const itemList = Array.from(taskList.querySelectorAll(`[id="${itemId}"]`))
    if (itemList.length > 1) {
      itemList.slice(1).forEach((item) => {
        item.remove()
      })
    }
  })

  const headers = Array.from(taskList.querySelectorAll('.date-header'))
  headers.forEach((header) => {
    const headerId = header.id
    const headerList = Array.from(
      taskList.querySelectorAll(`[id="${headerId}"]`)
    )
    if (headerList.length > 1) {
      headerList.slice(1).forEach((header) => {
        header.remove()
      })
    }
  })
}

function editTask(e) {
  e.preventDefault()
  const taskText = e.target.parentElement.querySelector('.task-text')
  taskText.contentEditable = true
  taskText.focus()
  e.currentTarget.classList.add('save')

  if (users.length > 0) {
    users.map((user) => {
      if (user.name === uname.textContent) {
        const index = user.tasks.findIndex(
          (task) => task.id === taskText.innerText
        )
        if (index > -1) {
          taskText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              taskText.contentEditable = false
              taskText.blur()
              taskText.parentElement
                .querySelector('.edit')
                .classList.remove('save')
              user.tasks[index].text = taskText.innerText
              user.tasks[index].id = taskText.innerText
              localStorage.setItem(
                uname.textContent,
                JSON.stringify(user.tasks)
              )
              if (taskText.innerText === '') {
                taskText.parentElement.remove()
                user.tasks.splice(index, 1)
                localStorage.setItem(
                  uname.textContent,
                  JSON.stringify(user.tasks)
                )
              }
            }
          })
        }
      }
    })
  }
}

function deleteTask(e) {
  e.preventDefault()
  e.target.parentElement.remove()
  const taskText = e.target.parentElement.querySelector('.task-text')

  if (users.length > 0) {
    users.map((user) => {
      if (user.name === uname.textContent) {
        const index = user.tasks.findIndex(
          (task) => task.id === taskText.innerText
        )
        if (index > -1) {
          user.tasks.splice(index, 1)
          localStorage.setItem(uname.textContent, JSON.stringify(user.tasks))
        }
      }
    })
  }
}

function openModal(open = true) {
  if (open) {
    addTaskModal.classList.add('show-modal')
    taskContainer.style.zIndex = '-99'
  } else {
    addTaskModal.classList.remove('show-modal')
    taskContainer.style.zIndex = 'unset'
  }
}

function formatDate(date) {
  const d = new Date(date)
  const dayLong = d.toLocaleDateString('en-US', { weekday: 'long' })
  const monthLong = d.toLocaleDateString('en-US', { month: 'long' })
  const day = d.getDate()
  const formattedDate = `${dayLong}, ${monthLong} ${day}`
  return formattedDate
}
