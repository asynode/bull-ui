<template>
  <a-tabs type="card" v-model="activeKey" size="small">
    <a-tab-pane key="1" :tab="'等待中(' + jobCount.waiting + ')'">
      <JobTable :name="name" :queueName="queueName" status="waiting" />
    </a-tab-pane>
    <a-tab-pane key="2" :tab="'处理中(' + jobCount.active + ')'">
      <JobTable :name="name" :queueName="queueName" status="active" />
    </a-tab-pane>
    <a-tab-pane key="3" :tab="'已完成(' + jobCount.completed + ')'">
      <JobTable :name="name" :queueName="queueName" status="completed" />
    </a-tab-pane>
    <a-tab-pane key="4" :tab="'延迟中(' + jobCount.delayed + ')'">
      <JobTable :name="name" :queueName="queueName" status="delayed" />
    </a-tab-pane>
    <a-tab-pane key="5" :tab="'失败(' + jobCount.failed + ')'">
      <JobTable :name="name" :queueName="queueName" status="failed" />
    </a-tab-pane>
    <a-tab-pane key="6" :tab="'暂停(' + jobCount.paused + ')'">
      <JobTable :name="name" :queueName="queueName" status="paused" />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { get } from "../request";
import JobTable from "./jobtable.vue";
export default defineComponent({
  name: "JobTag",
  data() {
    return {
    };
  },
  props: {
    name: String,
    queueName: String,
  },
  components: {
    JobTable,
  },
  setup(props) {
    const jobCount = ref({
      completed: 0,
      waiting: 0,
      active: 0,
      delayed: 0,
      failed: 0,
      paused: 0,
    });
    const getJobCount = () => {
      if (!props.name || !props.queueName) {
        return;
      }
      get("/job/count", { name: props.name, queue_name: props.queueName }).then(
        (response) => {
          jobCount.value = response.data;
        }
      ).catch(err=>{
        console.log(err);
      });
    };
    watch(
      () => props.name,
      () => {
        getJobCount();
      },
      {
        deep: true,
        immediate: true,
      }
    );
    watch(
      () => props.queueName,
      () => {
        getJobCount();
      }
    );
    onMounted(() => {
      getJobCount();
      const timer = setInterval(getJobCount, 5000);
    });
    return { activeKey: ref("1"), jobCount, getJobCount };
  },
  watch: {},
  methods: {},
});
</script>

