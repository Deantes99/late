<template>
  <div class="box assessments-filter is-flex">
    <div class="courses">
      <span
        class="subtitle is-6"
        style="margin-right: 5px"
      >Filter</span>
      <span
        v-for="c in courses"
        :key="c.crn"
        class="tag is-white course-tag level-item is-unselectable"
        :class="{ 'filtered-out': filter.includes(c.crn) }"
        :style="{ 'background-color': c.color }"
        :title="c.longname"
        @click="$emit('toggle-filter', c)"
      >
        <span>{{ c.longname }}</span>
      </span>
    </div>
    <label
      v-if="showShowCompleted"
      class="checkbox is-unselectable tooltip show-completed-toggle"
      data-tooltip="Toggle completed assignments."
    >
      <input
        :checked="showCompleted"
        type="checkbox"
        @change="$emit('toggle-show-completed')"
      >
      Show Completed
    </label>
    <select
      v-if="showGroupBy"
      class="group-by-select"
      @change="$emit('change-group-by', $event.target.value)"
    >
      <option
        value="dueDate"
        :selected="groupBy === 'dueDate'"
      >
        Group by Due Date
      </option>
      <option
        value="course"
        :selected="groupBy === 'course'"
      >
        Group by Course
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'AssessmentFilter',
  props: {
    filter: {
      type: Array,
      required: true
    },
    showShowCompleted: {
      type: Boolean,
      default: false,
      required: false
    },
    showCompleted: {
      type: Boolean,
      default: true,
      required: false
    },
    showGroupBy: {
      type: Boolean,
      default: false,
      required: false
    },
    groupBy: {
      type: String,
      default: 'dueDate',
      required: false
    }
  },
  computed: {
    courses () {
      return this.$store.getters.current_schedule;
    }
  }
};
</script>

<style lang="scss" scoped>
.assessments-filter {
  align-items: center;
  justify-content: center;

  .subtitle {
    margin: 0;
  }
  label {
    flex: 1;
    padding: 0 10px;
  }
  padding: 10px;
  margin: 0;
  margin-bottom: 20px;
}
span.tag.course-tag {
  cursor: pointer;
  margin: 0 2px;
  color: white;

  span {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s ease-out;
  }
  &.filtered-out {
    color: #686868 !important;
    background-color: rgb(214, 214, 214) !important;
  }
  &:hover {
    opacity: 0.8;
  }
}
</style>
