<template>
  <a-layout>
    <a-layout-header class="header">
      <div class="logo" />
      <a-menu
        v-bind:selectedKeys="selectedKeys1"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item key="1">任务面板</a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content style="padding: 0">
      <a-layout style="padding: 24px 0; background: #fff">
        <a-layout-sider width="200" style="background: #fff">
          <a-menu
            v-model:selectedKeys="selectedKeys"
            v-model:openKeys="openKeys"
            mode="inline"
            style="height: 100%"
            @click="clickMenu"
          >
            <a-sub-menu v-for="item in menu" v-bind:key="item.name">
              <template #title>
                <span>
                  <user-outlined />
                  {{ item.name }}
                </span>
              </template>
              <a-menu-item v-for="subitem in item.queues" v-bind:key="subitem">
                {{ subitem }}
              </a-menu-item>
            </a-sub-menu>
          </a-menu>
        </a-layout-sider>
        <a-layout-content :style="{ padding: '0 24px', minHeight: '280px' }">
          <!--content -->
          <JobTag ref="jobTagRef" :name="name" :queueName="queueName"/>
          <!--content -->
        </a-layout-content>
      </a-layout>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      Ant Design ©2018 Created by Ant UED
    </a-layout-footer>
  </a-layout>
</template>
<script lang="ts">
import { UserOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, ref } from "vue";
import { get } from "./request";
import JobTag from "./components/jobtag.vue";
export default defineComponent({
  components: {
    UserOutlined,
    JobTag,
  },
  setup() {
    let selectedKeys = ref<string[]>(["empty"]);
    let openKeys = ref<string[]>(["default"]);
    let menu = ref([
      {
        name: "default",
        queues: ["empty"],
      },
    ]);
    let name = ref("default");
    let queueName = ref("empty");
    onMounted(() => {
      get("/job/instance/list", {})
        .then((response) => {
          if (response.data.length > 0) {
            menu.value = response.data;
            if (response.data.length > 0) {
              name.value = response.data[0].name;
              openKeys.value = [response.data[0].name];
            }
            if (response.data[0].queues.length > 0) {
              queueName.value = response.data[0].queues[0];
              selectedKeys.value = [response.data[0].queues[0]];
            }
          }else{
            menu.value = [
            {
              name: "default",
              queues: ["empty"],
            },
          ];
          }
        })
        .catch((err) => {
          menu.value = [
            {
              name: "default",
              queues: ["empty"],
            },
          ];
        });
    });
    const clickMenu = (data: any) => {
      name.value = data.keyPath[0];
      queueName.value = data.keyPath[1];
    };
    return { selectedKeys, openKeys, menu, name, queueName, clickMenu };
  },
});
</script>
<style>
#components-layout-demo-top-side .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}
</style>
