<template>
  <div>
    <a-button type="primary" :size="small" @click="showModal">添加JOB</a-button>
    <a-table
      :columns="columns"
      :data-source="jobs.items"
      bordered
      :pagination="pagination"
      @change="changePagination"
      rowKey="id"
      :loading="tableLoading"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex == 'progress'">
          <a-progress type="circle" :percent="text" :width="35" />
        </template>
        <template v-if="column.dataIndex == 'attemptsMade'">
          {{ text === "0" ? "否" : "是" }}
        </template>
        <template v-if="column.dataIndex == 'opts.attempts'">
          {{ text }}次
        </template>
        <template v-if="column.dataIndex == 'other'">
          <a-popconfirm :title="text" ok-text="Yes" cancel-text="No">
            <a href="#">查看</a>
          </a-popconfirm>
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <p
          style="
            margin: 0;
            width: 100%;
            white-space: break-spaces;
            word-break: break-all;
          "
        >
          {{ record.data }}
        </p>
      </template>
      <template #action="{ record }">
        <div style="width: 130px">
          <a-button
            type="link"
            :size="small"
            style="margin: 0px 2px 0px 0px"
            @click="
              () => {
                detailJobData = record;

                detailVisible = true;
              }
            "
            >详情</a-button
          >
          <a-button type="link" :size="small" @click="jobLogClick(record.id)"
            >日志</a-button
          >
        </div>

        <div style="width: 130px; margin: 5px 0px 0px 0px">
          <a-button
            type="link"
            :size="small"
            style="margin: 0px 2px 0px 0px"
            @click="retryJob(record.id)"
            >重试</a-button
          >
          <a-popconfirm
            title="确认删除此任务吗？"
            ok-text="Yes"
            cancel-text="No"
            @confirm="deleteJob(record.id)"
            @cancel="cancel"
          >
            <a href="#"><a-button type="link" :size="small">删除</a-button></a>
          </a-popconfirm>
        </div>
      </template>
    </a-table>
    <div>
      <a-modal
        :visible="visible"
        title="添加JOB"
        @ok="onSubmit"
        @cancel="modelHandleCancel"
        cancelText="取消"
        okText="提交"
      >
        <a-form
          :model="addJobData"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="rules"
          ref="formRef"
        >
          <a-form-item label="job数据" name="data">
            <a-textarea v-model:value="addJobData.data" :rows="8" />
          </a-form-item>
          <a-form-item label="延时(毫秒)" name="delay">
            <a-input v-model:value="addJobData.delay" />
          </a-form-item>
          <a-form-item label="优先级" name="priority">
            <a-input v-model:value="addJobData.priority" />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>

    <div>
      <a-modal
        :visible="detailVisible"
        title="详情"
        @ok="onDetailSubmit"
        @cancel="onDetailCancel"
        cancelText="取消"
        okText="提交"
      >
        <a-form
          :model="detailJobData"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-form-item label="ID" name="id">
            <a-input v-model:value="detailJobData.id" />
          </a-form-item>
          <a-form-item label="数据" name="data">
            <a-textarea v-model:value="detailJobData.data" :rows="8" />
          </a-form-item>
          <a-form-item label="进度" name="progress">
            <a-progress :percent="detailJobData.progress" status="active" />
          </a-form-item>
          <a-form-item label="重试次数" name="opts.attempts">
            <a-input v-model:value="detailJobData.opts.attempts" />
          </a-form-item>
          <a-form-item label="延时(毫秒)" name="delay">
            <a-input v-model:value="detailJobData.opts.delay" />
          </a-form-item>
          <a-form-item label="优先级" name="priority">
            <a-input v-model:value="detailJobData.opts.priority" />
          </a-form-item>
          <a-form-item label="创建时间" name="optstimestamp">
            <a-input v-model:value="detailJobData.opts.timestamp" />
          </a-form-item>
          <a-form-item label="完成时间" name="timestamp">
            <a-input v-model:value="detailJobData.timestamp" />
          </a-form-item>
        </a-form>
        <template #footer>
          <a-button key="back" @click="onDetailCancel">关闭</a-button>
        </template>
      </a-modal>
    </div>

    <div>
      <a-modal
        :visible="jobLogVisible"
        title="任务日志"
        @ok="onJobLogSubmit"
        @cancel="onJobLogCancel"
        cancelText="取消"
        okText="提交"
        :width="750"
      >
        <a-table
          :columns="logColumns"
          :data-source="logData.items"
          :showHeader="false"
          bordered
          :pagination="logPagination"
          @change="logChangePagination"
          :size="small"
        >
          <template #logContent="{ text }">
            <a>{{ text }}</a>
          </template>
        </a-table>
        <template #footer>
          <a-button key="back" @click="onJobLogCancel">关闭</a-button>
        </template>
      </a-modal>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, toRaw, watch } from "vue";
