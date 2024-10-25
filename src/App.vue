<template>
    <div class="wrap" id="app">
        <div class="sider">
            <h1>体温和用药记录工具</h1>
            <form @submit.prevent="addRecord">
                <label>时间：</label>
                <input v-model="newRecord.time" type="datetime-local" required placeholder="记录时间"/>

                <label>体温 (℃)：</label>
                <input v-model.number="newRecord.temperature" type="number" step="0.1" placeholder="体温 (支持一位小数)"/>

                <label>药名 (可选)：</label>
                <input v-model="newRecord.medicine" type="text" placeholder="药名"/>

                <label>剂量 (可选)：</label>
                <input v-model="newRecord.dose" type="text" placeholder="剂量"/>

                <button type="submit">保存</button>
            </form>

            <div class="temp-recored">
                <ul>
                    <template v-for="(record, index) in tempRecords">
                        <li  :key="index" :class="{ 'highlight': editingIndex === index, 'waring': record.temperature > 37.5  }">
                            <span><small>{{ record.time | datePipe }}</small> </span>
                            <span class="temperature"><big>{{ record.temperature }}</big>℃</span>
                            <span v-if="record.medicine"> {{ record.medicine }}{{ record.dose }}</span>
                            <div class="actions">
                                <button @click="editRecord(index)">编辑</button>
                                <button @click="deleteRecord(index)">删除</button>
                            </div>
                        </li>
                    </template>

                </ul>
            </div>
        </div>

        <div ref="chart" style="width: 100%; height: 600px; margin-top: 20px;"></div>
    </div>
</template>

<script>
    import * as echarts from 'echarts';
    import {TEMPDATA} from "@/datas/tempdata";
    import {datePipe} from "@/utils/filter";

    export default {
        data() {
            return {
                tempRecords: TEMPDATA,
                newRecord: {
                    time: '',
                    temperature: null,
                    medicine: '',
                    dose: ''
                },
                editingIndex: null  // 当前正在编辑的记录的索引
            };
        },
        methods: {
            addRecord() {
                if (this.newRecord.temperature || this.newRecord.medicine) {
                    if (this.editingIndex !== null) {
                        this.tempRecords[this.editingIndex] = {...this.newRecord};
                        this.editingIndex = null;
                    } else {
                        this.tempRecords.push({...this.newRecord});
                    }
                    this.saveRecordsToLocalStorage();
                    this.renderChart();
                    this.newRecord = {time: '', temperature: null, medicine: '', dose: ''};
                } else {
                    alert('请输入体温或用药名称');
                }
            },
            editRecord(index) {
                this.newRecord = {...this.tempRecords[index]};
                this.editingIndex = index;
            },
            deleteRecord(index) {
                this.tempRecords.splice(index, 1);
                this.saveRecordsToLocalStorage();
                this.renderChart();
            },
            saveRecordsToLocalStorage() {
                localStorage.setItem('tempRecords', JSON.stringify(this.tempRecords));
            },
            loadRecordsFromLocalStorage() {
                const records = localStorage.getItem('tempRecords');
                if (records) {
                    this.tempRecords = JSON.parse(records);
                }
            },
            renderChart() {
                const chart = echarts.init(this.$refs.chart);

                const options = {
                    title: {
                        text: '体温和用药记录'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    grid: {
                        show: true
                    },
                    xAxis: {
                        type: 'time',
                        splitLine: {
                            show: true
                        },
                        gridIndex: 0,
                        axisLabel: {
                            formatter: function (value) {
                                const date = new Date(value);
                                return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}\n${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;

                            }
                        },
                    },
                    yAxis: {
                        type: 'value',
                        min: 35,
                        max: 41,
                        interval: 0.5,
                        gridIndex: 0,
                        // axisLabel: {
                        //     formatter: function (value){
                        //         return value
                        //     }
                        // },
                    },
                    series: [{
                        name: '体温',
                        data: this.tempRecords.map(record => (
                            {
                                value: [record.time, record.temperature],
                                lineStyle: {
                                    color: record.temperature > 38 ? 'red' : '#42b983'  // 根据体温动态设置颜色
                                }
                            }
                        )),
                        type: 'line',
                        smooth: true,
                        markPoint: {
                            data: this.tempRecords
                                .filter(record => record.medicine)
                                .map(record => ({
                                    name: '用药',
                                    value: `${record.temperature || ''}\n${record.medicine || ''}${record.dose || ''}`,
                                    xAxis: record.time,
                                    yAxis: record.temperature
                                }))
                        },
                        lineStyle: {
                            color: '#42b983',  // 默认线条颜色
                            width: 2
                        }
                    }]
                };

                chart.setOption(options);
            }
        },
        mounted() {
            this.loadRecordsFromLocalStorage();
            this.renderChart();
        },
        filters: {
            datePipe: datePipe
        }
    };
</script>

<style lang="scss">


  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
    margin-bottom: 20px;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 3;
  }

  button {
    padding: 10px;
    background-color: #42b983;
    color: white;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background-color: #369874;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }


  .wrap {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
  }

  .sider {
    height: 100vh;
    overflow: auto;
    min-width: 300px;
  }

  .temp-recored {
    font-size: 12px;

    li {
      position: relative;
      z-index: 1;
      line-height: 1;
      padding: 9px 8px;
      border-top:dashed 1px #ccc;
      box-sizing: border-box;
      &.highlight {
        background-color: #f0f0f0;
        border-left: 5px solid #42b983;
        .actions{
          display: block;
        }
      }
      &.waring{
        .temperature{
          color:#f00;
          font-weight: bold;
        }
      }
      &:hover {
        .actions {
          display: block;
        }
      }
    }

    .temperature{
      margin:0 10px;
    }

    .actions {
      position: absolute;
      right:0;
      top:0;
      button{
        line-height: 1;
        padding:9px 8px;
        font-size: 11px;
      }
      display: none;
    }


  }
</style>
