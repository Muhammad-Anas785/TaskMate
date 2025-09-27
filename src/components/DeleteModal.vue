<script setup>
defineProps({
  deleteModal: Object,
});
const emit = defineEmits(["submit"]);

const confirmDeleteTask = (index) => {
  emit("deleteTask", true, index);
};
const preventDelete = (index) => {
  emit("deleteTask", false, index);
};
</script>

<template>
  <transition name="fade">
    <div
      class="fixed inset-0 flex justify-center items-center bg-black/50 z-50"
      v-if="deleteModal.isOpen"
    >
      <transition name="sacle">
        <div
          v-if="deleteModal.isOpen"
          class="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg w-96 p-6 relative transition-transform transform scale-95"
        >
          <!-- Close button -->
          <button
            class="absolute top-2 right-2 cursor-pointer"
            @click="preventDelete(deleteModal.indexValue)"
          >
            ✖
          </button>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">Confirm Delete</h2>
          <p class="text-gray-700 dark:text-gray-200">
            Are you sure you want to delete <span class="font-bold">{{ deleteModal.taskName }}</span>?
          </p>
          <div class="mt-3 flex justify-end gap-2">
            <button
              @click="confirmDeleteTask(deleteModal.indexValue)"
              class="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold cursor-pointer transition duration-300 ease-in-out"
            >
              Yes
            </button>
            <button
              @click="preventDelete(deleteModal.indexValue)"
              class="px-5 py-2 bg-red-500 hover:bg-red-700 rounded text-white font-semibold cursor-pointer transition duration-300 ease-in-out"
            >
              No
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
/* Overlay fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* Modal scale animation */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
