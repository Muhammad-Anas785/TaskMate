<script setup>
import { onMounted, ref } from "vue";

let isActiveFilter = ref("all");
let taskIndex = ref(null);
let isDark = ref(false);
let taskToDo = ref("");
let id = ref(0);

const tasksData = [
  { id: 1, task: "Work", isCompleted: false },
  { id: 2, task: "Food", isCompleted: false },
  { id: 1, task: "Play", isCompleted: false },
];

const savedTasksData = ref([]);

//toggle dark theme
const toggleTheme = () => {
  isDark.value = !isDark.value;
  localStorage.setItem("isDarkTheme", JSON.stringify(isDark.value));
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// active filter function
const onClickFilter = (filterVal) => {
  isActiveFilter.value = filterVal;
};

// Add Task
const addTask = () => {
  id.value += 1;
  let taskModel = {
    id: id.value,
    task: taskToDo.value,
    isCompleted: false,
  };

  savedTasksData.value.push(taskModel);
};

// edit task function
const editTask = (index) => {
  taskIndex.value = index;
};

// update Task function
const updateTask = () => {
  taskIndex.value = null;
};

// onMounted decides theme
onMounted(() => {
  let themeVal = JSON.parse(localStorage.getItem("isDarkTheme"));
  isDark.value = themeVal;
  if (themeVal) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});
</script>

<template>
  <section
    class="min-h-screen relative bg-gray-200 dark:bg-gray-800 flex flex-col justify-center items-center py-16 px-6"
  >
    <!-- Dark Theme Toggle -->

    <button
      class="absolute top-0 right-0 m-5 bg-gray-300 dark:bg-gray-600 dark:text-white px-4 py-2 rounded-lg font-semibold cursor-pointer"
      @click="toggleTheme"
    >
      <span>{{ isDark ? "Light 🌞" : "Dark 🌙" }}</span>
    </button>

    <div
      class="bg-white w-full max-w-lg p-6 rounded space-y-6 shadow-lg dark:bg-gray-900 dark:text-gray-200"
    >
      <!-- Task Manager -->
      <div class="text-center">
        <h1 class="text-lg font-bold md:text-2xl">Task Mate</h1>
      </div>

      <!-- Task Add input -->
      <div class="flex flex-row justify-between gap-2">
        <input
          v-model="taskToDo"
          type="text"
          placeholder="Enter the task."
          class="border border-gray-300 dark:bg-gray-800 rounded-lg w-2/3 p-2 md:p-2 sm:w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />

        <button
          @click="addTask"
          class="bg-blue-600 text-white text-sm md:text-md font-semibold rounded w-24 sm:w-32 cursor-pointer"
        >
          Add Task
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row justify-between gap-4">
        <button
          :class="[
            'bg-gray-200 dark:bg-gray-700 px-8 py-1 font-semibold rounded cursor-pointer',
            isActiveFilter === 'all'
              ? 'text-blue-600 border-2 border-blue-600 dark:text-gray-300 dark:border-gray-300'
              : 'text-gray-800 border border-gray-800 dark:border-gray-200 dark:text-gray-200',
          ]"
          @click="onClickFilter('all')"
        >
          All
        </button>
        <button
          :class="[
            'bg-gray-200 dark:bg-gray-700  px-8 py-1 font-semibold rounded cursor-pointer',
            isActiveFilter === 'completed'
              ? 'text-blue-600 border-2 border-blue-600 dark:text-gray-300 dark:border-gray-300'
              : 'text-gray-800 border border-gray-800 dark:border-gray-200 dark:text-gray-200',
          ]"
          @click="onClickFilter('completed')"
        >
          Completed
        </button>
        <button
          :class="[
            'bg-gray-200 dark:bg-gray-700 px-8 py-1 font-semibold rounded cursor-pointer',
            isActiveFilter === 'active'
              ? 'text-blue-600 border-2 border-blue-600 dark:text-gray-300 dark:border-gray-300'
              : 'text-gray-800 border border-gray-800 dark:border-gray-200 dark:text-gray-200',
          ]"
          @click="onClickFilter('active')"
        >
          Active
        </button>
      </div>

      <!-- Task List -->
      <div>
        <ul class="space-y-4">
          {{savedTasksData}}
          <li v-for="(taskValue, index) in savedTasksData" :key="taskValue.id">
            <!-- Update Case -->
            <div class="flex flex-row items-center justify-between" v-if="index === taskIndex">
              <input
                placeholder="Task"
                class="border border-gray-300 rounded-lg w-2/3 p-2 md:p-2 sm:w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                type="text"
                v-model="taskValue.task"
              />
              <button
                class="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
                @click="updateTask"
              >
                Update
              </button>
            </div>
            <div class="flex justify-between items-center" v-else>
              <div class="flex flex-row items-center gap-2">
                <input
                  v-model="taskValue.isCompleted"
                  type="checkbox"
                  class="w-4 h-5 text-blue-600 border-gray-300 rounded-full focus:ring-blue-500"
                />
                <h4 class="font-semibold">
                  {{ taskValue.task }}
                </h4>
              </div>
              <!-- Action Buttons -->
              <div class="flex flex-row items-center">
                <div class="hover:bg-gray-200 rounded-full p-3 cursor-pointer">
                  <i class="fa-solid fa-pen text-gray-600 text-sm" @click="editTask(index)"></i>
                </div>

                <div class="hover:bg-gray-200 rounded-full p-3 cursor-pointer">
                  <i class="fa-solid fa-trash text-red-500 text-sm"></i>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
