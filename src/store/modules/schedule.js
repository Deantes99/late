import moment from 'moment';

const state = {
  date: null,
  in_class: false,
  current: {
    course: {},
    period: {}
  },
  next: {
    course: {},
    period: {}
  },
  periods: []
};

const actions = {
  UPDATE_SCHEDULE({ commit, rootState }) {
    // Reset all state values
    const semester_schedule = rootState.auth.user.current_schedule;

    const now = moment('1430', 'Hmm');
    const dateStr = now.format('YYYY-MM-DD');
    const day = now.day();

    // Find periods for current day
    const day_periods = semester_schedule
      .map(course => course.periods.filter(p => p.day == day))
      .flat();

    // Check for current class
    const current_period = day_periods.find(p => {
      const start = moment(dateStr + ' ' + p.start, 'YYYY-MM-DD Hmm');
      const end = moment(dateStr + ' ' + p.end, 'YYYY-MM-DD Hmm');

      return start < now && now < end;
    });
    const current_course = semester_schedule.find(c =>
      c.periods.includes(current_period)
    );

    commit('UPDATE_SCHEDULE', {
      datetime: now,
      current: {
        course: current_course,
        period: current_period
      },
      periods: day_periods
    });
  }
};

const mutations = {
  UPDATE_SCHEDULE: (state, payload) => {
    state.date = payload.datetime.toDate();
    state.periods = payload.periods;
    state.current = payload.current;
    state.in_class = !!payload.current.period;
  }
};

export default {
  state,
  actions,
  mutations
};
