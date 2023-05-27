const express = require("express");
const path = require("path");
const datefns = require("date-fns");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

const authentication = function (request, response, next) {
  const {
    search_q = "",
    priority = "",
    status = "",
    category = "",
    date = "2021-02-22",
  } = request.query;
  console.log(priority);
  if (
    priority !== "HIGH" &&
    priority !== "LOW" &&
    priority !== "MEDIUM" &&
    priority !== ""
  ) {
    response.status(400);
    return response.send("Invalid Todo Priority");
  }
  if (
    status != "TO DO" &&
    status != "IN PROGRESS" &&
    status != "DONE" &&
    status != ""
  ) {
    response.status(400);
    return response.send("Invalid Todo Status");
  }
  if (
    category != "WORK" &&
    category != "HOME" &&
    category != "LEARNING" &&
    category != ""
  ) {
    response.status(400);
    return response.send("Invalid Todo Category");
  }
  // const dateObj = parse(dueDate, "yyyy-MM-dd", new Date());
  //   const isValidDate = date.isValid(new Date("2021-02-22"));
  //   console.log(dueDate);
  const isValidDate = datefns.isValid(new Date(date));
  if (!isValidDate) {
    response.status(400);
    return response.send("Invalid Due Date");
  }
  //    else {
  //     request.query.date = new Date(date);
  //   }
  next();
};

const authentication2 = function (request, response, next) {
  const { priority, status, category, dueDate = "2021-02-22" } = request.body;
  console.log(priority);
  if (
    priority !== "HIGH" &&
    priority !== "LOW" &&
    priority !== "MEDIUM" &&
    priority !== undefined
  ) {
    response.status(400);
    return response.send("Invalid Todo Priority");
  }
  if (
    status != "TO DO" &&
    status != "IN PROGRESS" &&
    status != "DONE" &&
    status != undefined
  ) {
    response.status(400);
    return response.send("Invalid Todo Status");
  }
  if (
    category != "WORK" &&
    category != "HOME" &&
    category != "LEARNING" &&
    category != undefined
  ) {
    response.status(400);
    return response.send("Invalid Todo Category");
  }
  // const dateObj = parse(dueDate, "yyyy-MM-dd", new Date());
  //   const isValidDate = date.isValid(new Date("2021-02-22"));
  //   console.log(dueDate);
  const isValidDate = datefns.isValid(new Date(dueDate));
  console.log(isValidDate);
  if (!isValidDate) {
    response.status(400);
    return response.send("Invalid Due Date");
  }
  // else    {
  //     request.body.date = new Date(date);
  //   }
  next();
};

const convertTodoToCamelCase = (data2) => ({
  id: data2.id,
  todo: data2.todo,
  priority: data2.priority,
  status: data2.status,
  category: data2.category,
  dueDate: data2.due_date,
});
const hasCategoryandStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryandPriorityProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasDuedateProperty = (requestQuery) => {
  return requestQuery.due_date !== undefined;
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasTodoProperty = (requestBody) => {
  return requestBody.todo !== undefined;
};
initializeDBAndServer();

app.get("/todos/", authentication, async (request, response) => {
  try {
    let data = null;
    let getTodosQuery = "";
    const { search_q = "", priority, status, category } = request.query;

    switch (true) {
      case hasCategoryandStatusProperty(request.query):
        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND category ='${category}';`;
        break;
      case hasCategoryandPriorityProperty(request.query):
        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}'
    AND category ='${category}';`;
        break;
      case hasCategoryProperty(request.query):

        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND category ='${category}';`;

        break;
      case hasPriorityAndStatusProperties(request.query):

        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
        break;
      case hasPriorityProperty(request.query):

        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;

        break;
      case hasStatusProperty(request.query):

        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;

        break;
      default:
        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
    }
    data = await db.all(getTodosQuery);
    console.log(data);
    response.send(data.map((data2) => convertTodoToCamelCase(data2)));
  } catch (e) {
    console.log(e);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * from todo where id='${todoId}';
    `;
  const todo = await db.get(getTodoQuery);
  response.send(convertTodoToCamelCase(todo));
});

app.get("/agenda/", authentication, async (request, response) => {
  const { date } = request.query;
  //   console.log(date);
  const getTodoQuery = `
  SELECT * FROM todo WHERE strftime('%Y-%m-%d', due_date) = '${date}';

    `;
  try {
    const todo = await db.all(getTodoQuery);
    response.send(todo.map((todos) => convertTodoToCamelCase(todos)));
  } catch (e) {
    console.log(e);
  }
});

app.post("/todos/", authentication2, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createTodoQuery = `
    insert into todo (id,todo,priority,status,category,due_date) values 
(
    '${id}','${todo}','${priority}','${status}','${category}','${dueDate}'
) ;   
    `;
  const todoItem = await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", authentication2, async (request, response) => {
  try {
    const { todoId } = request.params;
    const { todo, priority, status, dueDate, category } = request.body;
    // console.log(category);
    let getTodosQuery = "";
    switch (true) {
      case hasPriorityProperty(request.body):
        getTodosQuery = `
  UPDATE todo set priority='${priority}' where id='${todoId}'`;
        await db.run(getTodosQuery);
        response.send("Priority Updated");
        break;

      case hasCategoryProperty(request.body):
        getTodosQuery = `
  UPDATE todo set category='${category}' where id='${todoId}'`;
        await db.run(getTodosQuery);
        response.send("Category Updated");
        break;
      case hasDuedateProperty(request.body):
        getTodosQuery = `
  UPDATE todo set due_date=date('${dueDate}') where id='${todoId}'`;
        await db.run(getTodosQuery);
        response.send("Due Date Updated");
        break;
      case hasStatusProperty(request.body):
        getTodosQuery = `
   UPDATE todo set status='${status}' where id='${todoId}'`;
        await db.run(getTodosQuery);
        response.send("Status Updated");
        break;
      case hasTodoProperty(request.body):
        getTodosQuery = `
     UPDATE todo set todo='${todo}' where id='${todoId}'
   `;
        await db.run(getTodosQuery);
        response.send("Todo Updated");
        break;
      default:
    }
  } catch (e) {
    console.log(e);
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        DELETE from todo where id='${todoId}';
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
