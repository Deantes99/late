<template>
  <table class="table is-full-width">
    <thead class="is-unselectable">
      <tr>
        <th>Day</th>
        <th>Time</th>
        <th>Location</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="p in periods"
        :key="p.day + p.start"
      >
        <td>{{ day(p.day) }}</td>
        <td>
          {{ time(p.start) }}
          <span class="has-text-grey-light">
            -
          </span>
          {{ time(p.end) }}
        </td>
        <td>{{ p.location }}</td>
        <td>{{ type(p.type) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import moment from 'moment';

export default {
  name: 'CoursePeriodsTable',
  props: {
    periods: {
      type: Array,
      required: true
    }
  },
  methods: {
    time: t => {
      const dt = moment(t, 'Hmm', true);
      if (dt.hours() === 12 && dt.minutes() === 0) {
        return 'Noon';
      } else if (dt.minutes() === 0) {
        return dt.format('ha');
      }
      return dt.format('h:mma');
    },
    day: num =>
      [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ][num],
    type (pType) {
      return this.$store.getters.periodType(pType);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
