<template>
  <div class="past-assignments">
    <h2 class="subtitle">
      Week of {{ weekOf }}
    </h2>

    <div class="is-flex-tablet">
      <button
        class="button"
        :class="{ 'is-loading': loading }"
        @click="shiftDates(-7)"
      >
        <span class="icon">
          <i class="fas fa-chevron-left" />
        </span>
      </button>
      <div class="field is-horizontal">
        <div class="field-body">
          <div class="control">
            <input
              id="start"
              :value="startDate"
              class="input"
              type="date"
              min="2018-09-01"
              :max="endDate"
              disabled
            >
          </div>
        </div>
      </div>

      <div
        style="flex: 1"
        class="buttons is-centered"
      >
        <div class="field is-horizontal">
          <div class="field-body">
            <div
              class="control"
              style="margin-right:1em;"
            >
              <input
                id="assignmentFilter"
                v-model="assignmentFilter"
                class="input"
                type="text"
                placeholder="Filter Assignments"
              >
            </div>
          </div>

          <button
            class="button is-primary"
            :disabled="isLastWeek"
            @click="gotoLastWeek"
          >
            Last Week
          </button>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-body">
          <div class="control">
            <input
              id="end"
              :value="endDate"
              class="input"
              type="date"
              min="2018-09-01"
              :max="today"
              disabled
            >
          </div>
        </div>
      </div>

      <button
        class="button"
        :class="{ 'is-loading': loading }"
        :disabled="!canGoForward"
        @click="shiftDates(7)"
      >
        <span class="icon">
          <i class="fas fa-chevron-right" />
        </span>
      </button>
    </div>

    <AssignmentsTable
      :assignments="filtered"
      :show-remove-button="true"
      @remove-assignment="removeAssignment"
    />

    <p
      v-if="filtered.length === 0"
      class="has-text-centered has-text-grey"
    >
      No assignments
      <i
        v-if="filter.length > 0 || !showCompleted"
        style="font-style:inherit"
      >matching your filters.</i>
      <i
        v-if="filter.length <= 0"
        style="font-style:inherit"
      >this month!</i>
    </p>
  </div>
</template>

<script>
import moment from 'moment';

import AssignmentsTable from '@/views/components/assignments/AssignmentsTable';

export default {
  name: 'AssignmentsPastList',
  components: { AssignmentsTable },
  props: {
    showCompleted: {
      type: Boolean,
      default: true
    },
    filter: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      assignmentFilter: '',
      loading: true,
      startDate:
        this.$route.query.start ||
        moment()
          .subtract(7, 'days')
          .format('YYYY-MM-DD'),
      endDate: this.$route.query.end || moment().format('YYYY-MM-DD'),
      currentAssignments: []
    };
  },
  computed: {
    canGoForward () {
      return this.endMoment.isBefore(moment().startOf('day'));
    },
    startMoment () {
      return moment(this.startDate, 'YYYY-MM-DD', true);
    },
    endMoment () {
      return moment(this.endDate, 'YYYY-MM-DD', true);
    },
    isLastWeek () {
      return this.endMoment.isSame(moment(), 'day');
    },
    weekOf () {
      return this.startMoment.format('dddd, MMMM Do YYYY');
    },
    range () {
      return this.endMoment.diff(
        moment(this.startDate, 'YYYY-MM-DD', true),
        'days'
      );
    },
    today: () => moment().format('YYYY-MM-DD'),
    yesterday: () =>
      moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD'),
    filtered () {
      return this.currentAssignments.filter(a => {
        if (!this.showCompleted && a.completed) return false;
        if (this.assignmentFilter.length > 0) {
          return (
            !this.filter.includes(this.course(a).crn) &&
            a.title.toLowerCase().includes(this.assignmentFilter.toLowerCase())
          );
        }
        return !this.filter.includes(this.course(a).crn);
      });
    }
  },
  created () {
    this.getAssignments();
  },
  methods: {
    async removeAssignment (assignment) {
      // Confirm user wants to remove assignment
      if (
        !confirm(
          `Are you sure you want to remove assignment ${assignment.title}?`
        )
      ) {
        return;
      }

      // This handles the API call and state update
      await this.$http.delete(`/assignments/a/${assignment._id}`);

      this.currentAssignments = this.currentAssignments.filter(
        a => a._id !== assignment._id
      );

      // Notify user of success
      this.$toasted.success(
        `Successfully removed assignment past '${assignment.title}'.`,
        {
          icon: 'times',
          action: {
            text: 'Undo'
          }
        }
      );
    },
    gotoLastWeek () {
      this.endDate = this.today;
      this.startDate = moment()
        .subtract('1', 'week')
        .format('YYYY-MM-DD');

      this.getAssignments();
    },
    shiftDates (amount) {
      this.startDate = moment(this.startDate, 'YYYY-MM-DD', true)
        .add(amount, 'days')
        .format('YYYY-MM-DD');
      this.endDate = moment(this.endDate, 'YYYY-MM-DD', true)
        .add(amount, 'days')
        .format('YYYY-MM-DD');

      this.getAssignments();
    },
    async getAssignments () {
      this.loading = true;
      let request;

      try {
        request = await this.$http.get('/assignments', {
          params: { start: this.startDate, end: this.endDate }
        });
      } catch (e) {
        this.loading = false;
        this.currentAssignments = [];
        return this.$toasted.error(e.response.data.message);
      }

      this.currentAssignments = request.data.assignments;
      this.loading = false;
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShorterString: dueDate => moment(dueDate).format('M/DD/YY'),
    toTimeString: time => moment(time).format('h:mm a')
  }
};
</script>

<style lang="scss" scoped>
.dot {
  margin-right: 5px;
}

.assignment-link {
  color: inherit;
}

.fas {
  &.fa-check {
    color: green;
  }

  &.fa-times {
    color: red;
  }
}
</style>
