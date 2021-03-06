<template>
  <div class="integrations-preferences">
    <form @submit.prevent="save">
      <div
        v-for="(notification, key) in notifications"
        :key="key"
        class="field"
      >
        <label
          class="label"
          :for="key"
        >
          {{ notification.name }}
          <i
            class="fa notification-indicator"
            :class="preferences[key] ? 'fa-check' : 'fa-times'"
          />
        </label>
        <p class="help">
          {{ notification.description }}
        </p>
        <div class="control">
          <select
            :id="key"
            v-model="preferences[key]"
            class="input"
          >
            <option
              v-for="integration in enabledIntegrations[key]"
              :key="integration"
              :value="integration"
            >
              {{ integration | capitalize }}
            </option>
            <option value>
              Disabled
            </option>
          </select>
        </div>
      </div>

      <button
        class="button is-primary"
        :class="{ 'is-loading': loading }"
        :disabled="saved"
      >
        Save
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SetupIntegrationsPreferences',
  filters: {
    capitalize: function (value) {
      if (!value) return '';
      if (value === 'sms') return 'SMS';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  data () {
    return {
      loading: false,
      preferences: Object.assign(
        {},
        this.$store.state.auth.user.notificationPreferences
      )
    };
  },
  computed: {
    saved () {
      if (!this.$store.getters.userSetup.integrations) return false;

      return (
        JSON.stringify(this.preferences) ===
        JSON.stringify(this.user.notificationPreferences)
      );
    },
    user () {
      return this.$store.state.auth.user;
    },
    possibleIntegrations () {
      return {
        preWorkBlockReminders: ['sms', 'discord'],
        postWorkBlockReminders: ['sms', 'discord'],
        morningReports: ['email', 'discord'],
        addAssignmentReminders: ['sms', 'email', 'discord']
      };
    },
    enabledIntegrations () {
      const enabled = {};
      for (let key in this.possibleIntegrations) {
        enabled[key] = this.possibleIntegrations[key].filter(i => {
          if (i === 'email') return true;
          if (this.user.integrations[i].verified) return true;
          return false;
        });
      }
      return enabled;
    },
    notifications () {
      return {
        preWorkBlockReminders: {
          name: 'Remind Before Work Blocks',
          description: 'Enables notifications before each scheduled work block.'
        },
        postWorkBlockReminders: {
          name: 'Remind After Work Blocks',
          description: 'Enables notifications after completing a scheduled work block.'
        },
        morningReports: {
          name: 'Daily Morning Reports',
          description: 'Enables work summary notifications every morning.'
        },
        addAssignmentReminders: {
          name: 'Assignment Reminders',
          description: 'Enables notifications about incomplete assignments'
        }
      };
    }
  },
  methods: {
    async save () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post(
          '/integrations/preferences',
          this.preferences
        );
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      this.$store.dispatch('SET_USER', request.data.updatedUser);

      this.$toasted.success(
        'Successfully updated your notification preferences!'
      );

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.notification-indicator {
  &.fa-check {
    color: green;
  }
  &.fa-times {
    color: red;
  }
}
</style>
