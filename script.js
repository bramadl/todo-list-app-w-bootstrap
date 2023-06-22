class TodoList {
  domEl = {
    app: null,
    container: null,
    form: null,
    header: null,
  };

  items = [];

  markAllComplete = true;

  selectors = {
    anemic: undefined,
    checker: undefined,
    checkAllButton: undefined,
    remover: undefined,
    removeAllButton: undefined,
    formFields: undefined,
  };

  constructor(selector, { selectors }) {
    this.domEl.app = document.querySelector(selector);

    const { app } = this.domEl;
    this.domEl.container = app.querySelector(selectors.container);
    this.domEl.form = app.querySelector(selectors.form);
    this.domEl.header = app.querySelector(selectors.header);

    this.selectors = selectors;

    selectors.checkAllButton && this.attachMarkAllEvent();
    selectors.removeAllButton && this.attachRemoveAllEvent();
    this.attachSubmitEvent();

    selectors.checkAllButton && this.renderMarkButtonText();
    this.render();
  }

  get itemsCount() {
    return this.items.length;
  }

  get markAllButton() {
    return this.domEl.form.querySelector(this.selectors.checkAllButton);
  }

  get removeAllButton() {
    return this.domEl.app.querySelector(this.selectors.removeAllButton);
  }

  addItem(title, message) {
    const id = SomeUtils.generateIDFromList(this.items);
    const item = new TodoListItem(id, title, message, false, new Date());

    this.items.push(item);
    this.resetFormFields();
    this.render();
  }

  attachMarkAllEvent() {
    this.markAllButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.markAllItem();
    });
  }

  attachMarkEvent(element) {
    const parentElement = element.parentElement
    element.addEventListener("change", (event) => {
      const todoItemId = +parentElement.dataset.id;
      this.markItem(todoItemId, event.target.checked);
    });
  }

  attachRemoveAllEvent() {
    this.removeAllButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.deleteAllItem();
    });
  }

  attachRemoveEvent(element) {
    const parentElement = element.parentElement.parentElement;
    element.addEventListener("click", (event) => {
      const todoItemId = +parentElement.dataset.id;
      this.deleteItem(todoItemId);
    });
  }

  attachSubmitEvent() {
    this.domEl.form.addEventListener("submit", (event) => {
      event.preventDefault();

      const validated = this.validateFormFields();
      if (!validated) return alert("Enter the task name and description!");

      const [title, message] = validated;
      this.addItem(title, message);
    });
  }

  deleteAllItem() {
    this.items = [];
    this.render();
  }

  deleteItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.render();
  }

  determineMarkAllCompleteValue() {
    const allTaskAreCompleted = this.items.every(
      (item) => item.isCompleted === true
    );

    if (allTaskAreCompleted) this.notifyWorker();
    this.markAllComplete = allTaskAreCompleted ? false : true;
  }

  markAllItem() {
    this.items.forEach((item) => {
      item.isCompleted = this.markAllComplete;
    });

    this.markAllComplete = !this.markAllComplete;

    this.render();
  }

  markItem(id, markOrUnmark) {
    const todoItem = this.items.find((item) => item.id === id);

    if (markOrUnmark === true) todoItem.markComplete();
    else todoItem.markIncomplete();

    this.determineMarkAllCompleteValue();
    this.render();
  }

  notifyWorker() {
    alert("Great job! You have completed all of your tasks.");
  }

  render() {
    this.renderTaskCount();
    this.renderTaskList();
  }

  renderMarkButtonText() {
    this.markAllButton.textContent = this.markAllComplete
      ? "Check all"
      : "Uncheck all";
  }

  renderTaskCount() {
    const anemicEl = this.domEl.app.querySelector(this.selectors.anemic);
    anemicEl.textContent = this.items.filter(
      (item) => item.isCompleted === false
    ).length;
  }

  renderTaskList() {
    const { container } = this.domEl;
    container.innerHTML = "";

    if (this.itemsCount === 0) {
      const emptyListElement = `
        <div class="py-4">
          There are no items currently.
        </div>
      `;

      container.insertAdjacentHTML("beforeend", emptyListElement);
    } else {
      this.items.forEach((item) => {
        const listItemElement = `
          <label class="list-group-item position-relative" data-id="${item.id}">
            <input
              class="form-check-input me-1" ${item.isCompleted ? "checked" : ""}
              type="checkbox"
            />
            <span class="${item.isCompleted ? "todo-list--completed" : ""}">
              ${item.title}
            </span>
            <div
              class="position-absolute top-50 end-0 translate-middle-x translate-middle-y me-1"
            >
              <button class="btn btn-sm btn-danger">Hapus</button>
            </div>
          </label>
        `;

        container.insertAdjacentHTML("beforeend", listItemElement);
      });
    }

    const checkers = [...container.querySelectorAll(this.selectors.checker)];
    const removers = [...container.querySelectorAll(this.selectors.remover)];

    checkers.forEach((element) => {
      this.attachMarkEvent(element);
    });

    removers.forEach((element) => {
      this.attachRemoveEvent(element);
    });
  }

  resetFormFields() {
    this.domEl.form.reset();
  }

  validateFormFields() {
    const form = this.domEl.form;
    const formFields = [...form.querySelectorAll(this.selectors.formFields)];
    const formValues = formFields.map((field) => field.value);

    const someFieldsAreEmpty = formValues.some((value) =>
      SomeUtils.isEmpty(value)
    );

    if (someFieldsAreEmpty) return false;
    return formValues;
  }
}

class TodoListItem {
  id = undefined;
  title = undefined;
  message = undefined;
  isCompleted = undefined;
  createdAt = undefined;

  constructor(id, title, message, isCompleted, createdAt) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.isCompleted = isCompleted;
    this.createdAt = createdAt;
  }

  markComplete() {
    this.isCompleted = true;
  }

  markIncomplete() {
    this.isCompleted = false;
  }
}

class SomeUtils {
  static formatDate(date) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const dateObject = new Date(date);

    const takeDate = dateObject.getDate();
    const takeMonth = dateObject.getMonth();
    const takeYear = dateObject.getFullYear();

    const takeHour = dateObject.getHours();
    const takeMinute = dateObject.getMinutes();
    const takeSecond = dateObject.getSeconds();

    return `${takeDate} ${months[takeMonth]} ${takeYear} ${takeHour}:${takeMinute}:${takeSecond}`;
  }

  static generateIDFromList(list) {
    const lastItem = list[list.length - 1];
    if (!lastItem) return 1;
    return lastItem.id + 1;
  }

  static isEmpty(value) {
    return (
      value === "" ||
      (typeof value === "string" && value.trim().length === 0) ||
      value === undefined ||
      value === null
    );
  }
}

const todoList = new TodoList("#app", {
  selectors: {
    anemic: ".task-count",
    checker: ".form-check-input",
    container: ".list-group",
    form: ".form",
    formFields: ".form-control",
    remover: ".btn-danger",
    removeAllButton: ".btn-remove-all",
  },
});
