<template>
  <a-tabs type="card" v-model="activeKey" size="small" @change="tabChange">
    <a-tab-pane key="waiting" :tab="'等待中(' + jobCount.waiting + ')'">
      <JobTable
        :name="name"
        :queueName="queueName"
        status="waiting"
        :count="jobCount.waiting"
        :refresh="refresh"
        :currentStatus="currentStatus"
      />
    </a-tab-pane>
    <a-tab-pane key="active" :tab="'处理中(' + jobCount.active + ')'">
      <JobTable
        :name="name"
        :queueName="queueName"
        status="active"
        :count="jobCount.active"
        :refresh="refresh"
        :currentStatus="currentStatus"
      />
    </a-tab-pane>
    <a-tab-pane key="completed" :tab="'已完成(' + jobCount.completed + ')'">
      <JobTable
        :name="name"
        :queueName="queueName"
        status="completed"
        :count="jobCount.completed"
        :refresh="refresh"
        :currentStatus="currentStatus"
      />
    </a-tab-pane>
    <a-tab-pane key="delayed" :tab="'延迟中(' + jobCount.delayed + ')'">
      <JobTable
        :name="name"
        :queueName="queueName"
        status="delayed"
        :count="jobCount.delayed"
        :refresh="refresh"
        :currentStatus="currentStatus"
      />
    </a-tab-pane>
    <a-tab-pane key="failed" :tab="'失败(' + jobCount.failed + ')'">
      <JobTable
        :name="name"
        :queueName="queueName"
        status="failed"
        :count="jobCount.failed"
        :refresh="refresh"
        :currentStatus="currentStatus"
      />
    </a-tab-pane>
    <a-tab-pane key="paused" :tab="'暂停(' + jobCount.paused + ')'">
      <JobTable
        :name="name"
        :queueName="queueName"
        status="paused"
        :count="jobCount.paused"
        :refresh="refresh"
        :currentStatus="currentStatus"
      />
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { get } from "../request";
import JobTable from "./jobtable.vue";
export default defineComponent({
  name: "JobTag",
  data() {
    return {};
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
      get("/job/count", { name: props.name, queue_name: props.queueName })
        .then((response) => {
          jobCount.value = response.data;
        })
        .catch((err) => {
          console.log(err);
        });
    };
    watch(
      () => [props.name, props.queueName],
      (newData, oldData) => {
        getJobCount();
      },
      {
        deep: true,
        immediate: true,
      }
    );
    let timer: number = 0;
    onMounted(() => {
      getJobCount();
      timer = setInterval(getJobCount, 5000);
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });
    const refresh = ref("");
    const currentStatus=ref('waiting');
    const tabChange = function (activeKey: any) {
      refresh.value = activeKey;
      currentStatus.value=activeKey;
    };
    return {
      activeKey: ref("waiting"),
      jobCount,
      getJobCount,
      refresh,
      tabChange,
      currentStatus
    };
  },
  watch: {},
  methods: {},
});
</script>

