var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//*create text area input box for editing
//*allows user to select text to edit
$(".list-group").on("click", "p", function() {
    var text = $(this)
    .text()
    .trim();
    //*creates text box
    var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
    $(this).replaceWith(textInput);
    //*makes text box automatically able to start typing
    textInput.trigger("focus");
});
//*saves edit without needing a button and instead being 'out of focus'
$(".list-group").on("blur", "textarea", function() {
    //*get the textarea's current value/text
    var text = $(this)
    .val()
    .trim();
    //*get the parent ul's id attribute
    var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
    //*get the task's position in the list of other li elements
    var index = $(this)
    .closest(".list-group-item")
    .index();
    
    tasks[status][index].text = text;
    saveTasks();
    //*recreate task item with new edited one   
    var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
    //*replace textarea with new task item
    $(this).replaceWith(taskP);
});

//*due date was clicked
$(".list-group").on("click", "span", function() {
    // get current text
    var date = $(this)
      .text()
      .trim();
  
    //*create new input element
    var dateInput = $("<input>")
      .attr("type", "text")
      .addClass("form-control")
      .val(date);
  
    //*swap out elements
    $(this).replaceWith(dateInput);
  
    //*automatically focus on new element
    dateInput.trigger("focus");
  });

//*value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
    // get current text
    var date = $(this)
      .val()
      .trim();
  
    //*get the parent ul's id attribute
    var status = $(this)
      .closest(".list-group")
      .attr("id")
      .replace("list-", "");
  
    //*get the task's position in the list of other li elements
    var index = $(this)
      .closest(".list-group-item")
      .index();
  
    //*update task in array and re-save to localstorage
    tasks[status][index].date = date;
    saveTasks();
  
    //*recreate span element with bootstrap classes
    var taskSpan = $("<span>")
      .addClass("badge badge-primary badge-pill")
      .text(date);
  
    //*replace input with span element
    $(this).replaceWith(taskSpan);
  });

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

//*Make list items draggable and sortable
$(".card .list-group").sortable({
    connectWith: $(".card .list-group"),
    scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  //make dropped items stay in columns when page is refreshed
  update: function() {
      var tempArr = []

      $(this).children().each(function() {
        var text = $(this)
        .find("p")
        .text()
        .trim();
    
      var date = $(this)
        .find("span")
        .text()
        .trim();

      tempArr.push({
          text: text,
          date: date
      });  
      });
      var arrName = $(this)
        .attr("id")
        .replace("list-", "");

      tasks[arrName] = tempArr;
      saveTasks();

      console.log(tempArr);
  }
});
//make draggable items droppable in trash
$("#trash").droppable({
    accept: ".card .list-group-item",
    tolerance: "touch",
    drop: function(event, ui) {
       //this specifically  
       ui.draggable.remove();
      console.log("drop");
    },
    over: function(event, ui) {
      console.log("over");
    },
    out: function(event, ui) {
      console.log("out");
    }
  });