import { get, post, requestdelete, requestput } from "../../request";
import { message } from "ant-design-vue";
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "进度",
    dataIndex: "progress",
    key: "progress",
    slots: { customRender: "bodyCell" },
  },
  {
    title: "重试",
    dataIndex: "opts.attempts",
    key: "opts.attempts",
    slots: { customRender: "bodyCell" },
  },
  {
    title: "创建时间",
    dataIndex: "opts.timestamp",
  },
  {
    title: "完成时间",
    dataIndex: "timestamp",
    key: "timestamp",
  },
  {
    title: "可重复任务",
    dataIndex: "attemptsMade",
    key: "attemptsMade",
    slots: { customRender: "bodyCell" },
  },
  {
    title: "其它信息",
    dataIndex: "other",
    key: "other",
    slots: { customRender: "bodyCell" },
  },
  {
    title: "操作",
    key: "action",
    slots: { customRender: "action" },
  },
];
const logColumns = [
  {
    title: "log",
    dataIndex: "",
    key: "",
    slots: { customRender: "logContent" },
  },
];
export default defineComponent({
  data() {
    return {
      logData: { items: [], pagination: {} },
      logPagination: {
        current: 1,
        pageSize: 8,
        total: 0,
      },
      currentJobId: 0,
    };
  },
  props: {
    name: String,
    queueName: String,
    status: String,
  },
  setup(props) {
    let pagination = ref({
      current: 1,
      pageSize: 20,
      total: 0,
    });
    let jobs = ref({ items: [], pagination: {} });
    let tableLoading = ref(true);
    const getJobs = () => {
      if (!props.name || !props.queueName) {
        tableLoading.value = false;
        return;
      }
      get("/job/list", {
        name: props.name,
        queue_name: props.queueName,
        status: props.status,
        page_size: pagination.value.pageSize,
        page_num: pagination.value.current,
      })
        .then((response) => {
          tableLoading.value = false;
          let result = response.data;
          result.items.forEach((element: any) => {
            element.data = JSON.stringify(element.data, null, 4);
            element.other = JSON.stringify(element.opts, null, 4);
            element.timestamp = new Date(element.timestamp)
              .toJSON()
              .replace("T", " ");
            element.opts.timestamp = new Date(element.opts.timestamp)
              .toJSON()
              .replace("T", " ");
          });
          jobs.value = result;
          pagination.value = {
            current: response.data.pagination.num,
            pageSize: response.data.pagination.size,
            total: response.data.pagination.total,
          };
        })
        .catch(() => {
          tableLoading.value = false;
        });
    };
    watch(
      () => props.name,
      () => {
        getJobs();
      }
    );
    watch(
      () => props.queueName,
      () => {
        getJobs();
      }
    );

    const visible = ref<boolean>(false);
    let addJobData = reactive({ data: "", delay: 0, priority: 0 });
    const showModal = () => {
      visible.value = true;
    };

    const modelHandleOk = (e: MouseEvent) => {
      console.log(e);
      visible.value = false;
    };
    const modelHandleCancel = (e: MouseEvent) => {
      console.log(e);
      visible.value = false;
    };

    const formRef = ref();
    const onSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          //console.log("values", addJobData, toRaw(addJobData));
          post("/job", {
            name: props.name,
            queue_name: props.queueName,
            data: addJobData.data,
            delay: addJobData.delay,
            priority: addJobData.priority,
          })
            .then(() => {
              message.success("添加成功");
              visible.value = false;
              addJobData.data = "";
              addJobData.delay = 0;
              addJobData.priority = 0;
              getJobs();
            })
            .catch(() => {
              message.error("添加失败");
            });
        })
        .catch((error: any) => {
          console.log("error", error);
        });
    };
    const rules = {
      data: [
        {
          required: true,
          message: "Please input data",
          trigger: "change",
        },
      ],
      delay: [
        {
          required: true,
          message: "Please input delay",
          trigger: "change",
          type: "number",
          transform: function (value: string) {
            if (typeof value == "number") return value;
            if (!value) return value;
            const ret = Number(value);
            if (isNaN(ret)) return value;
            return ret;
          },
        },
      ],
      priority: [
        {
          required: true,
          message: "Please input priority",
          trigger: "change",
          type: "number",
          transform: function (value: string) {
            if (typeof value == "number") return value;
            if (!value) return value;
            const ret = Number(value);
            if (isNaN(ret)) return value;
            return ret;
          },
        },
      ],
    };

    const detailVisible = ref(false);
    const onDetailSubmit = (e: MouseEvent) => {
      console.log(e);
      detailVisible.value = false;
    };
    const onDetailCancel = (e: MouseEvent) => {
      console.log(e);
      detailVisible.value = false;
    };
    const detailJobData = reactive({ opts: {} });

    const jobLogVisible = ref(false);
    const onJobLogSubmit = (e: MouseEvent) => {
      console.log(e);
      jobLogVisible.value = false;
    };
    const onJobLogCancel = (e: MouseEvent) => {
      console.log(e);
      jobLogVisible.value = false;
    };

    return {
      columns,
      logColumns,
      getJobs,
      tableLoading,
      pagination,
      jobs,
      visible,
      showModal,
      modelHandleOk,
      modelHandleCancel,
      addJobData,
      rules,
      onSubmit,
      formRef,
      labelCol: { span: 5 },
      wrapperCol: { span: 20 },
      detailVisible,
      onDetailSubmit,
      onDetailCancel,
      detailJobData,
      jobLogVisible,
      onJobLogSubmit,
      onJobLogCancel,
    };
  },
  mounted() {
    this.getJobs();
  },
  methods: {
    changePagination(page: any) {
      this.pagination.current = page.current;
      this.pagination.pageSize = page.pageSize;
      this.getJobs();
    },
    logChangePagination(page: any) {
      this.logPagination.current = page.current;
      this.logPagination.pageSize = page.pageSize;
      this.getJobLogs();
    },
    getJobLogs() {
      get("/job/log", {
        name: this.name,
        queue_name: this.queueName,
        id: this.currentJobId,
        page_size: this.logPagination.pageSize,
        page_num: this.logPagination.current,
      }).then((response) => {
        this.logData = response.data;
        this.logPagination = {
          current: response.data.pagination.num,
          pageSize: response.data.pagination.size,
          total: response.data.pagination.total,
        };
      });
    },
    jobLogClick(jobId: any) {
      this.logPagination.current = 1;
      this.logPagination.pageSize = 8;
      this.logPagination.total = 0;
      this.currentJobId = jobId;
      this.jobLogVisible = true;
      this.getJobLogs();
    },
    deleteJob(jobId: string) {
      requestdelete("/job", {
        name: this.name,
        queue_name: this.queueName,
        id: jobId,
      })
        .then(() => {
          this.getJobs();
          message.success("删除成功");
        })
        .catch((error: any) => {
          if (error.response && error.response.data) {
            message.error(error.response.data);
          } else {
            message.error(error);
          }
        });
    },
    retryJob(jobId: string) {
      requestput("/job", {
        name: this.name,
        queue_name: this.queueName,
        id: jobId,
      })
        .then(() => {
          this.getJobs();
          message.success("重试成功");
        })
        .catch((error: any) => {
          if (error.response && error.response.data) {
            message.error(error.response.data);
          } else {
            message.error(error);
          }
        });
    },
  },
});
</script>
<style>
th.column-money,
td.column-money {
  text-align: right !important;
}
</style>

