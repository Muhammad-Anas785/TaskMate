<script setup>
import {
  getDataFromLocalStorage,
  saveDataInLocalStorage,
} from "@/composables/local-storage-functions";
import { computed, onMounted, reactive, ref } from "vue";
import DeleteModal from "./DeleteModal.vue";
import { maxLength, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import draggable from "vuedraggable";

let isActiveFilter = ref("all");
let taskIndex = ref(null);
let isDark = ref(false);
let taskToDo = ref("");
let id = ref(0);
let taskToUpdate = ref("");
let deleteModal = ref({
  isOpen: false,
  indexValue: 0,
  taskName: "",
});

const savedTasksData = ref([]);
const filteredTasks = ref([]);

const state = reactive({
  taskToDo,
  taskToUpdate,
});

const rules = {
  taskToDo: { required, maxLength: maxLength(35) },
  taskToUpdate: { required, maxLength: maxLength(35) },
};

const v$ = useVuelidate(rules, state);

//toggle dark theme
const toggleTheme = () => {
  isDark.value = !isDark.value;
  saveDataInLocalStorage("isDarkTheme", isDark.value);
  // localStorage.setItem("isDarkTheme", JSON.stringify(isDark.value));
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// active filter function
const filterDataFunc = (filterVal) => {
  isActiveFilter.value = filterVal;
  if (isActiveFilter.value === "all") {
    filteredTasks.value = savedTasksData.value;
  } else if (isActiveFilter.value === "completed") {
    filteredTasks.value = savedTasksData.value.filter((task) => {
      return task.isCompleted;
    });
  } else if (isActiveFilter.value === "active") {
    filteredTasks.value = savedTasksData.value.filter((task) => {
      return task.isCompleted === false;
    });
  }
};
const validateField = () => {
  v$.value.taskToDo.$touch();
  return v$.value.taskToDo.$error;
};

// Add Task
const addTask = () => {
  if (!validateField()) {
    id.value += 1;
    let taskModel = {
      id: id.value,
      task: taskToDo.value,
      isCompleted: false,
    };

    savedTasksData.value.push(taskModel);
    filterDataFunc(isActiveFilter.value);
    taskToDo.value = "";
    saveDataInLocalStorage("savedTasks", savedTasksData.value);
    v$.value.taskToDo.$reset();
  } else {
    v$.value.taskToDo.$touch();
  }
};

// edit task function
const editTask = (index, id) => {
  taskToUpdate.value = "";
  taskIndex.value = index;
  let taskEdit = savedTasksData.value.find((task) => {
    return task.id === id;
  });
  taskToUpdate.value = taskEdit.task;
};

// update Task function
const updateTask = (index) => {
  if (taskToUpdate.value.trim()) {
    savedTasksData.value[index].task = taskToUpdate.value;
    taskIndex.value = null;
    saveDataInLocalStorage("savedTasks", savedTasksData.value);
  }
};

const deleteTask = (isDelete, index) => {
  if (isDelete) {
    savedTasksData.value.splice(index, 1);
    filterDataFunc(isActiveFilter.value);
    let getSavedTasks = getDataFromLocalStorage("savedTasks");
    console.log("deleted: ", getSavedTasks);
    if (getSavedTasks) {
      getSavedTasks.splice(index, 1);
      saveDataInLocalStorage("savedTasks", getSavedTasks);
    }
    deleteModal.value.isOpen = false;
  } else {
    deleteModal.value.isOpen = false;
  }
};

const confirmDelete = (index, task) => {
  deleteModal.value.isOpen = true;
  deleteModal.value.indexValue = index;
  deleteModal.value.taskName = task;
};

const completedTask = () => {
  filterDataFunc(isActiveFilter.value);
  saveDataInLocalStorage("savedTasks", savedTasksData.value);
};

const completedTaskCount = computed(() => {
  let completeTasks = savedTasksData.value.filter((task) => {
    return task.isCompleted;
  });
  return completeTasks && completeTasks.length != 0 ? completeTasks.length : "";
});

const activeTaskCount = computed(() => {
  let activeTasks = savedTasksData.value.filter((task) => {
    return task.isCompleted === false;
  });
  return activeTasks && activeTasks.length != 0 ? activeTasks.length : "";
});

// Set theme
const setTheme = () => {
  let themeVal = getDataFromLocalStorage("isDarkTheme");
  isDark.value = themeVal;
  if (themeVal) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// Reterieve Data
const retrieveData = () => {
  let getSavedTasks = getDataFromLocalStorage("savedTasks");
  if (getSavedTasks) {
    savedTasksData.value = getSavedTasks;
    filteredTasks.value = getSavedTasks;
  } else {
    savedTasksData.value = [];
    filteredTasks.value = [];
  }
};

const dynmicClass = (invalid, dirty) => {
  if (invalid && dirty) {
    return "border border-red-500 dark:border-1";
  } else {
    return "dark:border-none";
  }
};

const generateCSV = () => {
  if (!savedTasksData.value.length) {
    alert("No Task To Export...!");
    return;
  }

  //CSV headers
  const headers = ["ID", "Task", "Status"];

  //CSV rows
  let rows = savedTasksData.value.map((task) => [
    task.id,
    `${task.task.replace(/"/g, '""')}`,
    task.isCompleted ? "Yes" : "No",
  ]);

  //create csv
  let csvContent = [headers, ...rows].map((content) => content.join(",")).join("\n");
  console.log(csvContent);

  //downladable link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "tasks.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const reorderingLocalStorageList = () => {
  savedTasksData.value = filteredTasks.value;
  saveDataInLocalStorage("savedTasks", filteredTasks.value);
};

// onMounted decides theme
onMounted(() => {
  setTheme();
  retrieveData();
});
</script>

<template>
  <section
    class="min-h-screen relative bg-gray-200 dark:bg-gray-800 flex flex-col justify-center items-center py-16 px-6 transition-colors duration-500"
  >
    <!-- Dark Theme Toggle -->

    <button
      class="absolute top-0 right-0 m-5 bg-gray-300 dark:bg-gray-600 dark:text-white px-4 py-2 rounded-lg font-semibold cursor-pointer"
      @click="toggleTheme"
    >
      <span>{{ isDark ? "Light 🌞" : "Dark 🌙" }}</span>
    </button>

    <div
      class="bg-white relative w-full max-w-lg p-6 rounded space-y-6 shadow-lg dark:bg-gray-900 dark:text-gray-200 transition-all duration-500"
    >
      <button
        @click="generateCSV"
        class="absolute right-7 top-6 text-sm px-2 py-1 sm:px-3 sm:py-1 sm:text-base font-semibold border border-blue-600 text-blue-500 hover:bg-gray-100 dark:border-gray-400 dark:text-gray-300 rounded dark:hover:bg-gray-700 cursor-pointer transition duration-300 ease-in-out"
      >
        Generate CSV
      </button>
      <!-- Task Manager -->
      <div class="text-left">
        <h1 class="text-lg font-bold md:text-2xl">Task Mate</h1>
      </div>

      <!-- Task Add input -->
      <div class="flex flex-row justify-between mb-7 gap-2 relative">
        <!-- {{ v$.taskToDo }} -->
        <input
          v-model="taskToDo"
          type="text"
          @blur="v$.taskToDo.$touch()"
          @keyup.enter="addTask"
          placeholder="Enter the task."
          :class="[
            dynmicClass(
              v$.taskToDo.required.$invalid || v$.taskToDo.maxLength.$invalid,
              v$.taskToDo.$dirty
            ),
            'border border-gray-300 text-gray-800 dark:text-white dark:bg-gray-800 rounded-lg w-2/3 p-2 md:p-2 sm:w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
          ]"
        />
        <p
          class="absolute text-sm ms-2 mt-11 text-red-500"
          v-if="v$.taskToDo.required.$invalid && v$.taskToDo.$dirty"
        >
          Please add task first
        </p>
        <p
          class="absolute text-sm ms-2 mt-11 text-red-500"
          v-if="v$.taskToDo.maxLength.$invalid && v$.taskToDo.$dirty"
        >
          {{ v$.taskToDo.maxLength.$message }}
        </p>
        <button
          @click="addTask"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-md font-semibold rounded w-24 sm:w-32 cursor-pointer transition duration-300 ease-in-out"
        >
          Add Task
        </button>
      </div>
      <div></div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row justify-between gap-4">
        <button
          :class="[
            'bg-gray-200 dark:bg-gray-700 px-8 py-1 font-semibold rounded cursor-pointer',
            isActiveFilter === 'all'
              ? 'text-blue-600 border-2 border-blue-600 dark:text-gray-300 dark:border-gray-300'
              : 'text-gray-800 border border-gray-800 dark:border-gray-200 dark:text-gray-200',
          ]"
          @click="filterDataFunc('all')"
        >
          All {{ savedTasksData && savedTasksData.length != 0 ? savedTasksData.length : "" }}
        </button>
        <button
          :class="[
            'bg-gray-200 dark:bg-gray-700  px-8 py-1 font-semibold rounded cursor-pointer',
            isActiveFilter === 'completed'
              ? 'text-blue-600 border-2 border-blue-600 dark:text-gray-300 dark:border-gray-300'
              : 'text-gray-800 border border-gray-800 dark:border-gray-200 dark:text-gray-200',
          ]"
          @click="filterDataFunc('completed')"
        >
          Completed {{ completedTaskCount }}
        </button>
        <button
          :class="[
            'bg-gray-200 dark:bg-gray-700 px-8 py-1 font-semibold rounded cursor-pointer',
            isActiveFilter === 'active'
              ? 'text-blue-600 border-2 border-blue-600 dark:text-gray-300 dark:border-gray-300'
              : 'text-gray-800 border border-gray-800 dark:border-gray-200 dark:text-gray-200',
          ]"
          @click="filterDataFunc('active')"
        >
          Active {{ activeTaskCount }}
        </button>
      </div>

      <!-- Task List -->
      <div>
        <draggable
          v-model="filteredTasks"
          tag="ul"
          itemKey="index"
          class="space-y-2 h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-400 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full"
          @change="reorderingLocalStorageList"
          handle=".drag-handle"
        >
          <template #item="{ element: taskValue, index }">
            <li
              class="border border-gray-400 dark:border-gray-600 rounded-xl px-2 py-2 shadow-lg me-2"
            >
              <!-- Update Case -->
              <div
                class="flex flex-row items-center justify-between relative"
                v-if="index === taskIndex"
              >
                <input
                  placeholder="Task"
                  @blur="v$.taskToUpdate.$touch()"
                  :class="[
                    dynmicClass(
                      v$.taskToUpdate.required.$invalid || v$.taskToUpdate.maxLength.$invalid,
                      v$.taskToUpdate.$dirty
                    ),
                    'border border-gray-300 text-gray-800 dark:bg-gray-800 dark:text-white rounded-lg w-2/3 p-2 md:p-2 sm:w-80 outline-none',
                  ]"
                  type="text"
                  v-model="taskToUpdate"
                />
                <div class="absolute left-[67%] sm:left-[74%]">
                  <div class="relative group inline-block">
                    <i
                      class="fa-solid fa-circle-info text-red-500 mb-1 cursor-pointer"
                      v-if="
                        (v$.taskToUpdate.maxLength.$invalid || v$.taskToUpdate.required.$invalid) &&
                        v$.taskToUpdate.$dirty
                      "
                    ></i>
                    <span
                      v-if="v$.taskToUpdate.maxLength.$invalid"
                      class="absolute bottom left-1/2 -translate-x-1/2 mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap"
                      >The maximum length allowed is 35</span
                    >
                    <span
                      v-else-if="v$.taskToUpdate.required.$invalid"
                      class="absolute bottom left-1/2 -translate-x-1/2 mb-2 opacity-0 block transition-opacity duration-300 group-hover:opacity-100 bg-gray-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap"
                      >Required*</span
                    >
                  </div>
                </div>

                <button
                  class="hover:bg-gray-200 dark:hover:bg-gray-800 hover:disabled:bg-gray-500 rounded-full px-3 py-2 cursor-pointer disabled:cursor-not-allowed transition ease-in-out duration-300"
                  @click="updateTask(index, taskValue.id)"
                >
                  <i class="fa-regular fa-floppy-disk text-gray-500 dark:text-gray-300"></i>
                </button>
              </div>
              <div class="flex justify-between items-center relative" v-else>
                <span class="drag-handle cursor-grab active:cursor-grabbing absolute text-gray-500"
                  >☰</span
                >
                <div class="flex flex-row items-center gap-2 px-3 ms-2">
                  <label class="relative cursor-pointer flex items-center justify-center">
                    <input
                      v-model="taskValue.isCompleted"
                      @change="completedTask()"
                      type="checkbox"
                      class="appearance-none w-5 h-5 cursor-pointer text-white bg-gray-300 dark:bg-gray-500 border-gray-300 checked:bg-blue-600 rounded-full"
                    />
                    <i
                      v-if="taskValue.isCompleted"
                      class="fa-solid fa-check absolute text-white text-xs"
                    ></i>
                  </label>
                  <h4 :class="['font-semibold', taskValue.isCompleted ? 'line-through' : '']">
                    {{ taskValue.task }}
                  </h4>
                </div>
                <!-- Action Buttons -->
                <div class="flex flex-row items-center sm:gap-1">
                  <button
                    @click="editTask(index, taskValue.id)"
                    :disabled="taskValue.isCompleted"
                    class="hover:bg-gray-200 dark:hover:bg-gray-800 hover:disabled:bg-gray-200 dark:hover:disabled:bg-gray-800 rounded-full px-3 py-2 cursor-pointer disabled:cursor-not-allowed transition ease-in-out duration-300"
                  >
                    <i class="fa-solid fa-pen text-gray-600 text-sm"></i>
                  </button>

                  <button
                    @click="confirmDelete(index, taskValue.task)"
                    class="hover:bg-gray-200 dark:hover:bg-gray-800 hover:disabled:bg-gray-500 rounded-full px-3 py-2 cursor-pointer disabled:cursor-not-allowed transition ease-in-out duration-300"
                  >
                    <i class="fa-solid fa-trash text-red-500 text-sm"></i>
                  </button>
                </div>
              </div>
            </li>
          </template>
        </draggable>
      </div>
    </div>
    <DeleteModal :deleteModal="deleteModal" @deleteTask="deleteTask" />
  </section>
</template>
